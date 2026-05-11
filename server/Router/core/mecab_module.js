
import { exec, spawn } from 'child_process';

import MeCab from "mecab-async";

/*
    mecab by
    and add path
    https://shogo82148.github.io/mecab/
*/

export const kanjiRegex = new RegExp('[\u3400-\u9fff\u3005]+', 'g');
export const hiraganaRegex = new RegExp('[^\u3400-\u9fff\u3005]+', 'g');
export const katakanaRegex = new RegExp(
    `[\\u30A0-\\u30ff]`, 'g'
)
export const getKatakanaRegex = new RegExp('[\u30a0-\u30ff]+', 'g');

export const kanjiStartRegex = new RegExp('^[\u3400-\u9fff\u3005]+', 'g');
export const kanjiEndRegex = new RegExp('[\u3400-\u9fff\u3005]+$', 'g');

const mecab = new MeCab();

function _kataToHira(str){
    if( str === undefined || str === null){ return "" }

    let _hirgana =  str.replace( 
        katakanaRegex, $0 => String.fromCharCode($0.charCodeAt(0) - 0x0060)
    )

    return _hirgana
}

export function _prefilter(tokens){
    return tokens.filter(t =>
        t.surface.match(kanjiRegex) !== null
    );
}

function _complexKataToHira(origin, yomi){
    if( yomi === undefined){
        return origin.match(kanjiRegex) === null ? _kataToHira(origin) : '';
    }
    if( origin.match(katakanaRegex) === null || origin.match(kanjiRegex) === null  ){
        return _kataToHira(yomi);
    }

    let _matched = origin.match(getKatakanaRegex);
    if( _matched !== null ){
        let _regexp = new RegExp( `^(.*)${_matched.join('(.*)')}(.*)$` );
        let _m_yomi = yomi.match(_regexp);
        let _m_ori = origin.match(_regexp);
        if( _m_ori !== null && _m_yomi !== null ){
            let _hira = _m_yomi.filter( (v, i) => i !== 0).map( (v) => _kataToHira(v) );
            _m_ori = _m_ori.filter( (v, i) => i !== 0 );
            let _string = _m_ori.reduce( (acc, curr, i) => acc.replace(curr, _hira[i]), origin );
            
            return _string;
        }
    }

    return _kataToHira(origin);
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

export function _checkMecabInstalled(){
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

export async function _ensureUtf8CodePage(){

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

export function _parse_buffer( text ){

    return new Promise( (resolve, reject) => {
        const child = spawn('mecab', {
            stdio : ['pipe', 'pipe', 'pipe'],
            windowsHide : true,
            shell : false,
        });

        const stdoutChunks = [];
        const stderrChunks = [];

        child.stdout.on('data', (chunk) => {
            stdoutChunks.push(chunk);
        });

        child.stderr.on('data', (chunk) => {
            stderrChunks.push(chunk);
        });

        child.on('error', (err) => {
            reject(err);
        });

        child.on('close', (code) => {
            const stdoutBuffer = Buffer.concat(stdoutChunks);
            const stderrBuffer = Buffer.concat(stderrChunks);

            if (code !== 0) {
                return reject(
                    new Error(
                        `MeCab exited with code ${code}: ${stderrBuffer.toString('utf8')}`
                    )
                );
            }

            try{
                const rawText = stdoutBuffer.toString('utf8');

                const rows = rawText
                    .split(/\r?\n/)
                    .filter((line) => line && line !== 'EOS')
                    .map((line) => {
                        const [surface, featureText = ''] = line.split('\t');
                        const features = featureText.split(',');
                        return [
                            surface,          // 0
                            features[0] ?? '',// 1 pos
                            features[1] ?? '',
                            features[2] ?? '',
                            features[3] ?? '',
                            features[4] ?? '',
                            features[5] ?? '',
                            features[6] ?? '*', // 7 base
                            features[7] ?? '*', // 8 reading
                        ];
                    });                

                resolve(rows);
            } catch (err) {
                reject(err);
            }
        });

        child.stdin.write(text, 'utf8');
        child.stdin.end('\n', 'utf8');
    })
}

export async function getReadingWithMecab(text){

    let _reg = /[\{\}\[\]\/?.,;:|\)`*`~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi
    let _text = text.replace(/\s+/g, '、').replace(_reg, '');

    let rows = await _parse_buffer( text );
    const tokens = rows.map(t => {
        if( t[1] == '記号'){
            return {
                space : true,
                reading : ''
            }
        }

        if( t[1] == '助詞'){
            // console.log(t[0], t[1], t[2]);
            return {
                space : t[2] == '接続助詞' ? false : true,
                reading : t[0] == 'は' ? 'わ' : _kataToHira(t[8])+''
            }
        }
        else{
            return {
                space : false,
                reading : t[0]
            }
        }
    });

    return tokens;
}

export async function checkWithMecab( text ){

    let rows = await _parse_buffer( text );

    const tokens = rows.map( t => {
        return {
            surface: t[0],
            pos: t[1],
            base: t[7] !== "*" ? t[7] : t[0],
            reading : t[8] !== "*" ? _complexKataToHira(t[0], t[8]) : "",
            pos1 : t[2],
            pos2 : t[3],
            pos3 : t[4],
        }
        //_kataToHira( t[8] ) 
    });

    return tokens;
}

export async function analyzeWithMeCab( textObj ){

    let rows = await _parse_buffer( textObj.jaText );

    let _crit = 0;
    const tokens = rows.map( (t) => {
        let _offset = textObj.jaText.indexOf(t[0], _crit);
        if (_offset !== -1) {
            _crit = _offset + t[0].length;
        }

        return {
            surface: t[0],
            pos: t[1],
            base: t[7] !== "*" ? t[7] : t[0],
            reading : t[8] !== "*" ? _complexKataToHira(t[0], t[8]) : "",
            jaBId : textObj.jaBId,
            offset : _offset
        }
    });

    return tokens;
}

export async function getYomiWithMecab( text ){
    let rows = await _parse_buffer( text );

    const tokens = rows.map( t => {
        return {
            surface: t[0],
            pos: t[1],
            base: t[7] !== "*" ? t[7] : t[0],
            reading : t[8] !== "*" ? t[0].match(kanjiRegex) !== null ? _complexKataToHira( t[0], t[8] ) : t[0] : "",
        }
    });
    
    return tokens;
}