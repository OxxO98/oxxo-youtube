import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

import db_connection from './core/db_connection.js';
import { 
    _checkMecabInstalled, 
    _ensureUtf8CodePage, 
    getReadingWithMecab,
    
    katakanaRegex,
    kanjiRegex,
} from "./core/mecab_module.js";
import * as db_module from "./core/db_module.js";
import logger from "./core/logger.js";

import type { db, Hukumu, TextData, Kanji, Hyouki, jaBun, YTB, Video, koBun } from '../types/db_types.js'

import fs from 'fs';
import { nanoid } from "nanoid";

import path from 'path';
import { assetPath } from './core/path_module.js';

import { guessLanguage } from "./core/ytDlp_module.js";

import _ from 'lodash'

type HukumuHyouki = Hukumu & Hyouki

type SortInteratees = ((o: any) => any) | number

interface DBYtBuns extends YTB {
    title : Video["title"],
    src: Video["src"]
}

interface DBHukumus {
    kanjis: Kanji[];
    title: string;
    src: string;
    ytBId: string;
    jaBId: string;
    koBId: string | null;
    startTime: number;
    endTime: number;
    koText: string;
    jaText: string;
    imi?: string;
    hyId: string;
    textData: TextData[];
    yomi: string;
    hyouki: string;
    tId: string;
    startOffset: number;
    endOffset: number;
    iId: string | null;
}

interface DBJoinData {
    hukumus: DBHukumus[][][];
    tId: string;
}

interface HydrateDBHukumus extends DBHukumus {
    hukumus : HukumuHyouki[];
    jaTextData : TextData[];
    reading : string;
}

interface HydrateDBJoinData {
    hukumus : HydrateDBHukumus[][][];
    tId : string;
}

interface DBTextJoinData {
    title: string;
    src: string;
    lastEditTime: number;
    reading: string;
    hukumus: HukumuHyouki[];
    jaTextData: TextData[];
    ruby: string;
    koBId: string;
    koText: string;
    ytBId: string;
    jaBId: string;
    jaText: string;
    startTime: number;
}

interface FilteredDBTextJoinData {
    buns: {
        match: {
            type: string;
            matchType: string;
            start: number;
            end: number;
            last: number;
        };
        title: string;
        src: string;
        lastEditTime: number;
        reading: string;
        hukumus: HukumuHyouki;
        jaTextData: TextData[];
        ruby: string;
        koBId: string;
        koText: string;
        ytBId: string;
        jaBId: string;
        jaText: string;
        startTime: number;
    }[];
    src: string;
}

interface HukumuIndex {
    hukumuByJaBId : _.Dictionary<Hukumu[]>,
    hyoukiByHyId : Map<string, Hyouki>
}

type ExportJsonJoinData = YTB & koBun & jaBun & {
    reading? : string;
}

async function saveUserId(req : RouterRequest, res : RouterResponse){
    await db_connection( req, res, async (db) => {
        let { userId } = req.body;

        if( db.data.userId == undefined ){
            db.data.userId = userId;

            await db.write();
        }
        
        res.send({
            data : {},
            message : 'success'
        });
    });
}

async function getUserId(req : RouterRequest, res : RouterResponse){
    await db_connection( req, res, async (db) => {

        if( db.data.userId == undefined ){
            res.send({
                data : {},
                message : 'empty'
            });
            return;    
        }
        else{
            res.send({
                data : { userId : db.data.userId },
                message : 'success'
            });
            return;  
        }        
    });
}

async function getVideo(req : RouterRequest, res : RouterResponse){
    await db_connection( req, res, async (db) => {
        let { opt_disabled } = req.query;

        let disabled = opt_disabled ?? 'true';

        let videos = db.data.videos.sort( (a, b) => {
            if( a.lastEditTime === undefined ){
                return 1;
            }
            if( b.lastEditTime === undefined ){
                return -1;
            }
            if( a.lastEditTime != undefined && b.lastEditTime != undefined ){
                return b.lastEditTime - a.lastEditTime;
            }

            return 0;
        })
        .filter( (v) => {
            if( disabled == 'true' ){
                return v.disabled == undefined || v.disabled == false 
            }
            else{
                return true
            }
        });

        res.send({
            data : videos,
            message : 'success'
        });
    });
}

async function postVideo(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async (db) => {
        let { youtubeSrc, title, direction } = req.body;
        
        logger.info( db_module.logVideoInsert(title, youtubeSrc) );
        db.data.videos.push({ title : title, src : youtubeSrc, timeline : [], tags : [], lastEditTime : Date.now(), direction : direction });

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function editVideo(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async (db) => {
        let { videoId, newTitle, newTagsQuery, disabled } = req.body;
        
        logger.info( db_module.logVideoUpdate( videoId, newTitle, newTagsQuery, disabled) )
        let video = db.data.videos.find( (v) => v.src == videoId );

        if( newTitle != undefined ){
            video.title = newTitle;
        }
        if( newTagsQuery != undefined ){
            video.tags = newTagsQuery.split("@");
        }
        if( disabled != undefined ){
            video.disabled = disabled == 1 ? true : false;
        }

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function deleteVideo(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async (db) => {
        let { videoId, option } = req.query;

        let _option = option ?? 'true'; // true일 경우 audio및 기타 파일 삭제

        let video = db.data.videos.find( (v) => v.src == videoId );
        
        for( let v of video.timeline ){
            let jaBId = v.jaBId;
            let ytBId = v.ytBId;
            //from DeleteHukumuBun
            //문장 삭제가 반영이 안됨.
            let hukumus = await db_module.getHukumu(db, jaBId);

            for( let hukumu of hukumus ){
                if( await db_module.getMoreExistHyId(db, hukumu.hyId) == false ){
                    console.log('더이상 쓰이지 않는 표기 : 삭제');
                    logger.info( db_module.logHyoukiDelete(hukumu.hyId) );
                    await db_module.deleteHyouki(db, hukumu.hyId);

                    let kIds = await db_module.getKIds(db, hukumu.hyId);
                    for( let kId of kIds ){
                        let moreExistKanji = await db_module.getMoreExistKanji(db, hukumu.hyId, kId);
                        if( !moreExistKanji ){
                            logger.info( db_module.logKanjiDelete(kId) );
                            await db_module.deleteKanji(db, kId);
                        }
                    }

                    logger.info( db_module.logKomuDelete(hukumu.hyId) );
                    await db_module.deleteKomu( db, hukumu.hyId );
                }
                if( await db_module.getMoreExistTId( db, hukumu.tId ) == false ){
                    console.log('더이상 쓰이지 않는 단어 : 삭제');
                    logger.info( db_module.logTangoDelete(hukumu.tId) );
                    db.data.tango = db.data.tango.filter( (v) => v.tId != hukumu.tId );
                }
                console.log('HUKUMU 삭제');
                logger.info( db_module.logHukumuDelete( jaBId, hukumu.startOffset, hukumu.endOffset ) );
                await db_module.deleteHukumu( db, jaBId, hukumu.startOffset, hukumu.endOffset );
            }

            logger.info( db_module.logJaBunDeleteYtBId(ytBId) );
            db.data.jaBuns = db.data.jaBuns.filter( (v) => v.ytBId != ytBId );
            logger.info( db_module.logKoBunDeleteYtBId(ytBId) );
            db.data.koBuns = db.data.koBuns.filter( (v) => v.ytBId != ytBId );
            logger.info( db_module.logYTBDelete(ytBId) );
            await db_module.deleteYTBun(db, videoId, ytBId);
        }

        logger.info( db_module.logVideoDelete(videoId) );
        db.data.videos = db.data.videos.filter( (v) => v.src != videoId );
        
        await db.write();

        if( _option == 'true' ){
            let _transcriptPath = path.join(assetPath, '/transcript'); 

            let _dir = fs.readdirSync(_transcriptPath);
            let filtered = _dir.filter( (v) => v.includes(videoId) );

            for await(let file of filtered){
                let _deleteFile = path.join(_transcriptPath, file);
                if( fs.existsSync(_deleteFile) == true){
                    fs.unlinkSync(_deleteFile);
                }
            }
        }

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function getVideoInfo(req : RouterRequest, res : RouterResponse){
    await db_connection( req, res, async(db) => {
        let { videoId } = req.query;

        let video = db.data.videos.find( (v) => v.src == videoId );

        if( video == undefined ){
            res.send({
                data : {},
                message : 'error'
            })
            return
        }
        
        

        res.send({
            data : video,
            message : 'success'
        })
    });
}

async function getVideoLang(req : RouterRequest, res : RouterResponse){
    let { videoId } = req.query;

    let lang = await guessLanguage(videoId);

    res.send({
        data : { lang : lang },
        message : 'success'
    })
}

async function searchVideo(req : RouterRequest, res : RouterResponse){
    await db_connection( req, res, async (db) => {
        let { keyword } = req.query;

        let condition = (v, _keyword) => {
            return ( v.tags !== undefined && v.tags.some( (t) => t.toLowerCase().includes(_keyword.toLowerCase()) ) ) || ( v.title.toLowerCase().includes(_keyword.toLowerCase()) )
        }

        let videos = db.data.videos.filter( (v) => condition(v, keyword) );

        res.send({
            data : videos,
            message : 'success'
        });
    });
}

async function updateLastEditVideo(req : RouterRequest, res : RouterResponse){
    await db_connection( req, res, async (db) => {
        let { videoId } = req.body;

        let video = db.data.videos.find( (video) => video.src == videoId);

        video.lastEditTime = Date.now();

        await db.write();

        res.send({
            message : 'success',
            data : []
        })
    });
}

async function getTimeline(req : RouterRequest, res : RouterResponse) {
    await db_connection(req, res, async (db) => {
        let { videoId } = req.query;

        let video = db.data.videos.find( (video) => video.src == videoId);

        if( video.direction === undefined ){
            let lang = await guessLanguage(videoId);
            video.direction = ( lang === 'ja' || lang === null ) ? 'ja-ko' : 'ko-ja'

            await db.write();
        }

        let timeline = video.timeline;
        
        if( !timeline ){ 
            res.send({
                message : 'error',
                data : {}
            }) 
            return;
        }
        else{
            let jaBuns = db.data.jaBuns;
            let koBuns = db.data.koBuns;
            let joinText = timeline.map( (v) => {
                return { ...v, 
                    ...jaBuns.find( (ja) => ja.jaBId == v.jaBId ), 
                    ...koBuns.find( (ko) => ko.koBId == v.koBId ) 
                }
            }).toSorted( (a, b) => a.startTime - b.startTime );

            if( joinText.length == 0){
                res.send({
                    message : 'empty',
                    data : {
                        timeline : [],
                        direction : video.direction ?? 'ja-ko',
                    }
                })
                return;
            }

            res.send({
                message : 'success',
                data : {
                    timeline : joinText,
                    direction : video.direction ?? 'ja-ko',
                }
            });
        }
    })
}

//transcript to PostBuns
async function transcriptToBuns(req : RouterRequest, res : RouterResponse){ 
    await db_connection(req, res, async(db) => {
        let { videoId } = req.body;
        
        const videoPath = `${assetPath}/transcript/${videoId}.wav`;

        let json = await fs.readFileSync(`${videoPath}.json`);
        if( await fs.existsSync(`${videoPath}_revise.json`) == true ){
            json = await fs.readFileSync(`${videoPath}_revise.json`);
        }
        const transcript = JSON.parse(json.toString()).transcription;

        let video = db.data.videos.find( (video) => video.src == videoId );
        let direction = video.direction ?? 'ja-ko'
        let timeline = video.timeline;

        const SKIP_TEXT = ['♪', '(音楽)', '[音楽]', ''];

        //legacy koText-->translate
        transcript.map( (v) => {
            let startTime = v.offsets.from/1000;
            let endTime = v.offsets.to/1000;

            if( SKIP_TEXT.includes(v.text.trim()) == true ){ console.log('SKIP_TEXT', v.text); return; }

            let _YTBID = nanoid(10);
            let _JABID = direction === 'ja-ko' ? nanoid(10) : v.translate !== undefined ? nanoid(10) : null;
            let _KOBID = direction === 'ja-ko' ? (v.translate !== undefined || v.koText !== undefined) ? nanoid(10) : null : nanoid(10);

            logger.info( db_module.logYTBInsert(_YTBID, _JABID, _KOBID, startTime, endTime) );
            // console.log( db_module.logYTBInsert(_YTBID, _JABID, _KOBID, startTime, endTime) );
            timeline.push({
                "ytBId" : _YTBID,
                "jaBId" : _JABID,
                "koBId" : _KOBID,
                "startTime" : startTime,
                "endTime" : endTime
            })
            if( _JABID !== null ){
                let jaText = ( direction === 'ja-ko' ? v.text : v.translate ).trim()
                let jaBuns = db.data.jaBuns;
                logger.info( db_module.logJaBunInsert(_JABID, jaText, _YTBID) );
                // console.log( db_module.logJaBunInsert(_JABID, jaText, _YTBID) );
                jaBuns.push({
                    "jaBId" : _JABID,
                    "jaText" : jaText,
                    "ytBId" : _YTBID
                })
            }
            if( _KOBID !== null ){
                let koText = ( direction === 'ja-ko' ? (v.translate ?? v.koText) : v.text ).trim();
                let koBuns = db.data.koBuns;
                logger.info( db_module.logKoBunInsert(_KOBID, koText, _YTBID) );
                // console.log( db_module.logKoBunInsert(_KOBID, koText, _YTBID) );
                koBuns.push({
                    "koBId" : _KOBID,
                    "koText" : koText,
                    "ytBId" : _YTBID
                })
            }
            
        })
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

//AudioCaptionToBuns //not updated with direction
async function captionToBuns(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId } = req.body;

        const _data = await fs.readFileSync(`${assetPath}/transcript/${videoId}_caption.json`);
        const jsonData = JSON.parse(_data.toString());

        let timeline = db.data.videos.find( (video) => video.src == videoId ).timeline;

        const SKIP_TEXT = ['♪', '(音楽)', '[音楽]', ''];

        jsonData.map( (v) => {
            let startTime = v.startTime;
            let endTime = v.endTime;
            let jaText = v.text.trim();

            if( SKIP_TEXT.includes(v.text.trim()) == true ){ console.log('SKIP_TEXT', v.text); return; }
  
            let _YTBID = nanoid(10);
            let _JABID = nanoid(10);       

            logger.info( db_module.logYTBInsert(_YTBID, _JABID, null, startTime, endTime) );
            timeline.push({
                "ytBId" : _YTBID,
                "jaBId" : _JABID,
                "koBId" : null,
                "startTime" : startTime,
                "endTime" : endTime
            })
            let jaBuns = db.data.jaBuns;
            logger.info( db_module.logJaBunInsert(_JABID, jaText, _YTBID) );
            jaBuns.push({
                "jaBId" : _JABID,
                "jaText" : jaText,
                "ytBId" : _YTBID
            })
        })
        
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function getShare(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId } = req.query;

        let timeline = db.data.videos.find( (video) => video.src == videoId).timeline;
        
        if( !timeline ){ 
            res.send({
                message : 'error',
                data : []
            }) 
        }
        else{
            let jaBuns = db.data.jaBuns;
            let koBuns = db.data.koBuns;
            let joinText = timeline.map( (v) => {
                return { 
                    ...v,
                    ...jaBuns.find( (ja) => ja.jaBId == v.jaBId ), 
                    ...koBuns.find( (ko) => ko.koBId == v.koBId ),
                }
            }).toSorted( (a, b) => a.startTime - b.startTime );

            joinText = joinText.map( (v) => {
                let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId ).map( (h) => {
                    return {
                        ...h,
                        ...db.data.hyouki.find( (hy) => h.hyId == hy.hyId )
                    }
                }).sort( (a, b) => a.startOffset-b.startOffset );
                
                let offset = [ 0, ...hukumu.map( (h) => {
                    return [h.startOffset, h.endOffset]
                }).flat(), v.jaText.length].filter( (o, i, arr) => arr.indexOf(o) == i );

                let textData = offset.map( (o, i, arr) => {
                    if(i == arr.length-1){ return }
                    let finded =  hukumu.find( (h) => h.startOffset == o )
                    if( finded != undefined ){
                        return {
                            d : v.jaText.substring(o, arr[i+1]),
                            r : finded.yomi,
                            o : o
                        }
                    }
                    else{
                        return {
                            d : v.jaText.substring(o, arr[i+1]),
                            o : o
                        }
                    }
                }).filter( (o) => o != undefined );

                return {
                    ...v,
                    textData : textData
                }
            })

            res.send({
                message : 'success',
                data : joinText
            });
        }
    })
}

async function getExportJson(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId } = req.query;

        let timeline = db.data.videos.find( (video) => video.src == videoId).timeline;
        
        if( !timeline ){ 
            res.send({
                message : 'error',
                data : []
            }) 
        }
        else{
            let jaBuns = db.data.jaBuns;
            let koBuns = db.data.koBuns;
            let joinText : ExportJsonJoinData[] = timeline.map( (v) => {
                return { 
                    ...v,
                    ...jaBuns.find( (ja) => ja.jaBId == v.jaBId ), 
                    ...koBuns.find( (ko) => ko.koBId == v.koBId ),
                }
            }).toSorted( (a, b) => a.startTime - b.startTime );

            joinText = joinText.map( (v) => {
                let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId ).map( (h) => {
                    return {
                        ...h,
                        ...db.data.hyouki.find( (hy) => h.hyId == hy.hyId )
                    }
                }).sort( (a, b) => a.startOffset-b.startOffset );
                
                let offset = [ 0, ...hukumu.map( (h) => {
                    return [h.startOffset, h.endOffset]
                }).flat(), v.jaText.length].filter( (o, i, arr) => arr.indexOf(o) == i );

                let textData = offset.map( (o, i, arr) => {
                    if(i == arr.length-1){ return }
                    let finded =  hukumu.find( (h) => h.startOffset == o )
                    if( finded != undefined ){
                        return finded.textData.map( (td) => { return { ...td, offset : o + td.offset } })
                    }
                    else{
                        return {
                            data : v.jaText.substring(o, arr[i+1]),
                            ruby : null,
                            offset : o
                        }
                    }
                }).filter( (o) => o != undefined ).flat();

                return {
                    ...v,
                    textData : textData
                }
            })

            if( await _checkMecabInstalled() === true ){
                await _ensureUtf8CodePage();

                
                for await( let obj of joinText ){
                    obj.reading = await _addReading(obj.jaText);
                }
            }

            res.send({
                message : 'success',
                data : joinText
            });
        }
    })
}

//DBPage
async function _addReading(jaText : string) : Promise<string> {
    let yomi = await getReadingWithMecab(jaText);

    let _reading = [];
    let flag = false;
    for(let token of yomi){
        if( token.space == true ){
            _reading.push(token.reading)
            flag = true;
        }
        else{
            _reading.push(`${flag == true ? ' ' : ''}${token.reading}`);
            flag = false;
        }
    }

    return _reading.join('');
}

function _convertJaTextToTextData(hukumu : HukumuHyouki[], jaText : string) : TextData[]{
    let offset = [ 0, ...hukumu.map( (h) => {
        return [h.startOffset, h.endOffset]
    }).flat(), jaText.length].filter( (o, i, arr) => arr.indexOf(o) == i );

    let textData = offset.map( (o, i, arr) => {
        if(i == arr.length-1){ return }
        let finded =  hukumu.find( (h) => h.startOffset == o )
        if( finded != undefined ){
            return finded.textData.map( (td) => { return { ...td, offset : o + td.offset } })
        }
        else{
            return {
                data : jaText.substring(o, arr[i+1]),
                ruby : null,
                offset : o
            }
        }
    }).filter( (o) => o != undefined ).flat();

    return textData;
}

function _getDBPagination(query : RouterRequest["query"]){
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const start = (page-1)*limit;
    const end = start + limit;

    return { page, limit, start, end };
}

function _buildDBYtBuns(db : db) : DBYtBuns[] {
    return db.data.videos.map( (v) => {
        return v.timeline.map( (t) => {
            return {
                ...t,
                title : v.title,
                src : v.src
            }
        })
    }).flat();
}

function _buildDBJoinData(db : db) : DBJoinData[] {
    let ytBuns = _buildDBYtBuns(db);
    
    let joinData = db.data.tango.map( (v) => {
        return {
            ...v,
            hukumus : _.toArray( _.groupBy( db.data.hukumu
                .filter( (hu) => hu.tId == v.tId )
                .map( (hu) => { 
                    let _ja = db.data.jaBuns.find( (ja) => ja.jaBId == hu.jaBId);
                    let _ytBun = ytBuns.find( (yt) => yt.ytBId == _ja.ytBId);
                    return {
                        ...hu,
                        ...db.data.hyouki.find( (hy) => hy.hyId == hu.hyId),
                        ...( hu.iId != null ? { imi : db.data.imi.find( (v) => v.iId == hu.iId ).koText } : {} ),
                        ..._ja,
                        ...db.data.koBuns.find( (ko) => ko.koBId == _ytBun.koBId),
                        ..._ytBun,
                        kanjis : db.data.komu.filter( (km) => km.hyId == hu.hyId )
                            .map( (km) => 
                                db.data.kanji.find( (k) => k.kId == km.kId)
                            ),
                    }
                }), "hyId") )
        }
    })
    .map( (v) => {
        return {
            ...v,
            hukumus : v.hukumus.map( (hu) => _.toArray( _.groupBy(hu, "src") ) )
        }
    })


    return _.sortBy( joinData, (v) => v.hukumus[0][0][0].yomi);
}

function _buildDBTextJoinData(db : db) : DBTextJoinData[] {
    const index = _buildDBHukumuIndex(db);

    let joinData = db.data.videos.map( (v) => {
        return v.timeline.map( (t) => {
            let ja = db.data.jaBuns.find( (j) => j.jaBId == t.jaBId );
            let ko = db.data.koBuns.find( (k) => k.koBId == t.koBId );
            let searchData = _getJaTextSearchData(index, ja);

            return {
                startTime : t.startTime,
                ...ja,
                ...ko,
                ...searchData,
                title : v.title,
                src : v.src,
                lastEditTime : v.lastEditTime ?? null,
                reading : 'loading...'
            }
        })
    }).flat();

    return joinData;
}

async function _hydrateDBPageData(db : db, pagedData : HydrateDBJoinData[]){
    for( let obj of pagedData ){
        for( let hyouki of obj.hukumus ){
            for( let video of hyouki ){
                for( let ja of video ){
                    ja.hukumus = await db_module.getHukumu(db, ja.jaBId)
                    ja.jaTextData = _convertJaTextToTextData(ja.hukumus, ja.jaText)
                    ja.reading = 'loading...'
                }
            }
        }
    }

    return pagedData;
}

async function getDBAll(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        const { page, limit, start, end } = _getDBPagination(req.query);

        const joinData = _buildDBJoinData(db);
        let pagedData = joinData.slice(start, end);

        await _hydrateDBPageData(db, pagedData as HydrateDBJoinData[]);

        res.send({
            message : 'success',
            data : {
                db : pagedData,
                pagination : {
                    page : page,
                    limit : limit,
                    total : joinData.length
                }
            }
        })
    })
}

async function getReading(req : RouterRequest, res : RouterResponse){

    let { jaText } = req.query;

    let reading = await _addReading(jaText);
    
    res.send({
        message : 'success',
        data : reading
    })
}

function _filter_hyouki_yomi(v : DBJoinData, keyword : string){
    if(keyword !== undefined ){
        let _comp = v.hukumus.map( (s) => s[0][0] );
        let _hyoukis = _comp.map( (s) => s.hyouki);
        let _yomis = _comp.map( (s) => s.yomi);

        return _hyoukis.filter( (s) => s.includes(keyword) == true ).length > 0 ||
                _yomis.filter( (s) => s.includes(keyword) == true ).length > 0
    }

    return true;
}

function _filter_hyouki(v : DBJoinData, keyword : string){
    if(keyword !== undefined){
        let _comp = v.hukumus.map( (s) => s[0][0] );
        let _hyoukis = _comp.map( (s) => s.hyouki);

        return _hyoukis.filter( (s) => s.includes(keyword) == true ).length > 0
    }

    return true;
}

function _filter_yomi(v : DBJoinData, keyword : string){
    if(keyword !== undefined){
        let _comp = v.hukumus.map( (s) => s[0][0] );
        let _yomis = _comp.map( (s) => s.yomi);

        return _yomis.filter( (s) => s.includes(keyword) == true ).length > 0
    }

    return true;
}

function _filter_imi(v : DBJoinData, keyword : string){
    if(keyword !== undefined){
        let _comp = v.hukumus.flat(2);
        let _imis = _comp.map( (s) => s.imi).filter( (s) => s != undefined );

        return _imis.filter( (s) => s.includes(keyword) == true ).length > 0
    }

    return true;
}

const TANGO_MATCH_TYPE_ORDER = {
    yomi : 0,
    hyouki : 1,
    imi : 2
};

function _getSort(sort : string) : { iteratees : SortInteratees[] } {

    let iteratees = {
        'auto' : [ 
            (o) => TANGO_MATCH_TYPE_ORDER[o.match.type], (o) => o.match.start 
        ],
        'asc' : [
            (o) => o.match.start
        ],
        'desc' : [
            (o) => o.match.last
        ],
        'asc_amt' : [
            (o) => o.hukumus.length
        ],
        'desc_amt' : [
            (o) => -o.hukumus.length
        ],
        'default' : [0]
    }

    return { iteratees : iteratees[sort] }
}

function _addTangoMatch(v : DBJoinData, type : string, keyword : string, sort : string){
    let _fields;

    switch(type){
        case 'hyouki' :
            _fields = ['hyouki'];
            break;
        case 'yomi' :
            _fields = ['yomi'];
            break;
        case 'imi' :
            _fields = ['imi'];
            break;
        default :
            _fields = ['hyouki', 'yomi'];
            break;
    }

    let iteratees = sort === 'asc' ? 
        [(m) => m.start]
        :
        sort === 'desc' ?
            [(m) => m.last] 
            : 
            [(m) => TANGO_MATCH_TYPE_ORDER[m.type], (m) => m.start]

    let _matches = [];
    let _addMatch = (data, field, hyoukiIndex, videoIndex, bunIndex) => {
        if( typeof data[field] !== 'string' || data[field].includes(keyword) !== true ){
            return;
        }

        let _start = data[field].indexOf(keyword);

        _matches.push({
            type : field,
            start : _start,
            end : _start + keyword.length,
            last : data[field].length - ( _start + keyword.length ),
            hyoukiIndex : hyoukiIndex,
            videoIndex : videoIndex,
            bunIndex : bunIndex
        });
    };

    _fields.forEach( (field) => {
        v.hukumus.forEach( (hyouki, hyoukiIndex) => {
            if( field === 'imi' ){
                hyouki.forEach( (video, videoIndex) => {
                    video.forEach( (bun, bunIndex) => {
                        _addMatch(bun, field, hyoukiIndex, videoIndex, bunIndex);
                    });
                });
            }
            else{
                _addMatch(hyouki[0][0], field, hyoukiIndex, 0, 0);
            }
        });
    });

    let _match = _.sortBy( _matches, [
        ...iteratees,
        (m) => m.hyoukiIndex,
        (m) => m.videoIndex,
        (m) => m.bunIndex
    ])[0];

    return { ...v, match : _match };
}

function _buildDBHukumuIndex(db : db) : HukumuIndex {
    return {
        hukumuByJaBId : _.groupBy(db.data.hukumu, "jaBId"),
        hyoukiByHyId : new Map(db.data.hyouki.map( (v) => [v.hyId, v] ))
    }
}

function _getHukumuFromIndex(index : HukumuIndex, jaBId : string) : HukumuHyouki[]{
    return (index.hukumuByJaBId[jaBId] ?? [])
        .map( (hu) => {
            let hyouki = index.hyoukiByHyId.get(hu.hyId);
            if( hyouki === undefined ){ return undefined; }

            return {
                ...hu,
                ...hyouki
            }
        })
        .filter( (v) => v !== undefined )
        .sort( (a, b) => a.startOffset - b.startOffset );
}

function _getJaTextSearchData(index : HukumuIndex, ja : jaBun){
    let hukumus = _getHukumuFromIndex(index, ja.jaBId);
    let jaTextData = _convertJaTextToTextData(hukumus, ja.jaText);
    let ruby = jaTextData
        .map( (v) => v.ruby === null ? v.data : v.ruby )
        .join('');

    return { hukumus, jaTextData, ruby };
}

const MATCH_TYPE_ORDER = {
    hukumu: 0,
    text: 1,
    etc: 2
};

function _getSortText(sort : string, locale : 'ja' | 'ko') : { iteratees : Record<string, SortInteratees[]>, fields : string[] } {
    let fields = ['auto', 'default'];

    switch(sort){
        case 'auto' :
            fields = ['auto', 'default']
            break;
        case 'asc' :
            fields = ['asc', 'default']
            break;
        case 'desc' :
            fields = ['desc', 'default']
            break;
        case 'asc_amt' :
            fields = ['auto', 'asc_amt']
            break;
        case 'desc_amt' :
            fields = ['auto', 'desc_amt']
            break;
        case 'video' :
            fields = ['auto', 'video']
            break;
        default :
            fields = ['auto', 'default']
            break;
    }

    let iteratees = {
        'auto' : locale === 'ja' ? 
            [ (o) => MATCH_TYPE_ORDER[o.match.matchType], (o) => o.match.start ]
            :
            [ (o) => o.match.start ],
        'asc' : [
            (o) => o.match.start
        ],
        'desc' : [
            (o) => o.match.last
        ],
        'asc_amt' : [
            (o) => o.length
        ],
        'desc_amt' : [
            (o) => -o.length
        ],
        'video' : [
            (o) => -(o[0].lastEditTime ?? 0)
        ],
        'default' : [0]
    }

    return { iteratees, fields }
}

function _filter_jaText(db : db, joinData : DBTextJoinData[], keyword : string, sort : string) : FilteredDBTextJoinData[] {

    const { iteratees, fields } = _getSortText(sort, 'ja');

    return _.toArray( 
        _.sortBy(
            _.groupBy( 
                _.sortBy( 
                    joinData
                    .filter( (v) => v.ruby.includes(keyword) || v.jaText.includes(keyword) )
                    .map( (v) => {
                        let _regexp_keyword = new RegExp(`${keyword}`, 'g');
                        let _match_jaText = [...v.jaText.matchAll(_regexp_keyword)]
                            .map( (_) => _.index );
                        let _match_ruby = [...v.ruby.matchAll(_regexp_keyword)]
                            .map( (_) => _.index );
                        let _match_hukumus = v.hukumus.filter( (_) => _.hyouki.includes(keyword) || _.yomi.includes(keyword) )
                            .map( (_) => [_.startOffset, _.endOffset] ).flat();
                        let _matchType = _match_hukumus.length > 0 ? 'hukumu' : _match_jaText.length > 0 ? 'text' : 'etc';
                        let _start, _end;
                        if( _matchType === 'hukumu' ){
                            _start = _match_hukumus[0]
                            _end = _match_hukumus[1]
                        }
                        else if( _matchType === 'text'){
                            _start = _match_jaText[0]
                            _end = _match_jaText[0] + keyword.length
                        }
                        else{
                            let _ruby_start = _match_ruby[0];
                            let _ruby_end = _ruby_start + keyword.length;
                            let _ruby_offset = 0;

                            let _ranges = v.jaTextData.map( (td) => {
                                let _text = td.ruby === null ? td.data : td.ruby;
                                let _text_start = _ruby_offset;
                                let _text_end = _text_start + _text.length;
                                _ruby_offset = _text_end;

                                if( _text_start >= _ruby_end || _text_end <= _ruby_start ){
                                    return undefined;
                                }

                                if( td.ruby !== null ){
                                    let _hukumu = v.hukumus.find( (hu) =>
                                        hu.startOffset <= td.offset && td.offset < hu.endOffset
                                    );

                                    if( _hukumu !== undefined ){
                                        return [ _hukumu.startOffset, _hukumu.endOffset ];
                                    }

                                    return [ td.offset, td.offset + td.data.length ];
                                }

                                let _overlap_start = Math.max(_ruby_start, _text_start);
                                let _overlap_end = Math.min(_ruby_end, _text_end);

                                return [
                                    td.offset + (_overlap_start - _text_start),
                                    td.offset + (_overlap_end - _text_start)
                                ];
                            }).filter( (range) => range !== undefined );

                            _start = Math.min(..._ranges.map( (range) => range[0] ));
                            _end = Math.max(..._ranges.map( (range) => range[1] ));
                        }

                        return {
                            ...v, match : {
                                type : 'jaText',
                                matchType : _matchType,
                                start : _start,
                                end : _end,
                                last : v.jaText.length-_end
                            }
                        }
                    })
                , iteratees[fields[0]] )
            , "src") 
        , iteratees[fields[1]])
    )
    .map( (v) => { return { buns : v, src : v[0].src, lastEditTime : v[0].lastEditTime } });
}

function _filter_koText(db : db, joinData : DBTextJoinData[], keyword : string, sort : string) : FilteredDBTextJoinData[] {

    const { iteratees, fields } = _getSortText(sort, 'ko');

    return _.toArray( 
        _.sortBy(
            _.groupBy( 
                _.sortBy(
                    joinData.filter( (v) => v.koText !== undefined && v.koText.includes(keyword) )
                        .map( (v) => {
                            return {
                                ...v, match : {
                                    type : 'koText',
                                    matchType : 'text',
                                    start : v.koText.indexOf(keyword),
                                    end : v.koText.indexOf(keyword) + keyword.length,
                                    last : v.koText.length - ( v.koText.indexOf(keyword) + keyword.length )
                                }
                            }
                        })
                , iteratees[fields[0]])
            , "src") 
        , iteratees[fields[1]]) )
        .map( (v) => { return { buns : v, src : v[0].src, lastEditTime : v[0].lastEditTime } }
    );
}

async function getDBSearch(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        const { type, keyword, sort } = req.query;

        const { page, limit, start, end } = _getDBPagination(req.query);

        let total_length : number;
        let pagedData : DBJoinData[] | FilteredDBTextJoinData[] | HydrateDBJoinData[];
        if( type !== 'jaText' && type !== 'koText' ){
            let joinData = _buildDBJoinData(db);
            joinData = joinData.filter( (v) => {
                switch(type){
                    case 'auto' : 
                        return _filter_hyouki_yomi(v, keyword);
                    case 'hyouki' :
                        return _filter_hyouki(v, keyword);
                    case 'yomi' :
                        return _filter_yomi(v, keyword);
                    case 'imi' :
                        return _filter_imi(v, keyword);
                    default :
                        return _filter_hyouki_yomi(v, keyword);
                }
            });

            if( keyword !== undefined ){
                const { iteratees } = _getSort(sort);

                joinData = _.sortBy(
                    joinData.map( (v) => _addTangoMatch(v, type, keyword, sort) ),
                    iteratees
                );
            }

            total_length = joinData.length;
            pagedData = joinData.slice(start, end);

            await _hydrateDBPageData(db, pagedData as HydrateDBJoinData[]);
        }
        else{
            let joinData = _buildDBTextJoinData(db);
            let filteredJoinData : FilteredDBTextJoinData[];

            switch(type){
                case 'jaText' :
                    filteredJoinData = _filter_jaText(db, joinData, keyword, sort);
                    break;
                case 'koText' :
                    filteredJoinData = _filter_koText(db, joinData, keyword, sort);
                    break;
            }

            total_length = filteredJoinData.length;
            pagedData = filteredJoinData.slice(start, end);
        }

        res.send({
            message : 'success',
            data : {
                db : pagedData,
                type : type,
                sort : sort,
                pagination : {
                    page : page,
                    limit : limit,
                    total : total_length
                }
            }
        })
    })
}

router.post('/userId', saveUserId);
router.get('/userId', getUserId);

router.get('/video', getVideo);
router.post('/video', postVideo);
router.put('/video', editVideo);
router.delete('/video', deleteVideo);

router.get('/video/info', getVideoInfo);
router.get('/video/lang', getVideoLang);

router.get('/video/search', searchVideo);

router.put('/video/lastEdit', updateLastEditVideo);

router.get('/timeline', getTimeline);

router.post('/transcriptToBuns', transcriptToBuns);
router.post('/captionToBuns', captionToBuns);

router.get('/share', getShare);
router.get('/json', getExportJson);

//DB Page
router.get('/all', getDBAll);
router.get('/search', getDBSearch)

router.get('/reading', getReading);

export default router;
