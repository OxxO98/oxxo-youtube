import express from "express";
const router = express.Router();

import fs from 'fs';

import { nanoid } from "nanoid";

import _ from 'lodash'

import OpenAI from 'openai';
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import MeCab from "mecab-async";

import db_connection from './core/db_connection.js';
import * as db_module from "./core/db_module.js";
import logger from "./core/logger.js"

const mecab = new MeCab();

import { exec } from 'child_process';

import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
    
const assetPath = path.join(__dirname, '../Asset');

/*
    mecab by
    and add path
    https://shogo82148.github.io/mecab/
*/

const katakanaRegex = new RegExp(
    `[\\u30A0-\\u30ff]`, 'g'
)
const kanjiRegex = new RegExp('[\u3400-\u9fff\u3005]+', 'g');
const hiraganaRegex = new RegExp('[^\u3400-\u9fff\u3005]+', 'g');

const kanjiStartRegex = new RegExp('^[\u3400-\u9fff\u3005]+', 'g');
const kanjiEndRegex = new RegExp('[\u3400-\u9fff\u3005]+$', 'g');

//중복
async function _existApiKey(){
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (typeof openaiApiKey !== "string" || openaiApiKey.trim() === "") {
        return false;
    }
    return true;
}

function _getCurrentCodePage(){
    return new Promise((resolve, reject) => {
        exec('chcp', (err, stdout) => {
            if (err) {
                reject(err);
                return;
            }

            // 예: "Active code page: 949"
            const match = stdout.match(/:\s*(\d+)/);
            resolve(match?.[1] ?? '');
        });
    });
}


function _checkMecabInstalled(){
    return new Promise((resolve) => {
        exec('mecab --version', (error, stdout, stderr) => {
            if (error) {
                // mecab 명령을 찾지 못했거나 실행 실패
                resolve(false);
                return;
            }

            // 출력이 있으면 정상 설치로 판단
            resolve(true);
        });
    });
}

async function _ensureUtf8CodePage(){

    const currentCodePage = await _getCurrentCodePage();

    if (currentCodePage !== '65001') {
        await new Promise( (resolve, reject) => {
            exec('chcp 65001 > nul', err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}

function _makeTextData( hyouki, yomi ){
    let startBool = hyouki.match(kanjiStartRegex) !== null ? true : false; //true면 한자 시작
    let endBool = hyouki.match(kanjiEndRegex) !== null ? true : false; //true면 한자 시작

    let arrOkuri = hyouki.match(hiraganaRegex);
    let exHiraPattern = arrOkuri !== null ? arrOkuri.join('(.+)') : null;

    let arrHuri = [];
    
    if( exHiraPattern === null ){
        return [{
            data : hyouki,
            ruby : yomi,
            offset : 0
        }];
    }

    let exHiraRegex = new RegExp(
        `^${exHiraPattern}$`
    );
    if( startBool && !endBool ){
        exHiraRegex = new RegExp(
            `^(.+)${exHiraPattern}$`
        );
    }
    else if( startBool && endBool ){
        exHiraRegex = new RegExp(
            `^(.+)${exHiraPattern}(.+)$`
        );
    }
    else if( !startBool && endBool ){
        exHiraRegex = new RegExp(
            `^${exHiraPattern}(.+)$`
        );
    }

    let matched = yomi.match(exHiraRegex);

    if( matched !== null ){
        for(let i = 1; i < matched.length; i++){
            arrHuri.push(matched[i])
        }
    }

    let ret = [];

    let _startBool = startBool;
    let _kanjiIndex = 0;
    let _hiraIndex = 0;
    let _offset = 0;
    let kanjiArr = hyouki.match(kanjiRegex);
    let hiraArr = hyouki.match(hiraganaRegex);

    for( let i = 0; i < hiraArr.length+kanjiArr.length; i++ ){
        if( _startBool == true ){
            ret.push({
                data : kanjiArr[_kanjiIndex],
                ruby : arrHuri[_kanjiIndex],
                offset : _offset
            });
            _startBool = false;
            _offset += kanjiArr[_kanjiIndex].length;
            _kanjiIndex++;
        }   
        else{
            ret.push({
                data : hiraArr[_hiraIndex],
                ruby : null,
                offset : _offset
            })
            _startBool = true;
            _offset += hiraArr[_hiraIndex].length;
            _hiraIndex++;
        }
    }

    return ret;
}

//일단 save
function _compareTextData( hyoukiQuery, yomiQuery, textData ){
    let _hyoukiQuery = textData.map( (t) => t.data ).join('_');
    let _yomiQuery = textData.map( (t) => t.ruby == null ? '0' : t.ruby ).join('_');

    return hyoukiQuery === _hyoukiQuery && yomiQuery === _yomiQuery
}

function _kataToHira(str){
    if( str === undefined || str === null){ return "" }

    let _hirgana =  str.replace( 
        katakanaRegex, $0 => String.fromCharCode($0.charCodeAt(0) - 0x0060)
    )

    return _hirgana
}

function _prefilter(tokens){
    return tokens.filter(t =>
        t.surface.match(kanjiRegex) !== null
    );
}

function _analyzeWithMeCab( textObj ){
    return new Promise((resolve, reject) => {
        mecab.parse(textObj.jaText, (err, result) => {
            if (err) return reject(err);

            let _crit = 0;
            const tokens = result.map(t => {
                let _offset = textObj.jaText.indexOf(t[0], _crit);
                if( _offset !== -1 ){ _crit = _offset }

                return {
                    surface: t[0],
                    pos: t[1],
                    base: t[7] !== "*\r" ? t[7] : t[0],
                    reading : t[8] !== "*\r" ? _kataToHira( t[8] ) : "",
                    jaBId : textObj.jaBId,
                    offset : _offset
                }
            });

            resolve(tokens);
        });
    });
}

async function _getImiWithAI( videoId, revised ){
    if( await _existApiKey() === false ){
        return revised;
    }

    if( fs.existsSync(`${assetPath}/transcript/${videoId}.wav_word_imi.json`) === true ){
        let _json = JSON.parse( await fs.readFileSync(`${assetPath}/transcript/${videoId}.wav_word_imi.json`) );

        return revised.map( (v, i) => {
            return {
                ...v,
                imi : _json.data[i].imi
            }
        })
    }
    
    const translateData = revised.map( (v, i) => { return { idx : i,  hyouki : v.base } })

    const trData = z.object({ 
        data : z.array( z.object({
            idx : z.number(),
            hyouki : z.string(),
            imi : z.string(),
        }) )
    });

    const client = new OpenAI();

    const prompt = `
        너는 JSON 객체 배열을 입력으로 받아,
        각 객체의 hyouki 필드에 들어 있는 일본어 텍스트만 한국어로 번역해서
        imi 필드에 넣어 반환한다.

        규칙:
        1. idx는 그대로 유지한다.
        2. hyouki는 절대 수정하지 않는다.
        3. imi에만 번역 결과를 넣는다.
        4. 출력은 반드시 아래 구조를 따른다:

        {
        "data": [
            { "idx": number, "hyouki": string, "imi": string }
        ]
        }

        JSON 이외의 어떤 텍스트도 출력하지 마라.

        입력 데이터:
        ${JSON.stringify(translateData, null, 2)}
    `

    const ai_res = await client.responses.parse({
        model : 'gpt-5-mini',
        input : [
            { role : 'user', content : prompt },
        ],
        text : {
            format : zodTextFormat(trData, 'translation_data'),
        }
    })
    
    await fs.writeFileSync(`${assetPath}/transcript/${videoId}.wav_word_imi.json`, JSON.stringify( ai_res.output_parsed, null, 2) )

    if( ai_res.output_parsed ) {
        return revised.map( (v, i) => {
            return {
                ...v,
                imi : ai_res.output_parsed.data[i].imi
            }
        })
    }
    else{
        return revised;
    }
}

async function getAutoDB(req, res){
    await db_connection(req, res, async(db) => {

        const { videoId, text, option } = req.query; // text.join('\n')

        if( await _checkMecabInstalled() === false ){
            res.send({
                message : 'error',
                data : []
            });
            return;
        }

        await _ensureUtf8CodePage();

        const jaBIds = text.split('\n').map( (v, i) => {
            return {
                jaText : v,
                jaBId : `ja${String(i+1).padStart(4, "0")}`,
            }
        })

        let tokens = [];
        for( let v of jaBIds ){
            let _t = await _analyzeWithMeCab(v);
            tokens = tokens.concat(_t);
        }

        const candidates = _prefilter(tokens);

        let revised = candidates.map( (v, i) => {
            return {
                base : v.base,
                jaBId : v.jaBId,

                startOffset : v.offset,
                endOffset : v.offset + v.surface.length,
                
                hyouki : v.surface,
                yomi : v.reading,
                textData : _makeTextData(v.surface, v.reading),
                kanjis : db_module.getKanjiArr( v.surface )
            }
        }).map( (v) => {
            return {
                ...v,
                hyoukiQuery : v.textData.map( (t) => t.data ).join('_'),
                yomiQuery : v.textData.map( (t) => t.ruby == null ? '0' : t.ruby ).join('_')
            }
        })

        //OPEN AI
        if( option === 'true' ){
            revised = await _getImiWithAI( videoId, revised );
        }

        let getCore = ( _textData ) => {
            return _textData.filter( (t) => t.ruby != null ).map( (t) => t.data).join('');
        }

        let _score = ( compare, tango ) => {
            let _hy_complete = Number( compare.hyouki === tango.hyouki )
            let _hy_include = Number( compare.hyouki.includes( tango.hyouki ) );
            let _y_complete = Number( compare.yomi === tango.yomi );
            let _y_include = Number( compare.yomi.includes( tango.yomi ) );

            return _hy_complete+_hy_include+_y_complete+_y_include;
        }

        //단어 그룹화
        let _accIndex = 0;
        const groupRevised =  _.toArray( _.groupBy(revised, tango => {
            return `${tango.base}`
        }) ).map( (tangoArr) => {
            let index = _accIndex;
            let _hyoukis = _.uniq( tangoArr.map( (v) => v.hyouki ).concat([ tangoArr[0].base ]) );
            let _yomis = _.uniq( tangoArr.map( (v) => v.yomi ) );
            let _cores = _.uniq( tangoArr.map( (v) => v.textData ).map( (v) => getCore(v) ) );

            let _tIds = _.countBy( db.data.hyouki.filter( (v) => 
                _hyoukis.includes(v.hyouki) || _cores.includes( getCore(v.textData) )
            ).map( (v) => v.tId ) );
            let _tIdsObjArr = Object.keys(_tIds).map(key => ({ key, size: _tIds[key] }))
                .sort( (a, b) => b.size-a.size);

            let tIdList = _tIdsObjArr.map( (v) => 
                _.uniqBy( db.data.hyouki.filter( (t) => v.key == t.tId ).map( (t) => { return { ...t, size : v.size }}), 'hyId')
            ).map( (t) => {
                return t.map( (tt) => {
                    return {
                        ...tt,
                        score : _score( tt, tangoArr[0])
                    }
                })
            })

            tIdList = _.orderBy( tIdList, [(v) => {
                let _maxScore = Math.max( ...v.map( (t) => t.score) );
                return _maxScore;
            }, (v) => v[0].size], ['desc', 'desc'])
            // score는 max로 정렬, size는 후순위 정렬

            let _debug = {
                debug : {
                    index : index,
                    _hyoukis : _hyoukis,
                    _yomis : _yomis,
                    _cores : _cores,
                    _tIds : _tIds,
                    _tIdsObjArr : _tIdsObjArr
                }
            } //..._debug

            _accIndex += tangoArr.length;
            return tangoArr.map( (v, i) => { 
                return {
                    ...v, 
                    id : `hu${String(index+i+1).padStart(4, "0")}`,
                    tIdList : tIdList
                } 
            })
        })

        // json저장시, 모의 DB형태는 어떤지, hukumu, hyouki, tango, komu, kanji까지
        await fs.writeFileSync(`${assetPath}/transcript/${videoId}.wav_word.json`, JSON.stringify(groupRevised, null, 2) );

        res.send({
            message : 'success',
            data : groupRevised
        });
    })
}

async function postAutoDB(req, res){
    await db_connection(req, res, async(db) => {
        const { videoId, change } = req.body;

        const word_file_path = `${assetPath}/transcript/${videoId}.wav_word.json`

        if( fs.existsSync(word_file_path) == false ){
            res.send({
                data : {},
                message : 'error'
            });
            return;
        }
        const json = await fs.readFileSync(word_file_path)

        const jsonData = JSON.parse(json);

        let arr = jsonData.flat().flat();

        let regexTID = new RegExp('^T[0-9]{4}$');
        let TIDObject = {};

        for(const [key, value] of Object.entries(change)){
            if( value.skip === true || value.skip === 'true' ){ continue; }

            const { jaBId, tId } = value;
            // jaBId, tId (선택), 등록 여부
            const { startOffset : start, endOffset : end, hyoukiQuery, yomiQuery, hyouki : hyoukiStr, yomi : yomiStr, imi } = arr.find( (v) => v.id === key ); 

            let _TID = tId;
            if( regexTID.test(tId) == true ){
                if( TIDObject[tId] == undefined ){
                    console.log('tId없음 : 새로운 TANGO생성');
                    TIDObject[tId] = nanoid(10);

                    logger.info( db_module.logTangoInsert( TIDObject[tId] ) )
                    db.data.tango.push({ tId : TIDObject[tId] });
                }
                _TID = TIDObject[tId];
            }

            let _HYID;
            let existHyouki = await db_module.getExistHyouki(db, hyoukiStr, hyoukiQuery, yomiQuery);
            if(existHyouki == null){
                console.log('hyId없음 : 새로운 HYOUKI생성');
                _HYID = nanoid(10);

                logger.info( db_module.logHyoukiInsert(_HYID, yomiStr, hyoukiStr, _TID) )
                db.data.hyouki.push({
                    hyId : _HYID,
                    textData : [ ...db_module.makeTextData(hyoukiQuery, yomiQuery)],
                    yomi : yomiStr,
                    hyouki : hyoukiStr,
                    tId : _TID
                })
            }
            else{
                _HYID = existHyouki.hyId;
            }

            let _IID = null;
            if( imi !== undefined && imi !== '' ){
                let _existImi = db.data.imi.find( (v) => v.koText == imi && v.tId == _TID );
                if( _existImi === undefined ){
                    console.log('새로운 IMI 생성');
                    _IID = nanoid(10);
                    logger.info( db_module.logImiInsert(_IID, imi, _TID) )
                    db.data.imi.push({
                        iId : _IID,
                        koText : imi,
                        tId : _TID,
                    })
                }
                else{
                    _IID = _existImi.iId;
                }
            }

            console.log('새로운 HUKUMU 생성');
            logger.info( db_module.logHukumuInsert( jaBId, start, end, _HYID, _TID) )
            db.data.hukumu.push({
                jaBId : jaBId,
                startOffset : start,
                endOffset : end,
                hyId : _HYID,
                iId : _IID,
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
        }

        await db.write();

        fs.unlinkSync(word_file_path)
        
        res.send({
            data : {},
            message : 'success'
        });
    });
}


async function getYomi(req, res){
    await db_connection(req, res, async(db) => {

        const { text } = req.query;

        if( await _checkMecabInstalled() === false ){
            res.send({
                message : 'error',
                data : []
            });
            return;
        }

        await _ensureUtf8CodePage();

        let tokens = await new Promise((resolve, reject) => {
            mecab.parse(text, (err, result) => {
                if (err) return reject(err);

                const _tokens = result.map(t => {

                    return {
                        surface: t[0],
                        pos: t[1],
                        base: t[7] !== "*\r" ? t[7] : t[0],
                        reading : t[8] !== "*\r" ? _kataToHira( t[8] ) : "",
                    }
                });

                resolve(_tokens);
            });
        });

        let yomi = tokens.map( (v) => v.reading ).join('');

        res.send({
            message : 'success',
            data : {
                yomi : yomi
            }
        });
    })
}

router.get('/', getAutoDB);
router.post('/', postAutoDB)

router.get('/yomi', getYomi);

export default router;