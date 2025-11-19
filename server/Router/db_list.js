import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from './core/logger.js';

import _ from 'lodash'

import { nanoid } from "nanoid";

//현재꺼 제외
async function getHukumuList(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, jaBId, startOffset, endOffset, hyouki } = req.query;

        let start = Number(startOffset);
        let end = Number(endOffset);

        //문장에서 hyouki가 있는 것을 모두 검색
        let timeline = await db_module.getTimeline(db, videoId);
        let jaBuns = timeline.map( (v) => db.data.jaBuns.find( (ja) => ja.jaBId == v.jaBId  ) );

        let list = _.map( jaBuns, (v) => {
            let regexp = new RegExp(`${hyouki}`, 'g');
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
        })
        list = _.compact(list).flat().filter( (v) => 
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
            data : list
        });
    })
}

async function getOsusumeList(req, res){
    await db_connection(req, res, async(db) => {
        let { hyouki } = req.query;

        let joinList = db.data.hukumu.map( (v) => {
            return {
                ...v,
                ...db.data.hyouki.find( (hy) => v.hyId == hy.hyId )
            }
        })
        let list = joinList.filter( (v) => v.hyouki == hyouki );

        res.send({
            message : 'success',
            data : _.uniqBy(list, 'tId')
        });
    });
}

async function getTangoList(req, res){
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

        res.send({
            message : 'success',
            data : _.uniqBy(joinList, 'tId')
        });
    });
}

async function commitHukumu(req, res) {
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
            data : {}
        });
    });
}

router.get('/hukumu', getHukumuList);
router.get('/osusume', getOsusumeList);
router.get('/tango', getTangoList);

router.post('/commit', commitHukumu);

export default router;