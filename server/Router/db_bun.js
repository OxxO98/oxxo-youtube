import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from "./core/logger.js";

import { nanoid } from "nanoid";
import { message } from "antd";

async function getBun(req, res){
    await db_connection(req, res, async(db) => {
        let { bId } = req.query;

        let jaBun = await db_module.getJaBun(db, bId);

        if( jaBun == undefined ){
            res.send(null);
            return;
        }
        
        let hukumuArr = await db_module.getHukumu( db, bId );

        res.send({
            data : {
                jaText : jaBun.jaText,
                hukumuArr : hukumuArr
            }
        })
    })
}

async function postBun(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, jaText, startTime, endTime } = req.body;

        let _YTBID = nanoid(10);
        let _JABID = nanoid(10);

        let timeline = await db_module.getTimeline(db, videoId);
        logger.info( db_module.logYTBInsert(_YTBID, _JABID, startTime, endTime) );
        timeline.push({
            "ytBId" : _YTBID,
            "jaBId" : _JABID,
            "koBId" : null,
            "startTime" : startTime,
            "endTime" : endTime
        })
        let jaBuns = await db_module.getJaBuns(db);
        logger.info( db_module.logJaBunInsert(_JABID, jaText, _YTBID) );
        jaBuns.push({
            "jaBId" : _JABID,
            "jaText" : jaText,
            "ytBId" : _YTBID
        })
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function deleteBun(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        
        let { jaBId } = await db_module.getYTBun(timeline, ytBId);

        logger.info( db_module.logJaBunDelete(jaBId) );
        await db_module.deleteJaBun(db, jaBId);
        logger.info( db_module.logYTBDelete(ytBId) );
        await db_module.deleteYTBun(db, videoId, ytBId);

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    });
}

async function updateTime(req, res) {
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, startTime, endTime } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);
        
        let ytb = await db_module.getYTBun(timeline, ytBId);
        
        logger.info( db_module.logYTBUpdateTime(ytb, startTime, endTime) );
        ytb.startTime = startTime;
        ytb.endTime = endTime;
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    });
}

async function updateJaText(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, jaText } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);
        
        let { jaBId } = await db_module.getYTBun(timeline, ytBId);

        let jaBun = await db_module.getJaBun(db, jaBId);
        
        logger.info( db_module.logJaBunUpdateJaText(jaBun, jaText) );
        jaBun.jaText = jaText;
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    });
}

async function bunkatsuJaText(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, critTime, critJaText, critKoText } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);

        let ytb = await db_module.getYTBun(timeline, ytBId);
        let _endTime = ytb.endTime;

        let _critTime = critTime;
        if( critTime <= ytb.startTime || ytb.endTime <= critTime ){
            _critTime = ( ytb.startTime + ytb.endTime )/2; 
        }
        
        let jaBun = await db_module.getJaBun(db, ytb.jaBId);
        let koBun = await db_module.getKoBun(db, ytb.koBId);

        let _isKoText = ytb.koBId != null;

        //prev수정
        let _prevJaText = jaBun.jaText.substring(0, critJaText);
        let _nextJaText = jaBun.jaText.substring(critJaText);
        let _prevKoText = _isKoText ? koBun.koText.substring(0, critKoText) : null;
        let _nextKoText = _isKoText ? koBun.koText.substring(critKoText) : null;

        logger.info( db_module.logYTBUpdateTime(ytb, ytb.startTime, _critTime) );
        ytb.endTime = _critTime;
        logger.info( db_module.logJaBunUpdateJaText(jaBun, _prevJaText) );
        jaBun.jaText = _prevJaText;
        if( _isKoText ){ 
            logger.info( db_module.logKoBunUpdateKoText(koBun, _prevKoText) );
            koBun.koText = _prevKoText;
        }

        //next수정
        let _YTBID = nanoid(10);
        let _JABID = nanoid(10);
        let _KOBID = _isKoText ? nanoid(10) : null;

        logger.info( db_module.logYTBInsert(_YTBID, _JABID, _critTime, _endTime, _KOBID) );
        timeline.push({
            "ytBId" : _YTBID,
            "jaBId" : _JABID,
            "koBId" : _KOBID,
            "startTime" : _critTime,
            "endTime" : _endTime
        })
        let jaBuns = await db_module.getJaBuns(db);
        logger.info( db_module.logJaBunInsert(_JABID, _nextJaText, _YTBID) );
        jaBuns.push({
            "jaBId" : _JABID,
            "jaText" : _nextJaText,
            "ytBId" : _YTBID
        })
        if( _isKoText ){
            logger.info( db_module.logKoBunInsert(_KOBID, _nextKoText, _YTBID) );
            db.data.koBuns.push({
                "koBId" : _KOBID,
                "koText" : _nextKoText,
                "ytBId" : _YTBID
            })
        }

        let hukumus = await db_module.getHukumu(db, ytb.jaBId);

        let nextHukumu = hukumus.filter( (v) => v.startOffset >= critJaText );
        for( let idx in nextHukumu ){
            let obj = nextHukumu[idx];

            let hukumu = db.data.hukumu.find( (v) => 
                v.jaBId == obj.jaBId && v.startOffset == obj.startOffset && v.endOffset == obj.endOffset
            )
            if( hukumu != undefined ){
                logger.info( db_module.logHukumuUpdateJaBIdOffsets(hukumu, _JABID, hukumu.startOffset - critJaText, hukumu.endOffset - critJaText) );
                hukumu.jaBId = _JABID;
                hukumu.startOffset = hukumu.startOffset - critJaText;
                hukumu.endOffset = hukumu.endOffset - critJaText;
            }
        }
        
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });

    })
}

async function heigouJaTextNext(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, nextYtBId } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);

        //prev
        let ytb = await db_module.getYTBun(timeline, ytBId);
        let { jaBId, koBId } = ytb;
        let jaBun = await db_module.getJaBun(db, jaBId);
        let koBun = await db_module.getKoBun(db, koBId);

        let _isKoText = koBId != null;
        let _koText = _isKoText ? koBun.koText : '';
        
        let _critJaText = jaBun.jaText.length;

        //next
        let ytbNext = await db_module.getYTBun(timeline, nextYtBId);
        let { jaBId : nextJaBId, koBId : nextKoBId } = ytbNext;
        let nextJaBun = await db_module.getJaBun(db, nextJaBId);
        let nextKoBun = await db_module.getKoBun(db, nextKoBId);

        logger.info( db_module.logYTBUpdateTime(ytb, ytb.startTime, ytbNext.endTime) );
        ytb.endTime = ytbNext.endTime;

        let _isKoTextNext = nextKoBId != null;
        let _koTextNext = _isKoTextNext ? nextKoBun.koText : '';

        let _concatJaText = jaBun.jaText.concat(nextJaBun.jaText);
        let _concatKoText = ( !_isKoText && !_isKoTextNext ) ? null : _koText.concat(_koTextNext);

        logger.info( db_module.logJaBunUpdateJaText(jaBun, _concatJaText) );
        jaBun.jaText = _concatJaText;
        if( _concatKoText != null ){
            if( _isKoText ){
                logger.info( db_module.logKoBunUpdateKoText(koBun, _concatKoText) );
                koBun.koText = _concatKoText;

                let _nextKoBunList = db.data.koBuns.filter( (v) => v.ytBId == nextYtBId );
                for( let key in _nextKoBunList ){
                    let obj = _nextKoBunList[key];
                    let _koBun = db.data.koBuns.find( (v) => v.koBId == obj.koBId );
                    logger.info( db_module.logKoBunUpdateYtBId(_koBun, ytBId) );
                    _koBun.ytBId = ytBId;
                }
                
                if( _isKoTextNext ){
                    logger.info( db_module.logKoBunDelete(nextKoBId) );
                    await db_module.deleteKoBun( db, nextKoBId );
                }
            }
            else{
                logger.info( db_module.logKoBunUpdateKoText(nextKoBun, _concatKoText) );
                nextKoBun.koText = _concatKoText;
                logger.info( db_module.logYTBUpdateKoBId(ytb, nextKoBun.koBId) );
                ytb.koBId = nextKoBun.koBId;

                let _nextKoBunList = db.data.koBuns.filter( (v) => v.ytBId == nextYtBId );
                for( let key in _nextKoBunList ){
                    let obj = _nextKoBunList[key];
                    let _koBun = db.data.koBuns.find( (v) => v.koBId == obj.koBId );
                    logger.info( db_module.logKoBunUpdateYtBId(_koBun, ytBId) );
                    _koBun.ytBId = ytBId;
                }
            }
        }

        //hukumu
        let nextHukumus = await db_module.getHukumu(db, nextJaBId);

        for( let idx in nextHukumus ){
            let obj = nextHukumus[idx];

            let hukumu = db.data.hukumu.find( (v) => 
                v.jaBId == obj.jaBId && v.startOffset == obj.startOffset && v.endOffset == obj.endOffset
            )
            if( hukumu != undefined ){
                logger.info( db_module.logHukumuUpdateJaBIdOffsets(hukumu, jaBId, hukumu.startOffset + _critJaText, hukumu.endOffset + _critJaText) );
                hukumu.jaBId = jaBId;
                hukumu.startOffset = hukumu.startOffset + _critJaText;
                hukumu.endOffset = hukumu.endOffset + _critJaText;
            }
        }

        logger.info( db_module.logJaBunDelete(nextJaBId) );
        await db_module.deleteJaBun(db, nextJaBId);
        logger.info( db_module.logYTBDelete(nextYtBId) );
        await db_module.deleteYTBun(db, videoId, nextYtBId);
        
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

router.get('/', getBun);
router.post('/', postBun);
router.delete('/', deleteBun);

router.put('/time', updateTime);
router.put('/jaText', updateJaText);

router.put('/bunkatsu', bunkatsuJaText);
router.put('/heigou', heigouJaTextNext);

export default router;