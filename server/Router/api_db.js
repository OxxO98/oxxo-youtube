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
        db.data.videos.push({ title : title, src : youtubeSrc, timeline : [] });
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
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

router.get('/video', getVideo);
router.post('/video', postVideo);

router.get('/timeline', getTimeline);

router.post('/transcriptToBuns', transcriptToBuns);
router.post('/captionToBuns', captionToBuns);

router.get('/share', getShare);
router.get('/json', getExportJson);

export default router;