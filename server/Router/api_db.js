import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from "./core/logger.js";

import fs from 'fs';
import { nanoid } from "nanoid";

import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { message } from "antd";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetPath = path.join(__dirname, '../Asset');

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
        let videos = db.data.videos;

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
        db.data.videos.push({ title : title, src : youtubeSrc, timeline : [], tags : [] });
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function editVideo(req, res){
    await db_connection(req, res, async (db) => {
        let { videoId, newTitle, newTagsQuery } = req.body;
        
        logger.info( db_module.logVideoUpdate( videoId, newTitle, newTagsQuery) )
        let video = db.data.videos.find( (v) => v.src == videoId );

        if( newTitle != undefined ){
            video.title = newTitle;
        }
        if( newTagsQuery != undefined ){
            video.tags = newTagsQuery.split("@");
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
        let { videoId } = req.query;

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

                    logger.info( db_module.logKomuDelete(hukumu.hyId) );
                    await db_module.deleteKomu( db, hukumu.hyId );

                    let kIds = await db_module.getKIds(db, hukumu.hyId);
                    for( let kId of kIds ){
                        let moreExistKanji = await db_module.getMoreExistKanji(db, kId);
                        if( !moreExistKanji ){
                            logger.info( db_module.logKanjiDelete(kId) );
                            await db_module.deleteKanji(db, kId);
                        }
                    }
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

async function getTimeline(req, res) {
    await db_connection(req, res, async (db) => {
        let { videoId } = req.query;

        let timeline = db.data.videos.find( (video) => video.src == videoId).timeline;
        
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
        
        const json = await fs.readFileSync(`${assetPath}/transcript/${videoId}.wav.json`);
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

            res.send({
                message : 'success',
                data : joinText
            });
        }
    })
}

router.post('/userId', saveUserId);
router.get('/userId', getUserId);

router.get('/video', getVideo);
router.post('/video', postVideo);
router.put('/video', editVideo);
router.delete('/video', deleteVideo);

router.get('/video/search', searchVideo);

router.get('/timeline', getTimeline);

router.post('/transcriptToBuns', transcriptToBuns);
router.post('/captionToBuns', captionToBuns);

router.get('/share', getShare);
router.get('/json', getExportJson);

export default router;