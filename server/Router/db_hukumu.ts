import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from "./core/logger.js"

import { nanoid } from "nanoid";

async function postHukumu(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { jaBId, startOffset, endOffset, hyouki, yomi, hyoukiStr, yomiStr, tId } = req.body;
        //hyouki 구분자 _ , yomi 구분자 _ , 0(공백)
        //hyoukiStr 전체 표기, yomiStr 전체 읽기

        let start = Number(startOffset);
        let end = Number(endOffset);

        let _TID = tId;
        if( tId == undefined ){
            console.log('tId없음 : 새로운 TANGO생성');
            _TID = nanoid(10);

            logger.info( db_module.logTangoInsert(_TID) )
            db.data.tango.push({ tId : _TID });
        }

        let _HYID;
        let existHyouki = await db_module.getExistHyouki(db, hyoukiStr, hyouki, yomi);
        if(existHyouki == null){
            console.log('hyId없음 : 새로운 HYOUKI생성');
            _HYID = nanoid(10);

            logger.info( db_module.logHyoukiInsert(_HYID, yomiStr, hyoukiStr, _TID) )
            db.data.hyouki.push({
                hyId : _HYID,
                textData : [ ...db_module.makeTextData(hyouki, yomi)],
                yomi : yomiStr,
                hyouki : hyoukiStr,
                tId : _TID
            })
        }
        else{
            _HYID = existHyouki.hyId;
        }
        console.log('새로운 HUKUMU 생성');
        logger.info( db_module.logHukumuInsert( jaBId, start, end, _HYID, _TID) )
        db.data.hukumu.push({
            jaBId : jaBId,
            startOffset : start,
            endOffset : end,
            hyId : _HYID,
            iId : null,
            tId : _TID
        })

        console.log('한자 생성');
        let arrKanji = db_module.getKanjiArr(hyoukiStr);
        for( let kanji of arrKanji ){
            let _KID = await db_module.getExistKId(db, kanji);
            
            if( _KID == null ){
                console.log('새로운 한자 생성');
                _KID = nanoid(10);

                logger.info( db_module.logKanjiInsert(_KID, kanji) );
                db.data.kanji.push({
                    kId : _KID,
                    jaText : kanji
                })
            }

            let _existKomu = await db_module.getExistKomu(db, _HYID, _KID);
            if( _existKomu == false ){
                logger.info( db_module.logKomuInsert(_HYID, _KID) );
                db.data.komu.push({
                    hyId : _HYID,
                    kId : _KID
                })
            }

        }
        
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function getHukumu(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { jaBId } = req.query;

        let hukumuArr = await db_module.getHukumu( db, jaBId );

        res.send({
            data : hukumuArr,
            message : 'success'
        });
    })
}

async function checkHukumu(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { jaBId, startOffset, endOffset } = req.query;

        let hukumu = db.data.hukumu.find( (v) => {
            return v.jaBId == jaBId && (
                ( v.startOffset <= startOffset && v.endOffset > startOffset ) ||
                ( v.startOffset < endOffset && v.endOffset >= endOffset ) ||
                ( v.startOffset >= startOffset && v.endOffset <= endOffset )
            )
        })

        if(hukumu == undefined){
            res.send({
                message : 'empty',
                data : []
            });
            return;
        }
        else{
            let hyouki = db.data.hyouki.find( (v) => v.hyId == hukumu.hyId );

            res.send({
                message : 'success',
                data : [{
                    jaBId : hukumu.jaBId,
                    tId : hukumu.tId,
                    hyId : hukumu.hyId,
                    hyouki : hyouki.hyouki,
                    yomi : hyouki.yomi,
                    startOffset : hukumu.startOffset,
                    endOffset : hukumu.endOffset,
                    textData : hyouki.textData
                }]
            })
            return;
        }
    })
}

async function updateHukumu(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        //읽기만 업데이트
        let { jaBId, startOffset, endOffset, hyId, hyouki, yomi, hyoukiStr, yomiStr } = req.body;

        let start = Number(startOffset);
        let end = Number(endOffset);

        let moreExistHukumu = await db_module.getMoreExistHyId(db, hyId);

        if(!moreExistHukumu){
            let hy = db.data.hyouki.find( (v) => v.hyId == hyId);
            if( hy ){
                logger.info( db_module.logHyoukiUpdateHyoukiYomi(hy, hyoukiStr, yomiStr) );
            }
            await db_module.updateHyouki(db, hyId, hyouki, yomi, hyoukiStr, yomiStr);
        }
        else{
            //이미 있는지 확인
            let existHyouki = await db_module.getExistHyouki(db, hyoukiStr, hyouki, yomi);

            let _HYID;
            let _TID;
            if( existHyouki != null ){
                _HYID = existHyouki.hyId;
                _TID = existHyouki.tId;
            }
            else{
                _HYID = nanoid(10);

                logger.info( db_module.logHyoukiInsert(_HYID, yomiStr, hyoukiStr, _TID) );
                db.data.hyouki.push({
                    hyId : _HYID,
                    textData : [ ...db_module.makeTextData(hyouki, yomi)],
                    yomi : yomiStr,
                    hyouki : hyoukiStr,
                    tId : _TID
                })
            }

            let _hukumu = db.data.hukumu.find( (v) => 
                v.jaBId == jaBId && v.startOffset == start && v.endOffset == end
            )
            if( _hukumu ){
                logger.info( db_module.logHukumuUpdateHyId(_hukumu, _HYID) )
            }
            await db_module.updateHukumHyouki(db, jaBId, start, end, _HYID);
        }

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function deleteHukumu(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        //읽기만 업데이트
        let { jaBId, startOffset, endOffset, hyId } = req.query;
        //hyouki, yomi, hyoukiStr, yomiStr

        let start = Number(startOffset);
        let end = Number(endOffset);

        let moreExistHukumu = await db_module.getMoreExistHyId(db, hyId);

        if(!moreExistHukumu){
            logger.info( db_module.logHyoukiDelete(hyId) );
            await db_module.deleteHyouki( db, hyId );

            let kIds = await db_module.getKIds(db, hyId);
            console.log(hyId, kIds);
            for( let kId of kIds ){
                let moreExistKanji = await db_module.getMoreExistKanji(db, hyId, kId);
                if( !moreExistKanji ){
                    logger.info( db_module.logKanjiDelete(kId) );
                    await db_module.deleteKanji(db, kId);
                }
            }

            logger.info( db_module.logKomuDelete(hyId) );
            await db_module.deleteKomu( db, hyId );
            
            let _hukumu = await db_module.getExistHukumu( db, jaBId, start, end);
            if( await db_module.getMoreExistTId( db, _hukumu.tId ) == false ){
                logger.info( db_module.logTangoDelete(_hukumu.tId) );
                db.data.tango = db.data.tango.filter( (v) => v.tId != _hukumu.tId );
            }
        }
        logger.info( db_module.logHukumuDelete( jaBId, start, end ) );
        await db_module.deleteHukumu( db, jaBId, start, end );

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

router.get('/', getHukumu);
router.post('/', postHukumu);
router.put('/', updateHukumu);
router.delete('/', deleteHukumu);

router.get('/check', checkHukumu);

export default router;
