import express from "express";
const router = express.Router();

//import { Ollama } from 'ollama/browser';
import OpenAI from 'openai';
import { nodewhisper } from "nodejs-whisper";
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

import path from 'path';
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

async function getTranscipt(req, res){
    let { videoId, reset, lang } = req.query;
    
    let assetPath = path.join(__dirname, '../Asset');
    let transcriptPath = path.join(assetPath, 'transcript');

    let videoPath = path.join(transcriptPath, `${videoId}.wav`);

    let option = {
        reset : reset ?? false,
        lang : lang ?? 'ja'
    }
    //'auto'로 하려곤했었음

    if(fs.existsSync(videoPath) == true){
        if(
            fs.existsSync(`${videoPath}.json`) == true &&
            reset !== 'true'
        ){
            const json = await fs.readFileSync(`${videoPath}.json`);
            const transcription = JSON.parse(json).transcription;

            res.send({
                message : 'success',
                data : transcription.map( (v) => `${v.timestamps.from} ${v.timestamps.to} ${v.text}`).join('\n')
            });
            return;
        }
        else{
            let _langObj = {}
            if( option.lang !== 'auto' ){ _langObj.language = option.lang } 
            const transcription = await nodewhisper(videoPath, {
                modelName : 'small',
                withCuda : false,
                whisperOptions : {
                    outputInJson : true,
                    outputInText : true,
                    translateToEnglish : false,
                    wordTimestamps : false,
                    timestamps_length : 17,
                    splitOnWord : true,
                    ..._langObj
                }
            })

            res.send({
                message : 'success',
                data : transcription
            });
            return;
        }
    } 
    else{
        res.send({
            message : 'error',
            data : {}
        })
    }  
}

async function getRangeTranscript(req, res){
    let { videoId, startOffset, endOffset, reset, lang } = req.query;
    
    let assetPath = path.join(__dirname, '../Asset');
    let transcriptPath = path.join(assetPath, 'transcript');

    let option = {
        reset : reset ?? false,
        lang : lang ?? 'ja'
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
                    modelName : 'small',
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

router.get('/chat', getChat);
router.get('/transcript', getTranscipt);
router.get('/transcript/range', getRangeTranscript);

export default router;
