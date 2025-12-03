import express from "express";
const router = express.Router();

//import { Ollama } from 'ollama/browser';
import OpenAI from 'openai';
import { nodewhisper } from "nodejs-whisper";
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

import { exec } from 'child_process';

import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
    baseURL : 'http://localhost:11434/v1/',
    apiKey : 'ollama',
    dangerouslyAllowBrowser : false
})

async function getChat(req, res){
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

    const ai_res = await openai.chat.completions.create({
        model : 'gpt-oss:20b',
        web_search_options: {},
        messages : [
            { role : 'system', content : '너는 일본어와 한국어에 능통한 번역가이고, 답변은 항상 한국어로 해줘'},
            ..._context,
            { role : 'user', content : message },
        ],
        stream : true,
        store : true,
        max_completion_tokens : 8,
    })

    req.on('close', () => {
        ai_res.controller.abort();
        console.log('AI 종료');
        res.end();
    })

    for await ( const chunk of ai_res){
        let data = chunk.choices[0]?.delta.content || '';
        res.write(`data: ${data.replaceAll('\n', '@@@@')}\n\n`);
    }

    res.end();
}

async function _sliceAudio( filePath, outFilePath, startTime, endTime, option ){

    if(fs.existsSync(`${outFilePath}.json`) == true){
        console.log('exist.. skip');

        const json = await fs.readFileSync(`${outFilePath}.json`);
        const transcription = JSON.parse(json).transcription;

        let data = transcription.map( (v) => `${v.timestamps.from} ${v.timestamps.to} ${v.text}`).join('\n')

        resolve(data);
    }
    else{
        return new Promise( (resolve, reject) => {
            ffmpeg({ source : filePath })
                .setStartTime(startTime).setDuration(endTime-startTime)
                .save(outFilePath).on(
                    'end', async () => {
                        let _langObj = {}
                        if( option.lang !== 'auto' ){ _langObj.language = option.lang } 
                        await nodewhisper(outFilePath, {
                            modelName : option.model,
                            autoDownloadModelName : option.model,
                            withCuda : false,
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

async function getTranscipt(req, res){
    let { videoId, reset, lang, model } = req.query;
    
    let assetPath = path.join(__dirname, '../Asset');
    let transcriptPath = path.join(assetPath, 'transcript');

    let videoPath = path.join(transcriptPath, `${videoId}.wav`);

    //model : small, medium, large...

    let option = {
        reset : reset ?? false,
        lang : lang ?? 'ja',
        model : model ?? 'medium'
    }

    let _sliceSeconds = 300;
    await ffmpeg.ffprobe(videoPath, async (err, metadata ) => {
        let _duration = metadata.format.duration;

        let _indexs = Array.from({ length : Math.ceil(_duration/_sliceSeconds) }, (v, i) => i*_sliceSeconds )
        
        if( fs.existsSync(`${videoPath}.json`) == false || reset === 'true' ){
            for await( let i of _indexs ){
                console.log(`${i/_sliceSeconds+1} / ${_indexs.length}.. start`);
                let _startTime = i;
                let _endTime = Math.min( i + _sliceSeconds, _duration );
            
                let outFilePath = path.join(transcriptPath, `${videoId}_${_startTime}_${_endTime}.wav`);
                await _sliceAudio( videoPath, outFilePath, _startTime, _endTime, option )
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
                    const transcription = JSON.parse(json).transcription;

                    if( i == 0 ){
                        _all = JSON.parse(json);
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

            res.send({
                message : 'success',
                data : transcriptArr
            });
            return;
        }
        else{
            const json = await fs.readFileSync(`${videoPath}.json`);
            const transcription = JSON.parse(json).transcription.map( (v) => {
                return {
                    startTime : v.offsets.from/1000,
                    endTime : v.offsets.to/1000,
                    text : v.text
                }
            });

            res.send({
                message : 'success',
                data : transcription
            });
            return;
        }
    })
}

async function getRangeTranscript(req, res){
    let { videoId, startOffset, endOffset, reset, lang, model } = req.query;
    
    let assetPath = path.join(__dirname, '../Asset');
    let transcriptPath = path.join(assetPath, 'transcript');

    let option = {
        reset : reset ?? false,
        lang : lang ?? 'ja',
        model : model ?? 'medium'
    }
    //'auto'로 하려곤했었음

    let startTime = Number(startOffset);
    let endTime = Number(endOffset);

    let filePath = `${transcriptPath}/${videoId}.wav`;
    if(fs.existsSync(`${transcriptPath}/${videoId}.wav`) == true){
        
        const outFilePath = path.join(transcriptPath, `${videoId}_${startOffset}_${endOffset}.wav`);

        await ffmpeg({ source : filePath})
        .setStartTime(startTime).setDuration(endTime-startTime)
        .save(outFilePath).on(
            'end', function(){
                let _langObj = {}
                if( option.lang !== 'auto' ){ _langObj.language = option.lang } 
                nodewhisper(outFilePath, {
                    modelName : option.model,
                    autoDownloadModelName : option.model,
                    withCuda : false,
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

async function cancelTranscript(req, res) {
    let command = 'taskkill /f /im whisper-cli.exe'

    // nodejs error
    exec(command, (err) => {
        console.log('err', err);
    })
}

router.get('/chat', getChat);
router.get('/transcript', getTranscipt);
router.get('/transcript/range', getRangeTranscript);
router.get('/transcript/cancel', cancelTranscript);

export default router;
