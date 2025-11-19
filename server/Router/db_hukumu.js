import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from "./core/logger.js"

import { nanoid } from "nanoid";

async function postHukumu(req, res){
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
                textData : [ ...await db_module.makeTextData(hyouki, yomi)],
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
        let arrKanji = await db_module.getKanjiArr(hyoukiStr);
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

            logger.info( db_module.logKomuInsert(_HYID, _KID) );
            db.data.komu.push({
                hyId : _HYID,
                kId : _KID
            })
        }
        
        await db.write();

        res.send({
            message : 'success',
            data : {}
        });
    })
}

async function getHukumu(req, res){
    await db_connection(req, res, async(db) => {
        let { jaBId } = req.query;

        let hukumuArr = await db_module.getHukumu( db, jaBId );

        res.send({
            data : hukumuArr
        });
    })
}

async function checkHukumu(req, res){
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

async function updateHukumu(req, res){
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
            let _HYID = nanoid(10);

            logger.info( db_module.logHyoukiInsert(_HYID, yomiStr, hyoukiStr) );
            db.data.hyouki.push({
                hyId : _HYID,
                textData : [ ...await db_module.makeTextData(hyouki, yomi)],
                yomi : yomiStr,
                hyouki : hyoukiStr
            })

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

async function deleteHukumu(req, res){
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

            logger.info( db_module.logKomuDelete(hyId) );
            await db_module.deleteKomu( db, hyId );

            let kIds = await db_module.getKIds(db, hyId);
            for( let kId of kIds ){
                let moreExistKanji = await db_module.getMoreExistKanji(db, kId);
                if( !moreExistKanji ){
                    logger.info( db_module.logKanjiDelete(kId) );
                    await db_module.deleteKanji(db, kId);
                }
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

async function updateHukumuBun(req, res){
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

                            logger.info( db_module.logKomuDelete(obj.hyId) );
                            await db_module.deleteKomu( db, obj.hyId );

                            let kIds = await db_module.getKIds(db, obj.hyId);
                            for( let kId of kIds ){
                                let moreExistKanji = await db_module.getMoreExistKanji(db, kId);
                                if( !moreExistKanji ){
                                    logger.info( db_module.logKanjiDelete(kId) );
                                    await db_module.deleteKanji(db, kId);
                                }
                            }
                        }
                        console.log('hyId없음 : 새로운 HYOUKI생성');
                        let _HYID = nanoid(10);

                        //추후에 makeTextData새로 생성으로 수정 바람.
                        logger.info( db_module.logHyoukiInsert(_HYID, obj.yomi, obj.find.str, obj.tId) );
                        db.data.hyouki.push({
                            hyId : _HYID,
                            textData : [ ...await db_module.makeTextData(obj.find.hyouki, obj.find.yomi) ],
                            yomi : obj.yomi,
                            hyouki : obj.find.str,
                            tId : obj.tId
                        })

                        let arrKanji = await db_module.getKanjiArr(obj.find.str);
                        for( let kanji of arrKanji ){
                            let _KID = await db_module.getExistKId(db, kanji);

                            if( _KID == null ){
                                console.log('새로운 한자 생성');
                                _KID = nanoid(10);
                            }

                            logger.info( db_module.logKomuInsert(_HYID, _KID) );
                            db.data.komu.push({
                                hyId : _HYID,
                                kId : _KID
                            })

                            logger.info( db_module.logKanjiInsert(_KID, kanji) );
                            db.data.kanji.push({
                                kId : _KID,
                                jaText : kanji
                            })
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
                    hukumu = {
                        ...hukumu,
                        startOffset : obj.find.startOffset,
                        endOffset : obj.find.endOffset
                    }
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

                    logger.info( db_module.logKomuDelete(obj.hyId) );
                    await db_module.deleteKomu( db, obj.hyId );

                    let kIds = await db_module.getKIds(db, obj.hyId);
                    for( let kId of kIds ){
                        let moreExistKanji = await db_module.getMoreExistKanji(db, kId);
                        if( !moreExistKanji ){
                            logger.info( db_module.logKanjiDelete(kId) );
                            await db_module.deleteKanji(db, kId);
                        }
                    }
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

async function deleteHukumuBun(req, res){
    await db_connection(req, res, async(db) => {
        let { videoId, ytBId, jaBId } = req.query;

        let hukumus = await db_module.getHukumu(db, jaBId);

        for( let hukumu of hukumus ){
            if( await db_module.getMoreExistHyId(db, hukumu.hyId) == false ){
                console.log('더이상 쓰이지 않는 표기 : 삭제');
                logger.info( db_module.logHyoukiDelete(hukumu.hyId) );
                await db_module.deleteHyouki(db, hukumu.hyId);

                logger.info( db_module.logKomuDelete(hukumu.hyId) );
                await db_module.deleteKomu( db, hukumu.hyId );

                let kIds = await db_module.getKIds(db, hukumu.hyId);
                for( let kId of kIds ){
                    let moreExistKanji = await db_module.getMoreExistKanji(db, kId);
                    if( !moreExistKanji ){
                        logger.info( db_module.logKanjiDelete(kId) );
                        await db_module.deleteKanji(db, kId);
                    }
                }
            }
            if( await db_module.getMoreExistTId( db, hukumu.tId ) == false ){
                console.log('더이상 쓰이지 않는 단어 : 삭제');
                logger.info( db_module.logTangoDelete(hukumu.tId) );
                db.data.tango = db.data.tango.filter( (v) => v.tId != hukumu.tId );
            }
            console.log('HUKUMU 삭제');
            logger.info( db_module.logHukumuDelete( jaBId, hukumu.startOffset, hukumu.endOffset ) );
            await db_module.deleteHukumu( db, jaBId, hukumu.startOffset, hukumu.endOffset );
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

router.post('/', postHukumu);
router.get('/', getHukumu);
router.put('/', updateHukumu);
router.delete('/', deleteHukumu);

router.get('/check', checkHukumu);

router.put('/bun', updateHukumuBun);
router.delete('/bun', deleteHukumuBun);

export default router;