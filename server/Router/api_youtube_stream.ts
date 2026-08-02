import express from "express";
import type { RouterRequest, RouterResponse } from "../types/router_types.js";
const router = express.Router();

import fs from 'fs'
import { Innertube } from 'youtubei.js';

import path from 'path';
import { assetPath } from './core/path_module.js';

import { runYtDlpToFile } from "./core/ytDlp_module.js";

async function getAudioStreamYoutubeJS (req : RouterRequest, res : RouterResponse) {
  let transcriptPath = path.join(assetPath, 'transcript');

  let { videoId } = req.query;

  let videoPath = `${transcriptPath}/${videoId}.wav`;

  if( !fs.existsSync(transcriptPath) ){
    await fs.mkdirSync(transcriptPath);
  }

  if( !fs.existsSync(videoPath) ){

    await runYtDlpToFile( videoId, transcriptPath )

    const readStream = fs.createReadStream(videoPath);

    for await(const chunk of readStream){
      res.write(chunk);
    }

    res.end();
  } 
  else{
    const stream = fs.createReadStream(videoPath);

    for await(const chunk of stream){
      res.write(chunk);
    }

    res.end();
  }  
}

async function getAudioCaption (req : RouterRequest, res : RouterResponse) {
  let transcriptPath = path.join(assetPath, 'transcript');

  let { videoId } = req.query;

  let videoPath = `${transcriptPath}/${videoId}`;

  if( !fs.existsSync(transcriptPath) ){
    await fs.mkdirSync(transcriptPath);
  }

  if( !fs.existsSync(`${videoPath}_caption.json`) ){
    const innertube = await Innertube.create({ generate_session_locally: true });

    const info = await innertube.getInfo(videoId);

    if( !info.captions ){
      //NOT_EXIST_CAPTION
      res.send({
        message : 'empty',
        data : []
      }); 
      return; 
    }

    const defaultTranscriptInfo = await info.getTranscript();

    let transcript = defaultTranscriptInfo;

    let langs = defaultTranscriptInfo.languages;
    let _ja = langs.filter( (v) => v == 'Japanese' ).length != 0;
    let _jaAuto = langs.filter( (v) => v == 'Japanese (auto-generated)' ).length != 0;

    if( _ja ){ transcript = await defaultTranscriptInfo.selectLanguage('Japanese'); }
    else if( _jaAuto ){ transcript = await defaultTranscriptInfo.selectLanguage('Japanese (auto-generated)'); }

    let captionData = transcript.transcript.content.body.initial_segments.map( 
      (v) => { return {
        startTime : Number(v.start_ms)/1000,
        endTime : Number(v.end_ms)/1000,
        text : v.snippet.text
      } }
    )

    await fs.writeFileSync(`${videoPath}_caption.json`, JSON.stringify(captionData, null, 2) );

    res.send({
      message : 'success',
      data : captionData
    });
  }
  else{
    let data = await fs.readFileSync(`${videoPath}_caption.json`);
    let captionData = JSON.parse(data.toString());

    res.send({
      message : 'success',
      data : captionData
    });
  }
}

router.get('/audioStream', getAudioStreamYoutubeJS);
router.get('/caption', getAudioCaption)

export default router;
