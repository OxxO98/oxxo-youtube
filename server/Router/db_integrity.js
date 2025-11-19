import express from "express";
const router = express.Router();

import db_connection from './core/db_connection.js';
import logger from "./core/logger.js";
import _ from 'lodash'
import fs from 'fs'

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkIntegrity(req, res){
    await db_connection(req, res, async(db) => {
        
        db.data.hukumu.map( (hu) => {
            let jaBun = db.data.jaBuns.find( (ja) => ja.jaBId == hu.jaBId );
            let _hyouki = db.data.hyouki.find( (hy) => hu.hyId == hy.hyId ).hyouki;
            let _substring = jaBun.jaText.substring( hu.startOffset, hu.endOffset );
            if( _substring != _hyouki ){
                logger.error(`무결성 오류 : ${hu.jaBId} ${hu.startOffset} ${hu.endOffset}에서 ${_hyouki} ${_substring} 불일치`)
            }

            if( hu.iId != null ){
                let imi = db.data.imi.find( (v) => v.iId == hu.iId );
                if( imi == undefined ){
                    logger.error(`무결성 오류 : ${hu.jaBId} ${hu.startOffset} ${hu.endOffset}에서 IID ${hu.iId}를 찾을 수 없음`)
                }
            }
            let tango = db.data.tango.find( (v) => v.tId == hu.tId );
            if( tango == undefined ){
                logger.error(`무결성 오류 : ${hu.jaBId} ${hu.startOffset} ${hu.endOffset}에서 TID ${hu.tId}를 찾을 수 없음`)
            }
        })
        
        db.data.hyouki.map( (hy) => {
            let _hyouki = hy.textData.map( (t) => t.data ).join('');
            let _ruby = hy.textData.map( (t) => t.ruby == null ? t.data : t.ruby ).join('');

            if(_hyouki != hy.hyouki){
                logger.error(`무결성 오류 : ${hy.hyId} 에서 TextData : ${_hyouki}와 ${hy.hyouki} 불일치`)
            }
            if(_ruby != hy.yomi){
                logger.error(`무결성 오류 : ${hy.hyId} 에서 TextData : ${_ruby}와 ${hy.yomi} 불일치`)
            }
        })

        db.data.komu.map( (km) => {
            let _hyouki = db.data.hyouki.find( (hy) => km.hyId == hy.hyId ).hyouki;
            let kanji = db.data.kanji.find( (k) => km.kId == k.kId );

            if( _hyouki.includes(kanji.jaText) != true ){
                logger.error(`무결성 오류 : ${km.hyId} ${km.kId} 에서 ${_hyouki} ${kanji.jaText} 를 포함하지 않음`)
            }
        })
        
        db.data.videos.map( (vd) => {
            let timeline = vd.timeline;
            timeline.map( (tl) => {
                let jaBun = db.data.jaBuns.find( (v) => v.jaBId == tl.jaBId);
                if( jaBun == undefined ){
                    logger.error(`무결성 오류 : ${tl.ytBId}에서 ${tl.jaBId}를 찾을 수 없음`);
                }
                else{
                    if( jaBun.ytBId != tl.ytBId ){
                        logger.error(`무결성 오류 : TIMELINE YTB의 ${tl.ytBId}와 JABUN의 ${jaBun.ytBId}불일치`);
                    }
                }
                if(tl.koBId != null){
                    let koBun = db.data.koBuns.find( (v) => v.koBId == tl.koBId );
                    if( koBun == undefined ){
                        logger.error(`무결성 오류 : ${tl.ytBId}에서 ${tl.koBId}를 찾을 수 없음`);
                    }
                    else{
                        if( koBun.ytBId != tl.ytBId ){
                            logger.error(`무결성 오류 : TIMELINE YTB의 ${tl.ytBId}와 KOBUN의 ${koBun.ytBId}불일치`);
                        }
                    }
                }
            })
        })
        
        let allTimeline = db.data.videos.map( (v) => v.timeline ).flat();
        let _ytBIds = allTimeline.map( (v) => v.ytBId );

        db.data.jaBuns.map( (v) => {
            if( _ytBIds.includes( v.ytBId ) == false ){
                logger.error(`timeline에 존재하지 않는 JABUN ${v.jaBId} YTBID(${v.ytBId})`);
            }
        })
        db.data.koBuns.map( (v) => {
            if( _ytBIds.includes( v.ytBId ) == false ){
                logger.error(`timeline에 존재하지 않는 KOBUN ${v.koBId} YTBID(${v.ytBId})`);
            }
        })

        let _hyIds = db.data.hukumu.map( (v) => v.hyId );
        let _tIds = db.data.hukumu.map( (v) => v.tId );
        let _iIds = db.data.hukumu.map( (v) => v.iId ).filter( (v) => v != null );

        db.data.hyouki.map( (v) => {
            if( _hyIds.includes(v.hyId) == false ){
                logger.error(`HUKUMU에 존재하지 않는 표기 ${v.hyId}`);
            }
        })
        db.data.tango.map( (v) => {
            if( _tIds.includes(v.tId) == false ){
                logger.error(`HUKUMU에 존재하지 않는 단어 ${v.tId}`);
            }
        })
        db.data.imi.map( (v) => {
            if( _iIds.includes(v.iId) == false ){
                logger.error(`HUKUMU에 존재하지 않는 뜻 ${v.iId}`);
            }
        })

        let _hy_hyIds = db.data.hyouki.map( (v) => v.hyId );
        db.data.komu.map( (v) => {
            if( _hy_hyIds.includes(v.hyId) == false ){
                logger.error(`표기에 존재하지 않는 KOMU ${v.hyId} ${v.kId}`);
            }
        })
        let _km_kIds = db.data.komu.map( (v) => v.kId );
        db.data.kanji.map( (v) => {
            if( _km_kIds.includes(v.kId) == false ){
                logger.error(`KOMU에 존재하지 않는 한자 ${v.kId}`);
            }
        })
        
        let _today = new Date();
        let _originalFilePath = path.join(__dirname, '../Asset/db/db.json');
        let _backupFilename = `${_today.getFullYear()}${(_today.getMonth()+1).toString().padStart(2, '0')}${_today.getDate().toString().padStart(2, '0')}_db.json`
        let _backupFolder = path.join(__dirname, '../Asset/db/backup');
        if( !fs.existsSync(_backupFolder) ){
            await fs.mkdirSync(_backupFolder);
        }
        let _backupPath = path.join(_backupFolder, `./${_backupFilename}`);

        if( fs.existsSync(_backupPath) == false ){
            let _readStream = fs.createReadStream(_originalFilePath);
            let _writeStream = fs.createWriteStream(_backupPath);
            _readStream.pipe(_writeStream);
        }

        let _backupDir = fs.readdirSync(_backupFolder);
        if(_backupDir.length > 15){
            let _sorted = _backupDir.sort( (a, b) => a.substring(0, 8)-b.substring(0, 8) );
            let _old = path.join(_backupFolder, _sorted[0]);
            if( fs.existsSync(_old) == true ){
                fs.unlinkSync(_old);
            }
        }

        res.send({
            data : {},
            message : 'done'
        })
    });
}

router.get('/', checkIntegrity);

export default router;