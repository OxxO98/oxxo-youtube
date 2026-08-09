import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from "./core/logger.js";
import * as db_cascade from "./core/db_cascading_module.js";

import { nanoid } from "nanoid";

async function postJaText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, value } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);
        let jaBuns = await db_module.getJaBuns(db);

        let _JABID = nanoid(10);

        logger.info( db_module.logJaBunInsert(_JABID, value, ytBId) );
        jaBuns.push({
            jaBId : _JABID,
            jaText : value,
            ytBId : ytBId
        })

        logger.info( db_module.logYTBUpdateJaBId(ytb, _JABID) );
        ytb.jaBId = _JABID;

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function updateJaText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { jaBId, jaText, modifiedObj, deletedObj } = req.body;

        for( let key in modifiedObj ){
            let obj = modifiedObj[key];

            if(obj.tag != 'modified'){ continue }
            if(obj.find == null || obj.find == undefined ){ continue }

            if( obj.hyouki != obj.find.str ){
                //삭제 -> 생성
                let hukumu = await db_module.getExistHukumu( db, jaBId, obj.startOffset, obj.endOffset );
                if( hukumu != null ){
                    let existHyouki = db.data.hyouki.find( (v) => v.hyouki == obj.find.str );
                    if(existHyouki != undefined){
                        console.log('이미 있는 표기 : 연결');
                        logger.info( db_module.logHukumuUpdateHyId(hukumu, existHyouki.hyId) );
                        hukumu = {
                            ...hukumu,
                            hyId : existHyouki.hyId
                        }
                    }
                    else{
                        if( await db_module.getMoreExistHyId( db, obj.hyId ) == false ){
                            logger.info( db_module.logHyoukiDelete(obj.hyId) );
                            await db_module.deleteHyouki( db, obj.hyId );

                            let kIds = await db_module.getKIds(db, obj.hyId);
                            for( let kId of kIds ){
                                let moreExistKanji = await db_module.getMoreExistKanji(db, obj.hyId, kId);
                                if( !moreExistKanji ){
                                    logger.info( db_module.logKanjiDelete(kId) );
                                    await db_module.deleteKanji(db, kId);
                                }
                            }

                            logger.info( db_module.logKomuDelete(obj.hyId) );
                            await db_module.deleteKomu( db, obj.hyId );
                        }
                        console.log('hyId없음 : 새로운 HYOUKI생성');
                        let _HYID = nanoid(10);

                        logger.info( db_module.logHyoukiInsert(_HYID, obj.yomi, obj.find.str, obj.tId) );
                        db.data.hyouki.push({
                            hyId : _HYID,
                            textData : [ ...db_module.makeTextData(obj.find.hyouki, obj.find.yomi) ],
                            yomi : obj.yomi,
                            hyouki : obj.find.str,
                            tId : obj.tId
                        })

                        let arrKanji = db_module.getKanjiArr(obj.find.str);
                        for( let kanji of arrKanji ){
                            let _KID = await db_module.getExistKId(db, kanji);

                            if( _KID == null ){
                                console.log('새로운 한자 생성');
                                _KID = nanoid(10);
                            }

                            logger.info( db_module.logKanjiInsert(_KID, kanji) );
                            db.data.kanji.push({
                                kId : _KID,
                                jaText : kanji
                            })

                            //순서 변경 > 괜찮은지 확인
                            let _existKomu = await db_module.getExistKomu(db, _HYID, _KID);
                            if( _existKomu == false ){
                                logger.info( db_module.logKomuInsert(_HYID, _KID) );
                                db.data.komu.push({
                                    hyId : _HYID,
                                    kId : _KID
                                })
                            }
                        }

                        logger.info( db_module.logHukumuUpdateHyId(hukumu, _HYID) );
                        hukumu = {
                            ...hukumu,
                            hyId : _HYID
                        }
                    }
                }
            }
            if( obj.startOffset != obj.find.startOffset || obj.endOffset != obj.find.endOffset ){
                let hukumu = await db_module.getExistHukumu( db, jaBId, obj.startOffset, obj.endOffset );
                if( hukumu != null ){
                    console.log('HUKUMU 오프셋 변경');
                    logger.info( db_module.logHukumuUpdateOffsets(hukumu, obj.find.startOffset, obj.find.endOffset) );
                    hukumu.startOffset = obj.find.startOffset;
                    hukumu.endOffset = obj.find.endOffset;
                } 
            }
        }

        for( let key in deletedObj ){
            let obj = deletedObj[key];

            if( obj.find == null || obj.find == undefined ){
                if( await db_module.getMoreExistHyId( db, obj.hyId ) == false ){
                    console.log('더이상 쓰이지 않는 표기 : 삭제');
                    logger.info( db_module.logHyoukiDelete(obj.hyId) );
                    await db_module.deleteHyouki( db, obj.hyId );

                    let kIds = await db_module.getKIds(db, obj.hyId);
                    for( let kId of kIds ){
                        let moreExistKanji = await db_module.getMoreExistKanji(db, obj.hyId, kId);
                        if( !moreExistKanji ){
                            logger.info( db_module.logKanjiDelete(kId) );
                            await db_module.deleteKanji(db, kId);
                        }
                    }

                    logger.info( db_module.logKomuDelete(obj.hyId) );
                    await db_module.deleteKomu( db, obj.hyId );
                }
                if( await db_module.getMoreExistTId( db, obj.tId ) == false ){
                    console.log('더이상 쓰이지 않는 단어 : 삭제');
                    logger.info( db_module.logTangoDelete(obj.tId) );
                    db.data.tango = db.data.tango.filter( (v) => v.tId != obj.tId );
                }
                console.log('HUKUMU 삭제');
                logger.info( db_module.logHukumuDelete( jaBId, obj.startOffset, obj.endOffset ) );
                await db_module.deleteHukumu( db, jaBId, obj.startOffset, obj.endOffset );
            }
        }

        console.log('문장 jaText 수정');
        let jaBun = await db_module.getJaBun(db, jaBId);
        if( jaBun != null ){
            logger.info( db_module.logJaBunUpdateJaText(jaBun, jaText) );
            jaBun.jaText = jaText;
        }

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}
async function deleteJaText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, jaBId } = req.query;
        
        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);
        
        await db_cascade.delete_hukumu_in_ja(db, jaBId);

        logger.info( db_module.logJaBunDelete(jaBId) );
        await db_module.deleteJaBun( db, jaBId );

        let jaBunList = db.data.jaBuns
            .filter( (v) => v.ytBId == ytBId );
        if( jaBunList.length == 0 ){
            logger.info( db_module.logYTBUpdateJaBId(ytb, null) );
            ytb.jaBId = null;
        }
        else{
            logger.info( db_module.logYTBUpdateJaBId(ytb, jaBunList[0].jaBId) );
            ytb.jaBId = jaBunList[0].jaBId;
        }

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function getRepresentiveJaText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId } = req.query;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);
        
        if(ytb == null || ytb?.jaBId == null){
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
                    jaText : jaBun != null ? jaBun.jaText : '',
                }
            })
            return;
        }
    })
}

async function setRepresentiveJaText(req : RouterRequest, res : RouterResponse){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, jaBId } = req.body;

        let timeline = await db_module.getTimeline(db, videoId);
        let ytb = await db_module.getYTBun(timeline, ytBId);
        
        logger.info( db_module.logYTBUpdateJaBId(ytb, jaBId) );
        ytb.jaBId = jaBId;

        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

router.post('/', postJaText); // no cascading
router.put('/', updateJaText);
router.delete('/', deleteJaText); // no cascading

// router.get('/representive', getRepresentiveJaText) //deprecated
router.put('/representive', setRepresentiveJaText)

export default router;