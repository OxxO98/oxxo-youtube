import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from './core/logger.js';

import _ from 'lodash'

interface HukumuList {
    jaBId : string;
    jaText : string;
    startOffset : number;
    endOffset : number;
}

//현재꺼 제외
async function getHukumuList(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, jaBId, startOffset, endOffset, hyouki } = req.query;

        let start = Number(startOffset);
        let end = Number(endOffset);

        //문장에서 hyouki가 있는 것을 모두 검색
        let timeline = await db_module.getTimeline(db, videoId);
        let jaBuns = timeline
            .filter( (v) => v.jaBId !== null )
            .map( (v) => db.data.jaBuns.find( (ja) => ja.jaBId == v.jaBId  ) );

        let regexp = new RegExp(`${hyouki}`, 'g');

        let list : HukumuList[][] = _.map( jaBuns, (v) => {
            let matched = v.jaText.matchAll(regexp);
            let all = [...matched]

            if(all.length != 0){
                return all.map( (m) => {
                    return {
                        jaBId : v.jaBId,
                        jaText : v.jaText,
                        startOffset : m.index,
                        endOffset : m.index + hyouki.length
                    }
                })
            };
        }).filter( (v) => v !== undefined );
        
        let compactedList : HukumuList[] = ( _.compact(list).flat() ).filter( (v) => 
            !(db.data.hukumu
                .find( (hu) => 
                    hu.jaBId == v.jaBId &&
                    (   
                        ( v.startOffset <= hu.startOffset && v.endOffset > hu.startOffset ) ||
                        ( v.startOffset < hu.endOffset && v.endOffset >= hu.endOffset ) ||
                        ( v.startOffset >= hu.startOffset && v.endOffset <= hu.endOffset )
                    )
                )
            )
        );

        res.send({
            message : 'success',
            data : compactedList
        });
    })
}

async function getOsusumeList(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { hyouki } = req.query;

        let joinList = db.data.hukumu.map( (v) => {
            return {
                ...v,
                ...db.data.hyouki.find( (hy) => v.hyId == hy.hyId )
            }
        })
        let list = joinList.filter( (v) => v.hyouki == hyouki );

        list = _.uniqBy(list, 'tId');

        list = list.map( (v) => {
            let imi = db.data.imi.filter( (m) => m.tId == v.tId ).map( (t) => t.koText);
            return {
                ...v, 
                imi : imi
            }
        })

        res.send({
            message : 'success',
            data : list
        });
    });
}

async function getTangoList(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId } = req.query;

        //해당 video에 있는 단어를 검색
        //부하가 있을 지도 모름
        let timeline = await db_module.getTimeline(db, videoId);
        let joinList = timeline.map( (v) => {
            let hukumu = db.data.hukumu.filter( (h) => h.jaBId == v.jaBId );
            return hukumu;
        }).flat();

        joinList = _.compact(joinList).map( (v) => {
            return {
                ...v,
                ...db.data.hyouki.find( (hy) => hy.hyId == v.hyId )
            }
        });

        joinList = joinList.map( (v) => {
            let joinHukumu = db.data.hukumu.filter( (h) => h.tId == v.tId ) 
                .map( (h) => {
                    return {
                        ...h,
                        ...db.data.hyouki.find( (hy) => h.hyId == hy.hyId )
                    }
                })
                .filter( (h, i, arr) => arr.indexOf(h) == i )
                .map( (h) => {
                    return {
                        hyouki : h.hyouki,
                        yomi : h.yomi
                    }
                })
            joinHukumu = _.uniqBy(
                joinHukumu
                , 'hyouki'
            )

            return {
                ...v,
                list : joinHukumu,
                imi : db.data.imi.filter( (t) => t.tId == v.tId ).map( (t) => t.koText )
            }
        })

        res.send({
            message : 'success',
            data : _.uniqBy(joinList, 'tId')
        });
    });
}

async function commitHukumu(req : RouterRequest, res : RouterResponse) {
    await db_connection(req, res, async(db) => {
        let { jaBId, startOffset, endOffset, tId, hyId } = req.body;

        let start = Number(startOffset);
        let end = Number(endOffset);

        logger.info( db_module.logHukumuInsert(jaBId, start, end, hyId, tId) )
        db.data.hukumu.push({
            jaBId : jaBId,
            startOffset : start,
            endOffset : end,
            hyId : hyId,
            iId : null,
            tId : tId
        })

        await db.write();

        res.send({
            message : 'success',
            data : { 
                jaBId : jaBId
            }
        });
    });
}

router.get('/hukumu', getHukumuList);
router.get('/osusume', getOsusumeList);
router.get('/tango', getTangoList);

router.post('/commit', commitHukumu);

export default router;