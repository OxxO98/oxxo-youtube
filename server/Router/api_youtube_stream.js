import express from "express";
const router = express.Router();

import ytdl from "@distube/ytdl-core";
import fs from 'fs'
import { Innertube, UniversalCache, Platform, Utils } from 'youtubei.js';

import { Readable, PassThrough } from "stream";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAudioStreamYoutubeJS (req, res) {
  let assetPath = path.join(__dirname, '../Asset');
  let transcriptPath = path.join(assetPath, 'transcript');

  let { videoId } = req.query;

  let videoPath = `${transcriptPath}/${videoId}.wav`;

  if( !fs.existsSync(transcriptPath) ){
    await fs.mkdirSync(transcriptPath);
  }

  if( !fs.existsSync(videoPath) ){
    Platform.shim.eval = async (data, env) => {
      const properties = [];

      if(env.n) {
        properties.push(`n: exportedVars.nFunction("${env.n}")`)
      }

      if (env.sig) {
        properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
      }

      const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

      return new Function(code)();
    }

    const innertube = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
    
    const stream = await innertube.download(videoId);

    const writeStream = fs.createWriteStream(videoPath);
    
    for await (const chunk of Utils.streamToIterable(stream)) {
      writeStream.write(chunk);
    }
    
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

async function getAudioCaption (req, res) {
  let assetPath = path.join(__dirname, '../Asset');
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
        startTime : v.start_ms/1000,
        endTime : v.end_ms/1000,
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
    let captionData = JSON.parse(data);

    res.send({
      message : 'success',
      data : captionData
    });
  }
}

router.get('/audioStream', getAudioStreamYoutubeJS);
router.get('/caption', getAudioCaption)

export default router;