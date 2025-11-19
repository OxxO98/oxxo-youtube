import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from './core/logger.js';

import { nanoid } from "nanoid";
import { message } from "antd";

async function getTranslate(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);

        let ytb = await db_module.getYTBun(timeline, ytBId); 

        let jaBun = await db_module.getJaBun(db, ytb.jaBId);
        
        let jaBunList = db.data.jaBuns
            .filter( (v) => v.ytBId == ytb.ytBId )
            .filter( (v) => v.jaBId != ytb.jaBId );

        let ret = {
            jaBun : jaBun,
            koBun : null,
            jaList : jaBunList,
            koList : null
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

async function postTranslate(req, res){
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

async function putTranslate(req, res){
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

async function deleteTranslate(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, koBId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);

        logger.info( db_module.logKoBunDelete(koBId) );
        await db_module.deleteKoBun( db, koBId );

        let koBunList = db.data.koBuns
            .filter( (v) => v.ytBId == ytb.ytBId );
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

async function getRepresentive(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);
        
        if(ytb.koBId == null){
            res.send({
                message : 'empty',
                data : {}
            });
            return;
        }
        else{
            let koBun = await db_module.getKoBun(db, ytb.koBId);
            let jaBun = await db_module.getJaBun(db, ytb.jaBId);

            res.send({
                message : 'success',
                data : {
                    ytBId : ytBId,
                    koBId : ytb.koBId,
                    jaBId : ytb.jaBId,
                    koText : koBun != null ? koBun.koText : '',
                    jaText : jaBun.jaText
                }
            })
            return;
        }
    })
}

async function setRepresentive(req, res){
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

router.get('/', getTranslate);
router.post('/', postTranslate);
router.put('/', putTranslate);
router.delete('/', deleteTranslate);

router.get('/representive', getRepresentive);
router.put('/representive', setRepresentive);

export default router;