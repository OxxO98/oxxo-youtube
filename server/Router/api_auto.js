import express from "express";
const router = express.Router();

import fs from 'fs';

import { nanoid } from "nanoid";

import _ from 'lodash'

import OpenAI from 'openai';
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import db_connection from './core/db_connection.js';
import { 
    _checkMecabInstalled, 
    _ensureUtf8CodePage, 
    _prefilter, 
    checkWithMecab, 
    analyzeWithMeCab,
    getYomiWithMecab,
    
    hiraganaRegex,
    kanjiRegex,
    kanjiStartRegex,
    kanjiEndRegex,
} from "./core/mecab_module.js";
import * as db_module from "./core/db_module.js";
import logger from "./core/logger.js"

import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
    
const assetPath = process.env.APP_ASSET_ROOT ?? path.join(__dirname, '../Asset');


//중복
async function _existApiKey(){
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (typeof openaiApiKey !== "string" || openaiApiKey.trim() === "") {
        return false;
    }
    return true;
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

async function _getImiWithAI( videoId, db, revised ){
    if( await _existApiKey() === false ){
        return revised;
    }

    if( fs.existsSync(`${assetPath}/transcript/${videoId}.wav_word_imi.json`) === true ){
        let _json = JSON.parse( await fs.readFileSync(`${assetPath}/transcript/${videoId}.wav_word_imi.json`) );
        
        return revised.map( (v, i) => {
            return {
                ...v,
                imi : _json.data[i]?.imi ?? ''
            }
        })
    }
    
    const translateData = revised
        .map( (v, i) => {
            let _hyouki = db.data.hyouki.find( (hy) => hy.hyouki == v.base || hy.hyouki == v.hyouki )
            let _iId = _hyouki !== undefined ? db.data.hukumu.find( (hu) => hu.hyId == _hyouki.hyId && hu.iId !== null )?.iId : undefined; 
            let _imi = _iId !== undefined ? db.data.imi.find( (m) => m.iId == _iId )?.koText : undefined;

            return { idx : i, hyouki : v.base, imi : _imi ?? '' }
        })

    const filtered_translateData = translateData.filter( (v) => v.imi === '' )
        .map( (v) => { return { idx : v.idx, hyouki : v.hyouki }});

    console.log(filtered_translateData);

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
        ${JSON.stringify(filtered_translateData, null, 2)}
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

    const revised_imi = {
        data : translateData.map( (v) => {
            return {
                idx : v.idx,
                hyouki : v.hyouki,
                imi : v.imi == '' ? ai_res.output_parsed.data.find( (t) => t.idx == v.idx)?.imi : v.imi
            }
        })
    }
    
    await fs.writeFileSync(`${assetPath}/transcript/${videoId}.wav_word_imi.json`, JSON.stringify( revised_imi, null, 2) )

    if( ai_res.output_parsed ) {
        return revised.map( (v, i) => {
            return {
                ...v,
                imi : v.imi == '' ? ai_res.output_parsed.data.find( (v) => v.idx == i)?.imi : v.imi
            }
        })
    }
    else{
        return revised;
    }
}

async function getAutoDB(req, res){
    await db_connection(req, res, async(db) => {

        console.log('getAutoDB');
        const { videoId, option } = req.query; // text.join('\n')

        let video = db.data.videos.find( (video) => video.src == videoId);

        let timeline = video.timeline;
        if( !timeline ){ 
            res.send({
                message : 'error',
                data : []
            }) 
            return;
        }

        let jaBuns = db.data.jaBuns;
        let koBuns = db.data.koBuns;
        let joinText = timeline.map( (v) => {
            return { ...v, 
                ...jaBuns.find( (ja) => ja.jaBId == v.jaBId ), 
                ...koBuns.find( (ko) => ko.koBId == v.koBId ) 
            }
        }).toSorted( (a, b) => a.startTime - b.startTime );

        let text = joinText.map( (v) => v.jaText ).join('\n');

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
            let _t = await analyzeWithMeCab(v);
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
        if( option === 'true' || fs.existsSync(`${assetPath}/transcript/${videoId}.wav_word_imi.json`) === true ){
            revised = await _getImiWithAI( videoId, db, revised );
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
        await fs.writeFileSync(`${assetPath}/transcript/${videoId}.wav_word.json`, JSON.stringify(groupRevised, null, 2), { encoding : 'utf8' } );

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
    const { text } = req.query;

    if( await _checkMecabInstalled() === false ){
        res.send({
            message : 'error',
            data : []
        });
        return;
    }

    await _ensureUtf8CodePage();

    if( text.match(/\s/) !== null ){
        console.log('공백포함');

        res.send({
            message : 'success',
            data : {
                yomi : ''
            }
        });
        
        return;
    }

    let tokens = await getYomiWithMecab( text )
    
    let yomi = tokens.map( (v) => v.reading ).join('');

    console.log(yomi);

    res.send({
        message : 'success',
        data : {
            yomi : yomi
        }
    });
}

async function getPrompt(req, res){
    await db_connection(req, res, async(db) => {
        const { videoId } = req.query;

        if( await _checkMecabInstalled() === false ){
            res.send({
                message : 'error',
                data : []
            });
            return;
        }

        await _ensureUtf8CodePage();
        //고유명사 등등
        /** score로 판단해야 할 듯
         * 1. 이 영상에서만 쓰이는 단어 //left 정도
         * 2. 영상에서 자주, 반복 등장하는 단어 //sum
         * ?. 사전에서 인식가능 한 단어 (mecab 사용?)
         * 
         * ex) hukumu 갯수 - 다른 영상에서 출현 정도
         */

        // VIDEO - YTB - JABID &&  HUKUMU - HYOUKI 

        const _timeline = await db_module.getTimeline(db, videoId)
        const _jaBIds = _timeline.map( (v) => v.jaBId );

        const _joined = _.toArray( _.groupBy( db.data.hukumu.map( (v) => {
            return {
                ...v,
                ...db.data.hyouki.find( (hy) => hy.hyId == v.hyId )
            }
        }), tango => tango.hyId ) ) // hyouki joined hukumu

        const _scored = _joined.map( (v) => {
            
            return v.map( (t) => {
                return {
                    jaBId : t.jaBId,
                    hyId : t.hyId,
                    hyouki : t.hyouki,
                    yomi : t.yomi,
                    inVideo : _jaBIds.includes(t.jaBId)
                }
            })
        }).map( (v) => {
            return {
                hyId : v[0].hyId,
                hyouki : v[0].hyouki,
                yomi : v[0].yomi,
                sum : v.filter( (t) => t.inVideo === true ).length,
                left : v.filter( (t) => t.inVideo === false ).length,
                all : v.length
            }
        })
        .filter( (v) => 
            v.sum !== 0 && v.sum > v.left
        )
        .sort( (a, b) => b.sum - a.sum)
        

        let result = await Promise.allSettled(
            _scored.map( async (v) => {
                return {
                    ...v,
                    mecab : await checkWithMecab(v.hyouki)
                }
            })
        )
        
        result = result
            .filter( (v) => 
                v.status == 'rejected' || 
                ( v.status == 'fulfilled' && v.value.mecab.length > 1 && v.value.mecab[0].pos !== '動詞' ) 
            )
            .map( (v) => v.value );

        const resultStr = result.map( (v) => {
            return `${v.hyouki}(${v.yomi})`
        }).join(', ')

        res.send({
            message : 'success',
            data : resultStr
        });
    })
}

router.get('/', getAutoDB);
router.post('/', postAutoDB)

router.get('/yomi', getYomi);

router.get('/prompt', getPrompt);

export default router;