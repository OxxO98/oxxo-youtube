import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from './core/logger.js';

import { nanoid } from "nanoid";

async function postKoText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, value } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);
        let koBuns = await db_module.getKoBuns(db);

        let _KOBID = nanoid(10);

        logger.info( db_module.logKoBunInsert(_KOBID, value, ytBId) );
        koBuns.push({
            koBId : _KOBID,
            koText : value,
            ytBId : ytBId
        })

        logger.info( db_module.logYTBUpdateKoBId(ytb, _KOBID) );
        ytb.koBId = _KOBID;

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function putKoText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, value } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);
        let koBun = await db_module.getKoBun(db, ytb.koBId);

        logger.info( db_module.logKoBunUpdateKoText(koBun, value) );
        koBun.koText = value;

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function deleteKoText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, koBId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);

        logger.info( db_module.logKoBunDelete(koBId) );
        await db_module.deleteKoBun( db, koBId );

        let koBunList = db.data.koBuns
            .filter( (v) => v.ytBId == ytBId );
        if( koBunList.length == 0 ){
            logger.info( db_module.logYTBUpdateKoBId(ytb, null) );
            ytb.koBId = null;
        }
        else{
            logger.info( db_module.logYTBUpdateKoBId(ytb, koBunList[0].koBId) );
            ytb.koBId = koBunList[0].koBId;
        }

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function getRepresentiveKoText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);
        
        let koBun = ytb.koBId !== null ? await db_module.getKoBun(db, ytb.koBId) : null;
        let jaBun = ytb.jaBId !== null ? await db_module.getJaBun(db, ytb.jaBId) : null;

        res.send({
            message : 'success',
            data : {
                ytBId : ytBId,
                koBId : ytb.koBId,
                jaBId : ytb.jaBId,
                koText : koBun != null ? koBun.koText : '',
                jaText : jaBun != null ? jaBun.jaText : '',
            }
        })
        return;
    })
}

async function setRepresentiveKoText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, koBId } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);
        
        logger.info( db_module.logYTBUpdateKoBId(ytb, koBId) );
        ytb.koBId = koBId;

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

router.post('/', postKoText); // no cascading
router.put('/', putKoText);
router.delete('/', deleteKoText); //no cascading

// router.get('/representive', getRepresentiveKoText); //deprecated
router.put('/representive', setRepresentiveKoText);

export default router;