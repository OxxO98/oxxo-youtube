import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from "./core/logger.js";
import * as db_cascade from "./core/db_cascading_module.js";

import _ from 'lodash'

import { nanoid } from "nanoid";

import type { YTB, HukumuData } from '../types/db_types.js'

function _is_available(timeline : YTB[], startTime : number, endTime : number, excludeYtBId : string | null = null){
    let incomingContainsExisting = timeline
        .filter( (v) => startTime <= v.startTime && v.endTime <= endTime )
    let existingContainsIncoming = timeline
        .filter( (v) => v.startTime <= startTime && endTime <= v.endTime )

    if( excludeYtBId !== null ){
        let _curr = timeline.find( (v) => v.ytBId === excludeYtBId );
        if( _curr === undefined || endTime <= _curr.startTime || _curr.endTime <= startTime ){
            return false;
        }
        incomingContainsExisting = incomingContainsExisting.filter( (v) => v.ytBId !== excludeYtBId );
        existingContainsIncoming = existingContainsIncoming.filter( (v) => v.ytBId !== excludeYtBId );
    }

    if( incomingContainsExisting.length > 0 || existingContainsIncoming.length > 0 ){
        return false;
    } 
    else{
        return true;
    }    
}

function _is_adjust(ytb : YTB, critTime : number){
    if( ytb.startTime < critTime && critTime < ytb.endTime ){
        return true;
    }
    return false;
}

function _get_side_timeline(timeline : YTB[], ytBId : string){
    let curr = timeline
        .map( (v, i) => { return { ...v, i } })
        .find( (v) => v.ytBId == ytBId )
    
    if( curr === undefined ){
        return null;
    }

    let prev = null, next = null;
    if( curr.i - 1 >= 0 ){
        prev = timeline[curr.i-1];
    }

    if( curr.i + 1 <= timeline.length-1 ){
        next = timeline[curr.i+1];
    }

    return {
        prev : prev, next : next
    }
}

//YTB->JA with Hukumu
async function getBun(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { bId } = req.query;

        let jaBun = await db_module.getJaBun(db, bId);

        if( jaBun == undefined ){
            res.send({
                message : 'error',
                data : {}
            });
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

//YTB
async function postBun(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, translationDirection, value, startTime, endTime } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);

        if( _is_available(timeline, startTime, endTime) == false ){
            res.send({
                message : 'error',
                data : {}
            });
            return;
        }

        let _prev_list = timeline
            .map( (v, i) => { return { ...v, i } })
            .filter( (v) => v.startTime < startTime && startTime < v.endTime );
        let _next_list = timeline
            .map( (v, i) => { return { ...v, i } })
            .filter( (v) => v.startTime < endTime && endTime < v.endTime );

        if( _prev_list.length == 1 && _next_list.length == 0 ){
            let _prev_ytb = await db_module.getYTBun(timeline, _prev_list[0].ytBId);

            logger.info( db_module.logYTBUpdateTime(_prev_ytb, _prev_ytb.startTime, startTime) );
            _prev_ytb.endTime = startTime;
        }
        else if( _prev_list.length == 0 && _next_list.length == 1 ){
            let _next_ytb = await db_module.getYTBun(timeline, _next_list[0].ytBId);

            logger.info( db_module.logYTBUpdateTime(_next_ytb, endTime, _next_ytb.endTime) );
            _next_ytb.startTime = endTime;
        }
        else if( _prev_list.length == 1 && _next_list.length == 1 && _next_list[0].i - _prev_list[0].i == 1){
            let _prev_ytb = await db_module.getYTBun(timeline, _prev_list[0].ytBId);
            let _next_ytb = await db_module.getYTBun(timeline, _next_list[0].ytBId);

            logger.info( db_module.logYTBUpdateTime(_prev_ytb, _prev_ytb.startTime, startTime) );
            logger.info( db_module.logYTBUpdateTime(_next_ytb, endTime, _next_ytb.endTime) );
            _prev_ytb.endTime = startTime;
            _next_ytb.startTime = endTime;
        }

        let _YTBID = nanoid(10);

        if( translationDirection === 'ja-ko' ){
            let _JABID = nanoid(10);

            logger.info( db_module.logYTBInsert(_YTBID, _JABID, null, startTime, endTime) );
            timeline.push({
                ytBId : _YTBID,
                jaBId : _JABID,
                koBId : null,
                startTime : startTime,
                endTime : endTime
            })

            let jaBuns = await db_module.getJaBuns(db);
            logger.info( db_module.logJaBunInsert(_JABID, value, _YTBID) );
            jaBuns.push({
                jaBId : _JABID,
                jaText : value,
                ytBId : _YTBID
            })
        }
        else{
            let _KOBID = nanoid(10);

            logger.info( db_module.logYTBInsert(_YTBID, null, _KOBID, startTime, endTime) );
            timeline.push({
                ytBId : _YTBID,
                jaBId : null,
                koBId : _KOBID,
                startTime : startTime,
                endTime : endTime
            })

            let koBuns = await db_module.getKoBuns(db);
            logger.info( db_module.logKoBunInsert(_KOBID, value, _YTBID) );
            koBuns.push({
                koBId : _KOBID,
                koText : value,
                ytBId : _YTBID
            })
        }
        
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function deleteBun(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId } = req.query;

        let jaBunList = db.data.jaBuns
            .filter( (v) => v.ytBId == ytBId );

        for( let jaBun of jaBunList ){
            await db_cascade.delete_hukumu_in_ja(db, jaBun.jaBId);
        }

        logger.info( db_module.logJaBunDeleteYtBId(ytBId) );
        db.data.jaBuns = db.data.jaBuns.filter( (v) => v.ytBId != ytBId );
        logger.info( db_module.logKoBunDeleteYtBId(ytBId) );
        db.data.koBuns = db.data.koBuns.filter( (v) => v.ytBId != ytBId );
        logger.info( db_module.logYTBDelete(ytBId) );
        await db_module.deleteYTBun(db, videoId, ytBId);

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

//YTB
async function updateTime(req : RouterRequest, res : RouterResponse) {
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, startTime, endTime } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);
        
        let ytb = await db_module.getYTBun(timeline, ytBId);

        if( _is_available(timeline, startTime, endTime, ytBId) == false ){
            res.send({
                message : 'error',
                data : {}
            });
            return;
        }

        let { prev, next } = _get_side_timeline(timeline, ytBId);
        if( prev !== null && _is_adjust(prev, startTime) ){
            let _prev_ytb = await db_module.getYTBun(timeline, prev.ytBId);

            logger.info( db_module.logYTBUpdateTime(_prev_ytb, _prev_ytb.startTime, startTime) );
            _prev_ytb.endTime = startTime;
        }

        if( next !== null && _is_adjust(next, endTime) ){
            let _next_ytb = await db_module.getYTBun(timeline, next.ytBId);

            logger.info( db_module.logYTBUpdateTime(_next_ytb, endTime, _next_ytb.endTime) );
            _next_ytb.startTime = endTime;
        }
        
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

//YTB->both but ja first
async function bunkatsuJaText(req : RouterRequest, res : RouterResponse){
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
        
        let _prevJaText = jaBun.jaText.substring(0, critJaText);
        let _nextJaText = jaBun.jaText.substring(critJaText);
        let _prevKoText = _isKoText ? koBun.koText.substring(0, critKoText) : null;
        let _nextKoText = _isKoText ? koBun.koText.substring(critKoText) : null;

        //trim
        let _trim = _nextJaText.match(/^[、\s]*/)?.[0].length ?? 0;
        _prevJaText = _prevJaText.replace(/[、\s]*$/, '');
        _nextJaText = _nextJaText.replace(/^[、\s]*/, '');
        _prevKoText = _isKoText ? _prevKoText.replace(/[,\s]*$/, '') : null;
        _nextKoText = _isKoText ? _nextKoText.replace(/^[,\s]*/, '') : null;

        //prev수정
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

        logger.info( db_module.logYTBInsert(_YTBID, _JABID, _KOBID, _critTime, _endTime) );
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

        //hukumu
        let hukumus = await db_module.getHukumu(db, ytb.jaBId);

        let nextHukumu = hukumus.filter( (v) => v.startOffset >= critJaText );
        for( let idx in nextHukumu ){
            let obj = nextHukumu[idx];

            let hukumu = db.data.hukumu.find( (v) => 
                v.jaBId == obj.jaBId && v.startOffset == obj.startOffset && v.endOffset == obj.endOffset
            )
            if( hukumu != undefined ){
                logger.info( db_module.logHukumuUpdateJaBIdOffsets(hukumu, _JABID, hukumu.startOffset - critJaText - _trim, hukumu.endOffset - critJaText - _trim) );
                hukumu.jaBId = _JABID;
                hukumu.startOffset = hukumu.startOffset - critJaText - _trim;
                hukumu.endOffset = hukumu.endOffset - critJaText - _trim;
            }
        }
        
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });

    })
}

//YTB->both but ja first
async function heigouJaTextNext(req : RouterRequest, res : RouterResponse){
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

async function getTranslate(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);

        let ytb = await db_module.getYTBun(timeline, ytBId); 

        let ret = {
            jaBun : null,
            koBun : null,
            jaList : null,
            koList : null
        }

        if(ytb.jaBId != null){
            let jaBun = await db_module.getJaBun(db, ytb.jaBId);
        
            let jaBunList = db.data.jaBuns
                .filter( (v) => v.ytBId == ytb.ytBId )
                .filter( (v) => v.jaBId != ytb.jaBId );

            ret.jaBun = jaBun;
            ret.jaList = jaBunList;
        }
        
        if(ytb.koBId != null){
            let koBun = await db_module.getKoBun(db, ytb.koBId);
            let koBunList = db.data.koBuns
                .filter( (v) => v.ytBId == ytb.ytBId )
                .filter( (v) => v.koBId != ytb.koBId );
        
            ret.koBun = koBun;
            ret.koList = koBunList;
        }

        res.send({
            data : ret
        });
    })
}

function extractEnglish(text : string){
    if(typeof text !== 'string') return '';

    let matched = text.match(/[A-Za-z]+(?:['-][A-Za-z]+)*/g);

    return matched == null ? '' : matched.join(' ');
}

async function getAutoTranslate(req : RouterRequest, res : RouterResponse) {
    await db_connection(req, res, async (db) => {
        let { videoId, value, translationDirection } = req.query;

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
                    data : ""
                })
                return;
            }

            if( translationDirection === 'ja-ko' ){
                let _find = joinText.find( (v) => v.jaText == value );

                if( _find === undefined || _find?.koText === undefined ){
                    let en_text = extractEnglish(value);

                    if( en_text === '' ){
                        res.send({
                            message : 'empty',
                            data : ""
                        })
                        return;
                    }
                    else{
                        res.send({
                            message : 'success',
                            data : en_text
                        })
                        return;
                    }
                }

                res.send({
                    message : 'success',
                    data : _find.koText
                });
                return;
            }
            else{
                let _find = joinText.find( (v) => v.koText == value );

                if( _find === undefined || _find?.jaText === undefined ){
                    let en_text = extractEnglish(value);

                    if( en_text === '' ){
                        res.send({
                            message : 'empty',
                            data : ""
                        })
                        return;
                    }
                    else{
                        res.send({
                            message : 'success',
                            data : en_text
                        })
                        return;
                    }
                }

                res.send({
                    message : 'success',
                    data : _find.jaText
                });
                return;
            }
        }
    })
}
async function getYTBHukumus(req : RouterRequest, res : RouterResponse) {
    await db_connection(req, res, async (db) => {
        let { ytBId } = req.query;

        let jaBunList = db.data.jaBuns
            .filter( (v) => v.ytBId == ytBId );

        let hukumuArr : HukumuData[] = [];
        for( let jaBun of jaBunList ){
            let _hukumus = await db_module.getHukumu( db, jaBun.jaBId );
            hukumuArr.push(..._hukumus);
        }

        hukumuArr = _.uniqBy(hukumuArr, 'hyId');

        res.send({
            data : hukumuArr,
            message : 'success'
        })
    })
}

router.get('/', getBun); //ja with hukumu (BUN)
router.post('/', postBun); //(YTB)
router.delete('/', deleteBun); // cascading (YTB)

router.put('/time', updateTime);

router.put('/bunkatsu', bunkatsuJaText);
router.put('/heigou', heigouJaTextNext);

router.get('/translate', getTranslate); //both nullable
router.get('/translate/auto', getAutoTranslate);

router.get('/hukumu', getYTBHukumus);

export default router;
