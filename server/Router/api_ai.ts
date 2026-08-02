import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

import OpenAI from 'openai';
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { nodewhisper } from "nodejs-whisper";
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

import { execSync } from 'child_process';

import path, { resolve } from 'path';
import { assetPath } from './core/path_module.js';

async function _existApiKey(){
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (typeof openaiApiKey !== "string" || openaiApiKey.trim() === "") {
        return false;
    }
    return true;
}

async function getChatOpenAI( message, context ){

    const client = new OpenAI();

    const ai_res = await client.responses.create({
        model : 'gpt-5-mini',
        tools : [
            { type: "web_search" },
        ],
        input : [
            { role : 'system', content : '너는 일본어와 한국어에 능통한 번역가이고, 답변은 항상 한국어로 해줘'},
            ...context,
            { role : 'user', content : message },
        ],
        stream : true,
        store : true,
    })

    return ai_res;
}

async function getChatLocal( message, context ){

    const _openai = new OpenAI({
        baseURL : 'http://localhost:11434/v1/',
        model : 'ollama',
        dangerouslyAllowBrowser : false
    } as any)

    const ai_res = await _openai.chat.completions.create({
        model : 'gpt-oss:20b',
        web_search_options: {},
        messages : [
            { role : 'system', content : '너는 일본어와 한국어에 능통한 번역가이고, 답변은 항상 한국어로 해줘'},
            ...context,
            { role : 'user', content : message },
        ],
        stream : true,
        store : true,
        max_completion_tokens : 8,
    })

    return ai_res;
}

async function getChat(req : RouterRequest, res : RouterResponse){
    const { message, context } = req.query;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    let _context = [];
    if( context != undefined ){
        let parsed = JSON.parse(context)
        for(let key in parsed ){
            _context.push( parsed[key] );
        }
    }

    const ai_res = _existApiKey() ? await getChatOpenAI(message, _context) : await getChatLocal(message, _context);

    req.on('close', () => {
        ai_res.controller.abort();
        console.log('AI 종료');
        res.end();
    })

    for await ( const chunk of ai_res ){
        const chunkAny = chunk as any;
        let data = await _existApiKey() ? chunkAny?.delta || '' : chunkAny.choices[0]?.delta.content || '';
        res.write(`data: ${data.replaceAll('\n', '@@@@')}\n\n`);
    }

    res.end();
}

function _toTimestamp(time, separator = ','){
    let hour = Math.floor(time/3600);
    let min = Math.floor(time/60%60);
    let sec = Math.floor(time%60);
    let msec = Math.floor(time%1*1000);

    let ts_hour = String(hour).padStart(2, '0');
    let ts_min = String(min).padStart(2, '0');
    let ts_sec = String(sec).padStart(2, '0');
    let ts_msec = String(msec).padStart(3, '0');

    return ts_hour+':'+ts_min+':'+ts_sec+separator+ ts_msec;
}

function _checkCudaStatus() {
    try {
        const result = execSync('nvidia-smi', { encoding: 'utf8' });
        console.log("CUDA is installed");
        return true;
    } catch (error) {
        console.log("CUDA is not installed");
        return false;
    }
}

async function _sliceAudioLocal( filePath, outFilePath, startTime, endTime, option ){

    if(fs.existsSync(`${outFilePath}.json`) == true){
        console.log('exist.. skip');

        const json = await fs.readFileSync(`${outFilePath}.json`);
        const transcription = JSON.parse(json.toString()).transcription;

        let data = transcription.map( (v) => `${v.timestamps.from} ${v.timestamps.to} ${v.text}`).join('\n')

        resolve(data);
    }
    else{
        return new Promise( (resolve, reject) => {
            ffmpeg({ source : filePath })
                .setStartTime(startTime)
                .setDuration(endTime-startTime)
                .audioCodec("pcm_s16le")
                .audioChannels(1)
                .audioFrequency(16000)
                .format("wav")
                .save(outFilePath).on(
                    'end', async () => {
                        let _langObj : { language?: string } = {}
                        if( option.lang !== 'auto' ){ _langObj.language = option.lang } 
                        await nodewhisper(outFilePath, {
                            modelName : option.model,
                            autoDownloadModelName : option.model,
                            withCuda : _checkCudaStatus(),
                            whisperOptions : {
                                outputInJson : true,
                                translateToEnglish : false,
                                wordTimestamps : true,
                                timestamps_length : 17,
                                splitOnWord : true,
                                ..._langObj
                            },
                            removeWavFileAfterTranscription : true
                        }).then( (transcript) => {
                            resolve(transcript);
                        })
                    }
                );
        })
    }    
}

async function _sliceAudioOpenAI( filePath, outFilePath, startTime, endTime, prompt, lang ){

    if(fs.existsSync(`${outFilePath}.json`) == true){
        console.log('exist.. skip');

        const json = await fs.readFileSync(`${outFilePath}.json`);
        const transcription = JSON.parse(json.toString()).transcription;

        let data = transcription.map( (v) => `${v.timestamps.from} ${v.timestamps.to} ${v.text}`).join('\n')

        return data;
    }

    await new Promise( (resolve, reject) => {
        ffmpeg({ source : filePath })
            .setStartTime(startTime)
            .setDuration(endTime-startTime)
            .audioCodec("pcm_s16le")
            .audioChannels(1)
            .audioFrequency(16000)
            .format("wav")
            .save(outFilePath)
            .on("end", resolve)
            .on("error", reject); 
    });

    const client = new OpenAI();

    const _transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(outFilePath),
        model: "whisper-1",
        response_format : "verbose_json",
        language : lang,
        timestamp_granularities : ["segment"],
        prompt : prompt
    })

    let _all = { transcription : [] };

    // console.log(_transcription.segments);
    /*
        avg_logprob: 
            >-0.3: 매우 강한 편. 짧고 분명한 발화에서 자주 나오는 편입니다.
            -0.3 ~ -0.7: 대체로 양호. 후처리 후보로 쓰기 괜찮은 구간이 많습니다.
            -0.7 ~ -1.0: 경계 구간. 잡음, 짧은 감탄사, 혼합 언어, 발음 뭉개짐이 있으면 흔들릴 수 있습니다.
            <-1.0: 공식 기준상 실패 취급이 가능한 구간입니다. 재전사나 보수적 유지가 적절합니다.
        compression_ratio: 텍스트가 반복적인 정도
            2.4보다 크면 compression failed
        no_speech_prob: avg_logprob < -1일 때 무음 세그먼트
    */

    let dataArr = _transcription.segments.map( (v) => {
        return {
            start : v.start,
            end : v.end,
            text : v.text
        }
    } )

    _all.transcription = dataArr;

    await fs.writeFileSync(`${outFilePath}.json`, JSON.stringify(_all, null, 2) );

    return _transcription;
}

async function _reviseWithAi( videoPath, transcription ){

    let _revisePath = `${videoPath}_revise.json`;
    let _txtPath = `${videoPath}_revise.txt`;

    if( await fs.existsSync(_txtPath) == false ){
        return transcription;
    }

    if( await fs.existsSync(_revisePath) == true ){
        let json_revise = await fs.readFileSync(_revisePath);
        let revise_transcription = JSON.parse(json_revise.toString()).transcription.map( (v) => {
            return {
                startTime : v.offsets.from/1000,
                endTime : v.offsets.to/1000,
                text : v.text
            }
        })

        return revise_transcription;
    }

    console.log('get revise with AI...')

    const tcData = z.object({ 
        data : z.array( z.object({
            original_id : z.string(),
            original: z.string(),
            modified_id : z.string(),
            modified: z.string()
        }) )
    });

    let refScript = await fs.readFileSync(_txtPath, 'utf-8');
    let transcriptionWithId = transcription.map( (seg, idx) => ({ 
        id : `W_${String(idx+1).padStart(4, "0")}`,
        text : seg.text.trim()
    }));
    let transcriptionInput = transcriptionWithId
        .map( v => `[${v.id}] ${v.text}`)
        .join("\n");

    const client = new OpenAI();

    const prompt = `
        아래는 음성 인식 결과이다. 각 줄은 고유한 ID를 가진다.

        규칙 :
        - ID는 절대 수정, 삭제, 추가하지 말 것
        - 출력 배열 길이는 입력 줄 수와 반드시 같아야 함
        - 각 줄은 동일 ID의 original만 수정할 것
        - 다른 줄의 내용을 병합하거나 분리하지 말 것
        - 문장이 어색해도 줄 경계를 유지할 것
        - 참고 대본은 표현을 고칠 때만 참고하고 차이가 크면 참고 대본을 무시하고 original 유지할 것

        [보정 대상]
        ${transcriptionInput}

        [참고 대본]
        ${refScript}

        출력은 반드시 지정된 JSON 포맷을 따를 것.
    `

    const ai_res = await client.responses.parse({
        model : 'gpt-5-mini',
        input : [
            { role : 'user', content : prompt },
        ],
        text : {
            format : zodTextFormat(tcData, 'transcription_data'),
        }
    })

    let transcriptArr = transcription.map( (v, i) => {
        return {
            ...v,
            text : ai_res.output_parsed.data[i].modified
        }
    })

    let revise_transcription = transcriptArr.map( (v, i) => {
        return {
            timestamps : {
                from : _toTimestamp(v.startTime),
                to : _toTimestamp(v.endTime)
            },
            offsets : {
                from : v.startTime*1000,
                to : v.endTime*1000
            },
            text : v.text,
            ...ai_res.output_parsed.data[i]
        }
    })

    let _all = { transcription : revise_transcription }

    await fs.writeFileSync(_revisePath, JSON.stringify( _all, null, 2) )

    return transcriptArr;
}

async function _translateWithAi( videoPath, transcription, lang ){

    let _revisePath = `${videoPath}_revise.json`;

    if( await fs.existsSync(_revisePath) == true ){
        let json_revise = await fs.readFileSync(_revisePath);
        let _transcription = JSON.parse(json_revise.toString()).transcription;
        
        if( _transcription[0].koText !== undefined || _transcription[0].translate !== undefined ){
            let revise_transcription = _transcription.map( (v) => {
                return {
                    startTime : v.offsets.from/1000,
                    endTime : v.offsets.to/1000,
                    text : v.text,
                    translate : v.koText ?? v.translate ?? ''
                }
            })

            return revise_transcription;
        }
    }

    console.log('get translation...')

    //legacy // id, text, koText
    const tcData = z.object({ 
        data : z.array( z.object({
            id : z.string(),
            text : z.string(),
            translate : z.string()
        }) )
    });
    const client = new OpenAI();

    const CHUNK_LENGTH = 100;
    let _indexs = Array.from({ length : Math.ceil(transcription.length/CHUNK_LENGTH) }, (v, i) => i )

    let output_arr = [];
    for await(let i of _indexs){
        console.log(`slice start ${i+1}/${_indexs.length}`)
        let transcriptionWithId = transcription.slice(i*CHUNK_LENGTH, (i+1)*CHUNK_LENGTH).map( (seg, idx) => ({ 
            id : `W_${String(i*CHUNK_LENGTH+idx+1).padStart(4, "0")}`,
            text : seg.text.trim()
        }));
        let transcriptionInput = transcriptionWithId
            .map( v => `[${v.id}] ${v.text}`)
            .join("\n");

        const prompt = `
            아래는 음성 인식 결과이다. 각 줄은 고유한 ID를 가진다.

            규칙 :
            - ID는 절대 수정, 삭제, 추가하지 말 것
            - translate에 각 줄을 ${lang === 'ja' ? '한국어' : '일본어'}로 번역한 결과를 넣을 것

            [보정 대상]
            ${transcriptionInput}

            출력은 반드시 지정된 JSON 포맷을 따를 것.
        `

        const ai_res = await client.responses.parse({
            model : 'gpt-5-mini',
            input : [
                { role : 'user', content : prompt },
            ],
            text : {
                format : zodTextFormat(tcData, 'translateData'),
            }
        })

        output_arr.push(ai_res.output_parsed.data)
        console.log(`slice end ${i+1}/${_indexs.length}`)
    }

    output_arr = output_arr.flat()

    let translateArr = transcription.map( (v, i) => {
        return {
            ...v,
            translate : output_arr[i]?.translate ?? ""
        }
    })

    let revise_transcription = translateArr.map( (v, i) => {
        return {
            timestamps : {
                from : _toTimestamp(v.startTime),
                to : _toTimestamp(v.endTime)
            },
            offsets : {
                from : v.startTime*1000,
                to : v.endTime*1000
            },
            text : v.text,
            ...output_arr[i]
        }
    })

    let _all = { transcription : revise_transcription }

    await fs.writeFileSync(_revisePath, JSON.stringify( _all, null, 2) )

    return translateArr;
}

async function _getDuration(filePath) {
    const metadata: ffmpeg.FfprobeData = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });

    return metadata.format.duration;
}

//local
async function getRangeTranscript(req : RouterRequest, res : RouterResponse){
    let { videoId, startOffset, endOffset } = req.query;

    let transcriptPath = path.join(assetPath, 'transcript');

    //기존 option제거
    let option = {
        reset : false,
        lang : 'ja',
        model : 'medium'
    }

    let startTime = Number(startOffset);
    let endTime = Number(endOffset);

    let filePath = `${transcriptPath}/${videoId}.wav`;
    if(fs.existsSync(`${transcriptPath}/${videoId}.wav`) == true){
        
        const outFilePath = path.join(transcriptPath, `${videoId}_${startOffset}_${endOffset}.wav`);

        await ffmpeg({ source : filePath})
        .setStartTime(startTime).setDuration(endTime-startTime)
        .save(outFilePath).on(
            'end', function(){
                let _langObj : { language?: string } = {}
                if( option.lang !== 'auto' ){ _langObj.language = option.lang } 
                nodewhisper(outFilePath, {
                    modelName : option.model,
                    autoDownloadModelName : option.model,
                    withCuda : _checkCudaStatus(),
                    whisperOptions : {
                        translateToEnglish : false,
                        wordTimestamps : true,
                        timestamps_length : 17,
                        splitOnWord : true,
                        ..._langObj
                    },
                    removeWavFileAfterTranscription : true
                }).then( (transcription) => {
                    let arr = transcription.split('\r\n')
                        .filter( (v) => v != '')
                        .map( (v) => {
                        let matched = v.match(/^\[.+\](.+)$/);
                        return matched == null ? v.trim() : matched[1].replaceAll(/[「」]/g, '').trim();
                    } )

                    res.send({
                        message : 'success',
                        data : arr.join('')
                    });
                    return;
                }).catch( (err) => {
                    res.send({
                        message : 'error',
                        data : {}
                    });
                })
            }
        );        
    }
    else{
        res.send({
            message : 'error',
            data : {}
        });
    }
}

async function getTransciptLocal( videoId, option ){
    
    let transcriptPath = path.join(assetPath, 'transcript');

    let videoPath = path.join(transcriptPath, `${videoId}.wav`);

    let _sliceSeconds = 300;
    await ffmpeg.ffprobe(videoPath, async (err, metadata ) => {
        let _duration = metadata.format.duration;

        let _indexs = Array.from({ length : Math.ceil(_duration/_sliceSeconds) }, (v, i) => i*_sliceSeconds )
        
        if( fs.existsSync(`${videoPath}.json`) == false || option.reset === 'true' ){
            for await( let i of _indexs ){
                console.log(`${i/_sliceSeconds+1} / ${_indexs.length}.. start`);
                let _startTime = i;
                let _endTime = Math.min( i + _sliceSeconds, _duration );
            
                let outFilePath = path.join(transcriptPath, `${videoId}_${_startTime}_${_endTime}.wav`);
                await _sliceAudioLocal( videoPath, outFilePath, _startTime, _endTime, option )
                console.log(`${i/_sliceSeconds+1} / ${_indexs.length}.. end`);
            }

            console.log('all slice end');

            let _all;
            let dataArr = [];
            let transcriptArr = [];
            for await( let i of _indexs ){
                let _startTime = i;
                let _endTime = Math.min( i + _sliceSeconds, _duration );

                let outFilePath = path.join(transcriptPath, `${videoId}_${_startTime}_${_endTime}.wav`);
                if( fs.existsSync(`${outFilePath}.json`) == true ){
                    const json = await fs.readFileSync(`${outFilePath}.json`);
                    const transcription = JSON.parse(json.toString()).transcription;

                    if( i == 0 ){
                        _all = JSON.parse(json.toString());
                    }

                    transcriptArr = transcriptArr.concat( ...transcription.map( (v) => {
                        return {
                            startTime : v.offsets.from/1000 + i,
                            endTime : v.offsets.to/1000 + i,
                            text : v.text
                        }
                    }) )

                    dataArr.push( transcription.map( (v) => {
                        return {
                            timestamps : {
                                from : _toTimestamp(v.offsets.from/1000 + i),
                                to : _toTimestamp(v.offsets.to/1000 + i)
                            },
                            offsets : {
                                from : v.offsets.from + i*1000,
                                to : v.offsets.to + i*1000
                            },
                            text : v.text
                        }
                    } ))
                }
            }

            _all.transcription = dataArr.flat();

            await fs.writeFileSync(`${videoPath}.json`, JSON.stringify(_all, null, 2) );

            for await( let i of _indexs ){
                let _startTime = i;
                let _endTime = Math.min( i + _sliceSeconds, _duration );

                let outFilePath = path.join(transcriptPath, `${videoId}_${_startTime}_${_endTime}.wav`);

                if( fs.existsSync(`${outFilePath}.json`) == true ){
                    fs.unlinkSync(`${outFilePath}.json`);
                }
            }

            return transcriptArr;
        }
        else{
            const json = await fs.readFileSync(`${videoPath}.json`);
            const transcription = JSON.parse(json.toString()).transcription.map( (v) => {
                return {
                    startTime : v.offsets.from/1000,
                    endTime : v.offsets.to/1000,
                    text : v.text
                }
            });

            return transcription;
        }
    })
}

async function getTranscriptOpenAI( videoId, prompt, lang ){
    
    let transcriptPath = path.join(assetPath, 'transcript');

    let videoPath = path.join(transcriptPath, `${videoId}.wav`);

    
    if( fs.existsSync(`${videoPath}.json`) == true ){
        const json = await fs.readFileSync(`${videoPath}.json`);
        let transcription = JSON.parse(json.toString()).transcription.map( (v) => {
            return {
                startTime : v.offsets.from/1000,
                endTime : v.offsets.to/1000,
                text : v.text
            }
        });

        return transcription;
    }

    console.log('get transcription...')

    let _sliceSeconds = 300;

    let _duration = await _getDuration(videoPath)

    let _indexs = Array.from({ length : Math.ceil(_duration/_sliceSeconds) }, (v, i) => i*_sliceSeconds )

    for await( let i of _indexs ){
        console.log(`${i/_sliceSeconds+1} / ${_indexs.length}.. start`);
        let _startTime = i;
        let _endTime = Math.min( i + _sliceSeconds, _duration );
    
        let outFilePath = path.join(transcriptPath, `${videoId}_${_startTime}_${_endTime}.wav`);
        await _sliceAudioOpenAI( videoPath, outFilePath, _startTime, _endTime, prompt, lang )
        console.log(`${i/_sliceSeconds+1} / ${_indexs.length}.. end`);
    }

    console.log('all slice end');

    let _all = { transcription : [] };
    let dataArr = [];
    let transcriptArr = [];
    for await( let i of _indexs ){
        let _startTime = i;
        let _endTime = Math.min( i + _sliceSeconds, _duration );

        let outFilePath = path.join(transcriptPath, `${videoId}_${_startTime}_${_endTime}.wav`);
        if( fs.existsSync(`${outFilePath}.json`) == true ){
            const json = await fs.readFileSync(`${outFilePath}.json`);
            const transcription = JSON.parse(json.toString()).transcription;

            transcriptArr = transcriptArr.concat( ...transcription.map( (v) => {
                return {
                    startTime : v.start + i,
                    endTime : v.end + i,
                    text : v.text
                }
            }) )

            dataArr.push( transcription.map( (v) => {
                return {
                    timestamps : {
                        from : _toTimestamp(v.start + i),
                        to : _toTimestamp(v.end + i)
                    },
                    offsets : {
                        from : v.start*1000 + i*1000,
                        to : v.end*1000 + i*1000,
                    },
                    text : v.text
                }
            } ))
        }
    }

    _all.transcription = dataArr.flat();

    await fs.writeFileSync(`${videoPath}.json`, JSON.stringify(_all, null, 2) );

    for await( let i of _indexs ){
        let _startTime = i;
        let _endTime = Math.min( i + _sliceSeconds, _duration );

        let outFilePath = path.join(transcriptPath, `${videoId}_${_startTime}_${_endTime}.wav`);

        if( fs.existsSync(`${outFilePath}.json`) == true ){
            fs.unlinkSync(`${outFilePath}.json`);
        }

        if( fs.existsSync(`${outFilePath}`) == true ){
            fs.unlinkSync(`${outFilePath}`);
        }
    }

    return transcriptArr;
}

async function getTranscipt(req : RouterRequest, res : RouterResponse){
    let { videoId, reviseText, reset, translate, prompt, lang } = req.query;

    console.log("option", req.query)
    
    let transcriptPath = path.join(assetPath, 'transcript');

    let videoPath = path.join(transcriptPath, `${videoId}.wav`);

    let _option = {
        reset : reset ?? 'false',
        lang : lang ?? 'ja',
        model : 'medium'
    }

    if( prompt !== 'true' && reviseText !== undefined && reviseText !== "" ){
        await fs.writeFileSync(`${videoPath}_revise.txt`, reviseText);
    }

    if( await _existApiKey() == true ){

        let transcription = await getTranscriptOpenAI( videoId, prompt, _option.lang );

        if( prompt !== 'true' ){
            transcription = await _reviseWithAi( videoPath, transcription );
        }

        if(transcription !== undefined && translate !== undefined && translate === 'true'){
            transcription = await _translateWithAi( videoPath, transcription, _option.lang );
        }

        res.send({
            message : 'success',
            data : transcription
        });
        return;
    }
    else{
        //local
        let transcription = await getTransciptLocal( videoId, _option );

        res.send({
            message : 'success',
            data : transcription
        });
        return;
    }
}

router.get('/chat', getChat);
router.get('/transcript', getTranscipt);
router.get('/transcript/range', getRangeTranscript);

export default router;
