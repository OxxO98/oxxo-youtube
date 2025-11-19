import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from './core/logger.js';

import { nanoid } from "nanoid";

async function getImi(req, res){
    await db_connection(req, res, async(db) => {
        let { jaBId, startOffset, endOffset } = req.query;

        let hukumu = db.data.hukumu.find( (v) => 
            v.jaBId == jaBId &&
            v.startOffset == startOffset &&
            v.endOffset == endOffset
        )

        if( !hukumu ){ 
            res.send({
                message : 'empty',
                data : {}
            }); 
            return; 
        }

        let { iId, tId } = hukumu;

        let imi = db.data.imi.find( (v) => v.iId == iId );
        let iIds = db.data.imi
            .filter( (v) => v.tId == tId )

        let ret = {
            iId : iId,
            imi : imi == undefined ? null : imi.koText,
            iIds : iIds
        }

        res.send({
            message : 'success',
            data : ret
        });
    })
}

async function postImi(req, res){
    await db_connection(req, res, async(db) => {
        let { jaBId, startOffset, endOffset, tId, value } = req.body;

        let _IID = nanoid(10);
        logger.info( db_module.logImiInsert( _IID, value, tId) );
        db.data.imi.push({
            iId : _IID,
            koText : value,
            tId : tId
        });

        let _hukumu = db.data.hukumu.find( (v) => 
            v.jaBId == jaBId &&
            v.startOffset == startOffset &&
            v.endOffset == endOffset
        )
        logger.info( db_module.logHukumuUpdateIId(_hukumu, _IID) );
        _hukumu.iId = _IID;

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function setImi(req, res){
    await db_connection(req, res, async(db) => {
        let { jaBId, startOffset, endOffset, iId } = req.body;

        let _hukumu = db.data.hukumu.find( (v) => 
            v.jaBId == jaBId &&
            v.startOffset == startOffset &&
            v.endOffset == endOffset
        )
        logger.info( db_module.logHukumuUpdateIId(_hukumu, iId) );
        _hukumu.iId = iId;

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function deleteImi(req, res){
    await db_connection(req, res, async(db) => {
        let { jaBId, startOffset, endOffset, iId } = req.query;

        let exist = db.data.hukumu.filter( (v) => v.iId == iId ).length;

        let _hukumu = db.data.hukumu.find( (v) => 
            v.jaBId == jaBId &&
            v.startOffset == startOffset &&
            v.endOffset == endOffset
        )
        logger.info( db_module.logHukumuUpdateIId(_hukumu, null) );
        _hukumu.iId = null;

        //현재 hukumu제외
        if(exist == 1){
            logger.info( db_module.logImiDelete(iId) );
            db.data.imi = db.data.imi.filter( 
                (v) => v.iId != iId
            )
        }

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

router.get('/', getImi);

router.put('/', setImi);
router.post('/', postImi);
router.delete('/', deleteImi);

export default router;