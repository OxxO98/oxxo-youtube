
import { spawn } from 'child_process';

import path from 'path';

// import fs from 'fs'
// import { Innertube, UniversalCache, Platform, Utils } from 'youtubei.js';

export function runYtDlpToFile(videoId : string, folderPath : string) {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const outputPath = path.join(folderPath, `${videoId}.%(ext)s`);

    const args = [
      '--no-warnings',
      '--no-playlist',
      '-x',
      '--audio-format', 'wav',
      '-o', outputPath,
      url
    ];

    const child = spawn('yt-dlp', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        reject(
          new Error(
            `yt-dlp 실행 파일을 찾을 수 없습니다. 설치 후 PATH를 잡거나 YT_DLP_PATH를 설정하세요.`
          )
        );
        return;
      }
      reject(err);
    });


    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, outputPath });
      } else {
        reject(
          new Error(`yt-dlp failed with code ${code}\n${stderr || stdout}`)
        );
      }
    });
  });
}

function getYtDlpInfo(videoId : string) {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    const child = spawn("yt-dlp", [
      "-J",               // --dump-single-json
      "--no-playlist",
      "--skip-download",
      "--no-warnings",
      url,
    ], {
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", chunk => {
      stdout += chunk;
    });

    child.stderr.on("data", chunk => {
      stderr += chunk;
    });

    child.on("error", reject);

    child.on("close", code => {
      if (code !== 0) {
        reject(new Error(`yt-dlp failed with code ${code}\n${stderr}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (err) {
        reject(new Error(`Failed to parse yt-dlp JSON: ${err.message}\n${stdout.slice(0, 500)}`));
      }
    });
  });
}

function extractLanguageInfo(info) {
  const audioFormats = (info.formats ?? []).filter(format => {
    return format.acodec && format.acodec !== "none";
  });

  const audioStreamLanguages = [
    ...new Set(
      audioFormats
        .map(format => format.language)
        .filter(Boolean)
    ),
  ];

  const manualSubtitleLanguages = Object.keys(info.subtitles ?? {});
  const automaticCaptionLanguages = Object.keys(info.automatic_captions ?? {});

  return {
    // extractor가 제공하는 경우만 존재
    language: info.language ?? null,
    originalLanguage: info.original_language ?? null,

    // 실제 오디오 포맷에 붙은 언어 정보
    audioStreamLanguages,

    // 자막 기반 언어 정보
    manualSubtitleLanguages,
    automaticCaptionLanguages,
  };
}

function guessSourceLanguage(langInfo) {
  if (langInfo.originalLanguage) return langInfo.originalLanguage;
  if (langInfo.language) return langInfo.language;

  if (langInfo.audioStreamLanguages.length === 1) {
    return langInfo.audioStreamLanguages[0];
  }

  // YouTube 자동자막에서 "-orig"가 붙는 경우를 우선 사용
  const origAutoCaption = langInfo.automaticCaptionLanguages.find(lang => {
    return lang.endsWith("-orig");
  });

  if (origAutoCaption) {
    return origAutoCaption.replace(/-orig$/, "");
  }

  // 수동 자막이 하나뿐이면 보조 추정값으로 사용
  if (langInfo.manualSubtitleLanguages.length === 1) {
    return langInfo.manualSubtitleLanguages[0];
  }

  // 자동자막이 하나뿐이면 보조 추정값으로 사용
  if (langInfo.automaticCaptionLanguages.length === 1) {
    return langInfo.automaticCaptionLanguages[0].replace(/-orig$/, "");
  }

  return null;
}

export async function guessLanguage(videoId){

  const info = await getYtDlpInfo(videoId);
  const langInfo = extractLanguageInfo(info);

  const guessLang = guessSourceLanguage(langInfo);

  return guessLang
}

/*
async function runInnerTube(videoId : string, videoPath : string){
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
}
*/