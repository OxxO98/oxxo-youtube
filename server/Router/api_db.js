import express from "express";
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

import fs from 'fs';
import { nanoid } from "nanoid";

import path, { join } from 'path';
import { fileURLToPath } from 'url';

import _ from 'lodash'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetPath = process.env.APP_ASSET_ROOT ?? path.join(__dirname, '../Asset');

async function saveUserId(req, res){
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

async function getUserId(req, res){
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

async function getVideo(req, res){
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

async function postVideo(req, res){
    await db_connection(req, res, async (db) => {
        let { youtubeSrc, title } = req.body;
        
        logger.info( db_module.logVideoInsert(title, youtubeSrc) );
        db.data.videos.push({ title : title, src : youtubeSrc, timeline : [], tags : [], lastEditTime : Date.now() });
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function editVideo(req, res){
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

async function deleteVideo(req, res){
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

async function searchVideo(req, res){
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

async function updateLastEditVideo(req, res){
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

async function getTimeline(req, res) {
    await db_connection(req, res, async (db) => {
        let { videoId } = req.query;

        let video = db.data.videos.find( (video) => video.src == videoId);

        let timeline = video.timeline;
        
        if( !timeline ){ 
            res.send({
                message : 'error',
                data : []
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
                    data : []
                })
                return;
            }

            res.send({
                message : 'success',
                data : joinText
            });
        }
    })
}

//transcript to PostBuns
async function transcriptToBuns(req, res){ 
    await db_connection(req, res, async(db) => {
        let { videoId } = req.body;
        
        const videoPath = `${assetPath}/transcript/${videoId}.wav`;

        let json = await fs.readFileSync(`${videoPath}.json`);
        if( await fs.existsSync(`${videoPath}_revise.json`) == true ){
            json = await fs.readFileSync(`${videoPath}_revise.json`);
        }
        const transcript = JSON.parse(json).transcription;

        let timeline = db.data.videos.find( (video) => video.src == videoId ).timeline;

        const SKIP_TEXT = ['♪', '(音楽)', '[音楽]', ''];

        transcript.map( (v) => {
            let startTime = v.offsets.from/1000;
            let endTime = v.offsets.to/1000;
            let jaText = v.text.trim();

            if( SKIP_TEXT.includes(v.text.trim()) == true ){ console.log('SKIP_TEXT', v.text); return; }

            let _YTBID = nanoid(10);
            let _JABID = nanoid(10);
            let _KOBID = v.koText !== undefined ? nanoid(10) : null;

            logger.info( db_module.logYTBInsert(_YTBID, _JABID, startTime, endTime, _KOBID) );
            timeline.push({
                "ytBId" : _YTBID,
                "jaBId" : _JABID,
                "koBId" : _KOBID,
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
            if( v.koText !== undefined && _KOBID !== null ){
                let koText = v.koText.trim();
                let koBuns = db.data.koBuns;
                logger.info( db_module.logKoBunInsert(_KOBID, koText, _YTBID) );
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

//AudioCaptionToBuns
async function captionToBuns(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId } = req.body;

        const _data = await fs.readFileSync(`${assetPath}/transcript/${videoId}_caption.json`);
        const jsonData = JSON.parse(_data);

        let timeline = db.data.videos.find( (video) => video.src == videoId ).timeline;

        const SKIP_TEXT = ['♪', '(音楽)', '[音楽]', ''];

        jsonData.map( (v) => {
            let startTime = v.startTime;
            let endTime = v.endTime;
            let jaText = v.text.trim();

            if( SKIP_TEXT.includes(v.text.trim()) == true ){ console.log('SKIP_TEXT', v.text); return; }
  
            let _YTBID = nanoid(10);
            let _JABID = nanoid(10);       

            logger.info( db_module.logYTBInsert(_YTBID, _JABID, startTime, endTime) );
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

async function getShare(req, res){
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

async function getExportJson(req, res){
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
async function _addReading(jaText){
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

function _convertJaTextToTextData(hukumu, jaText){
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

function _getDBPagination(query){
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const start = (page-1)*limit;
    const end = start + limit;

    return { page, limit, start, end };
}

function _buildDBYtBuns(db){
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

function _buildDBJoinData(db){
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

function _buildDBTextJoinData(db){
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
                reading : 'loading...'
            }
        })
    }).flat();

    return joinData;
}

async function _hydrateDBPageData(db, pagedData){
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

async function getDBAll(req, res){
    await db_connection(req, res, async(db) => {
        const { page, limit, start, end } = _getDBPagination(req.query);

        const joinData = _buildDBJoinData(db);
        let pagedData = joinData.slice(start, end);

        await _hydrateDBPageData(db, pagedData);

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

async function getReading(req, res){

    let { jaText } = req.query;

    let reading = await _addReading(jaText);
    
    res.send({
        message : 'success',
        data : reading
    })
}

function _filter_hyouki_yomi(v, keyword){
    if(keyword !== undefined ){
        let _comp = v.hukumus.map( (s) => s[0][0] );
        let _hyoukis = _comp.map( (s) => s.hyouki);
        let _yomis = _comp.map( (s) => s.yomi);

        return _hyoukis.filter( (s) => s.includes(keyword) == true ).length > 0 ||
                _yomis.filter( (s) => s.includes(keyword) == true ).length > 0
    }

    return true;
}

function _filter_hyouki(v, keyword){
    if(keyword !== undefined){
        let _comp = v.hukumus.map( (s) => s[0][0] );
        let _hyoukis = _comp.map( (s) => s.hyouki);

        return _hyoukis.filter( (s) => s.includes(keyword) == true ).length > 0
    }

    return true;
}

function _filter_yomi(v, keyword){
    if(keyword !== undefined){
        let _comp = v.hukumus.map( (s) => s[0][0] );
        let _yomis = _comp.map( (s) => s.yomi);

        return _yomis.filter( (s) => s.includes(keyword) == true ).length > 0
    }

    return true;
}

function _filter_imi(v, keyword){
    if(keyword !== undefined){
        let _comp = v.hukumus.map( (s) => s[0][0] );
        let _imis = _comp.map( (s) => s.imi).filter( (s) => s != undefined );

        return _imis.filter( (s) => s.includes(keyword) == true ).length > 0
    }

    return true;
}

function _buildDBHukumuIndex(db){
    return {
        hukumuByJaBId : _.groupBy(db.data.hukumu, "jaBId"),
        hyoukiByHyId : new Map(db.data.hyouki.map( (v) => [v.hyId, v] ))
    }
}

function _getHukumuFromIndex(index, jaBId){
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

function _getJaTextSearchData(index, ja){
    let hukumus = _getHukumuFromIndex(index, ja.jaBId);
    let jaTextData = _convertJaTextToTextData(hukumus, ja.jaText);
    let ruby = jaTextData
        .map( (v) => v.ruby === null ? v.data : v.ruby )
        .join('');

    return { hukumus, jaTextData, ruby };
}

function _filter_jaText(db, joinData, keyword){
    return _.toArray( _.groupBy( joinData.filter( (v) => v.ruby.includes(keyword) || v.jaText.includes(keyword) ), "src") )
        .map( (v) => { return { buns : v, src : v[0].src } });
}

function _filter_koText(db, joinData, keyword){
    return _.toArray( _.groupBy( joinData.filter( (v) => v.koText !== undefined && v.koText.includes(keyword) ), "src") )
        .map( (v) => { return { buns : v, src : v[0].src } });
}

async function getDBSearch(req, res){
    await db_connection(req, res, async(db) => {
        const { type, keyword } = req.query;

        const { page, limit, start, end } = _getDBPagination(req.query);

        // search 후의 sort조건까지

        let joinData = _buildDBJoinData(db);
        let pagedData;
        if( type !== 'jaText' && type !== 'koText' ){
            joinData = joinData.filter( (v) => {
                switch(type){
                    case 'auto' : 
                        return _filter_hyouki_yomi(v, keyword);
                        break;
                    case 'hyouki' :
                        return _filter_hyouki(v, keyword);
                        break;
                    case 'yomi' :
                        return _filter_yomi(v, keyword);
                        break;
                    case 'imi' :
                        return _filter_imi(v, keyword);
                        break;
                    default :
                        return _filter_hyouki_yomi(v, keyword);
                        break;
                }
            });

            pagedData = joinData.slice(start, end);

            await _hydrateDBPageData(db, pagedData);
        }
        else{
            joinData = _buildDBTextJoinData(db);

            switch(type){
                case 'jaText' :
                    joinData = _filter_jaText(db, joinData, keyword);
                    break;
                case 'koText' :
                    joinData = _filter_koText(db, joinData, keyword);
                    break;
            }

            pagedData = joinData.slice(start, end);
        }

        res.send({
            message : 'success',
            data : {
                db : pagedData,
                type : type,
                pagination : {
                    page : page,
                    limit : limit,
                    total : joinData.length
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
