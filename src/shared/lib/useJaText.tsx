import { useCallback, useContext, useMemo } from 'react';

import { UnicodeRangeContext } from 'shared/contexts/UnicodeContext';

import { assemble } from 'es-hangul';
import e from 'express';

const hiraganaKumi = [
    ['あ', 'い', 'う', 'え', 'お', 'や', 'ゆ', 'よ'],
    ['か', 'き', 'く', 'け', 'こ', 'きゃ', 'きゅ', 'きょ'],
    ['が', 'ぎ', 'ぐ', 'げ', 'ご', 'ぎゃ', 'ぎゅ', 'ぎょ'],
    ['さ', 'し', 'す', 'せ', 'そ', 'しゃ', 'しゅ', 'しょ'],
    ['ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'じゃ', 'じゅ', 'じょ'],
    ['た', 'ち', 'つ', 'て', 'と', 'ちゃ', 'ちゅ', 'ちょ'],
    ['だ', 'ぢ', 'づ', 'で', 'ど', 'ぢゃ', 'ぢゅ', 'ぢょ'],
    ['な', 'に', 'ぬ', 'ね', 'の', 'にゃ', 'にゅ', 'にょ'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ', 'ひゃ', 'ひゅ', 'ひょ'],
    ['ば', 'び', 'ぶ', 'べ', 'ぼ', 'びゃ', 'びゅ', 'びょ'],
    ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', 'ぴゃ', 'ぴゅ', 'ぴょ'],
    ['ま', 'み', 'む', 'め', 'も', 'みゃ', 'みゅ', 'みょ'],
    ['ら', 'り', 'る', 'れ', 'ろ', 'りゃ', 'りゅ', 'りょ']
]

const hiraganaKumiRegex = new RegExp( `[${hiraganaKumi.flat().filter( (v) => v.length === 1).join('')}わをっん-]{1}[ゃゅょぁぃぅぇぉ]?`, 'g' )

//'ぅ'로 되는 경우의 모음은 아직 정해지지 않은 상태
const hiraganaTokubetsuKumi = [
    ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ'],
    ['わ', 'うぃ', 'ぅ', 'うぇ', 'うぉ'],
    ['くぁ', 'くぃ', 'ぅ', 'くぇ', 'くぉ'],
    ['ぐぁ', 'ぐぃ', 'ぅ', 'ぐぇ', 'ぐぉ'],
    ['すぁ', 'すぃ', 'ぅ', 'しぇ', 'すぉ'],
    ['ずぁ', 'ずぃ', 'ぅ', 'じぇ', 'ずぉ'],
    ['つぁ', 'てぃ', 'とぅ', 'ちぇ', 'つぉ'],
    ['づぁ', 'でぃ', 'どぅ', 'ぢぇ', 'づぉ'],
    ['ぬぁ', 'ぬぃ', 'ぅ', 'ぬぇ', 'ぬぉ'],
    ['ふぁ', 'ふぃ', 'ほぅ', 'ふぇ', 'ふぉ'],
    ['ぶぁ', 'ぶぃ', 'ぅ', 'ぶぇ', 'ぶぉ'],
    ['ぷぁ', 'ぷぃ', 'ぅ', 'ぷぇ', 'ぷぉ'],
    ['むぁ', 'むぃ', 'ぅ', 'むぇ', 'むぉ'],
    ['るぁ', 'るぃ', 'ぅ', 'るぇ', 'るぉ']
]

const hiraganaTokubetsuDan : ObjKey = hiraganaTokubetsuKumi[0].reduce( (acc, value, index) => { return {...acc, [value] : index} }, {} );

const hiraganaKou : ObjKey = hiraganaKumi.reduce( (acc, value, index) => { return {...acc, [value[0]] : index} }, {} );
const hiraganaDan : ObjKey = hiraganaKumi[0].reduce( (acc, value, index) => { return {...acc, [value] : index} }, {} );

const hiraganaKouExpended : ObjKey = hiraganaKumi.map( (v, i) => v
        .reduce( (acc, value, index) => { return {...acc, [value] : i } }, {} ) 
    ).reduce( (acc, value, index) => { return {...acc, ...value} }, {} );
const hiraganaDanExpended : ObjKey = hiraganaKumi.map( (v, i) => v
        .reduce( (acc, value, index) => { return {...acc, [value] : index } }, {} ) 
    ).reduce( (acc, value, index) => { return {...acc, ...value} }, {} );


const chosungs = [
    'ㄱ',
    'ㄲ',
    'ㄴ',
    'ㄷ',
    'ㄸ',
    'ㄹ',
    'ㅁ',
    'ㅂ',
    'ㅃ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅉ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ'
]

const junsungs = [
    'ㅏ',
    'ㅐ',
    'ㅑ',
    'ㅒ',
    'ㅓ',
    'ㅔ',
    'ㅕ',
    'ㅖ',
    'ㅗ',
    'ㅘ',
    'ㅙ',
    'ㅚ',
    'ㅛ',
    'ㅜ',
    'ㅝ',
    'ㅞ',
    'ㅟ',
    'ㅠ',
    'ㅡ',
    'ㅢ',
    'ㅣ'
]

const jongsungs = [
    'ㄱ',
    'ㄲ',
    'ㄳ',
    'ㄴ',
    'ㄵ',
    'ㄶ',
    'ㄷ',
    'ㄹ',
    'ㄺ',
    'ㄻ',
    'ㄼ',
    'ㄽ',
    'ㄾ',
    'ㄿ',
    'ㅀ',
    'ㅁ',
    'ㅂ',
    'ㅄ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ'
]

const hangulChosungHiraMatch : ObjKey = {
    ㄱ : 'が',
    ㄲ : 'か',
    ㄴ : 'な',
    ㄷ : 'だ',
    ㄸ : 'た',
    ㄹ : 'ら',
    ㅁ : 'ま',
    ㅂ : 'ば',
    ㅃ : 'ぱ',
    ㅅ : 'さ',
    ㅆ : 'さ',
    ㅇ : 'あ',
    ㅈ : 'ざ',
    ㅉ : 'ざ',
    ㅊ : 'た',
    ㅋ : 'か',
    ㅌ : 'た',
    ㅍ : 'ぱ',
    ㅎ : 'は'
}

const hangulJunsungHiraMatch : ObjKey = {
    ㅏ: 'あ',
    ㅐ: 'え',
    ㅑ: 'や',
    ㅒ: 'え',
    ㅓ: 'お',
    ㅔ: 'え',
    ㅕ: 'よ',
    ㅖ: 'え',
    ㅗ: 'お',
    ㅘ: 'ぁ',
    ㅙ: 'ぇ',
    ㅚ: 'ぇ',
    ㅛ: 'よ',
    ㅜ: 'う',
    ㅝ: 'ぉ',
    ㅞ: 'ぇ',
    ㅟ: 'ぃ',
    ㅠ: 'ゆ',
    ㅡ: 'う',
    ㅢ: 'い',
    ㅣ: 'い'
}

const hiraAllHangul = [
    ['아', '이', '우', '에', '오', '야', '유', '요'],
    ['카', '키', '쿠', '케', '코', '캬', '큐', '쿄'],
    ['가', '기', '구', '게', '고', '갸', '규', '교'],
    ['사', '시', '스', '세', '소', '샤', '슈', '쇼'],
    ['자', '지', '즈', '제', '조', '쟈', '쥬', '죠'],
    ['타', '치', '츠', '테', '토', '챠', '츄', '쵸'],
    ['다', '지', '즈', '데', '도', '쟈', '쥬', '죠'],
    ['나', '니', '누', '네', '노', '냐', '뉴', '뇨'],
    ['하', '히', '후', '헤', '호', '햐', '휴', '효'],
    ['바', '비', '부', '베', '보', '뱌', '뷰', '뵤'],
    ['파', '피', '푸', '페', '포', '퍄', '퓨', '표'],
    ['마', '미', '무', '메', '모', '먀', '뮤', '묘'],
    ['라', '리', '루', '레', '로', '랴', '류', '료']
]

//Object Key
const hiraSuteHangul : ObjKey = {
    ぁ : '아',
    ぃ : '이',
    ぅ : '우',
    ぇ : '에',
    ぉ : '오',
    すぃ : '시',
    しぇ : '셰',
    てぃ : '티',
    とぅ : '투',
    ちぇ : '체',
    つぁ : '차',
    つぃ : '치',
    つぇ : '체',
    つぉ : '초',
    ほぅ : '후',
    ふぁ : '화',
    ふぃ : '휘',
    ふぇ : '훼',
    ふぉ : '호',
    ずぃ : '지',
    じぇ : '제',
    でぃ : '디',
    どぅ : '두',
    ぶぁ : '봐',
    ぶぃ : '뷔',
    ぶぇ : '붸',
    ぶぉ : '보'
}

const hiraAllMatch : ObjKey = hiraganaKumi.map( (v, i) => v
        .reduce( (acc, value, index) => { return {...acc, [value] : hiraAllHangul[i][index] } }, {} ) 
    ).reduce( (acc, value, index) => { return { ...acc, ...value } }, {})

const hangulJonsungHiraMatch : ObjKey = {
    ㄱ : 'っ',
    ㄲ : 'っ',
    ㄴ : 'ん',
    ㄷ : 'っ',
    ㄹ : 'っ',
    ㅁ : 'ん',
    ㅂ : 'っ',
    ㅅ : 'っ',
    ㅆ : 'っ',
    ㅇ : 'ん',
    ㅈ : 'っ',
    ㅊ : 'っ',
    ㅋ : 'っ',
    ㅌ : 'っ',
    ㅍ : 'っ',
    ㅎ : 'っ'
}

/**
 * 일본어 전반에 관한 Hook
 * 
 * @returns koNFCToHira, HiraToKoNFC,
    isAllHangul, isAllNihongo, isAllHira, checkKatachi, isOnajiOkuri, 
    traceHukumu, 
    getHyoukiQuery, getYomiQuery, convertObjKey,
 */
function useJaText(){
    const unicodeRange = useContext<UnicodeRangeContext>(UnicodeRangeContext);

    const nfd = useMemo( () => [...'각힣'.normalize('NFD')].map( el => el.charCodeAt(0) ), []);
    const chosungsRegex = useMemo( () => new RegExp(
        `[\\u${nfd[0].toString(16)}-\\u${nfd[3].toString(16)}]`,
        'g'
    ), [nfd]);
    const jungsungsRegex = useMemo( () => new RegExp(
        `[\\u${nfd[1].toString(16)}-\\u${nfd[4].toString(16)}]`,
        'g'
    ), [nfd]);
    const jongsungsRegex = useMemo( () => new RegExp(
        `[\\u${nfd[2].toString(16)}-\\u${nfd[5].toString(16)}]`,
        'g'
    ), [nfd]);
    const isHangulRegex = useMemo( () => new RegExp(
        `^[가-힣-]+$`,
        'g'
    ), []);
    const isAllNihongoRegex = useMemo( () => new RegExp(
        `^[${unicodeRange.kanji}${unicodeRange.hiragana}${unicodeRange.katakana}]+$`,
        'g'
    ), [unicodeRange.hiragana, unicodeRange.kanji, unicodeRange.katakana]);
    const isAllHiraRegex = useMemo( () => new RegExp(
        `^[${unicodeRange.hiragana}]+$`
    ), [unicodeRange.hiragana]);
    const isAllKanjiRegex = useMemo( () => new RegExp(
        `^[${unicodeRange.kanji}]+$`
    ), [unicodeRange.kanji]);

    const isHiraRegex = useMemo( () => new RegExp(
        `[${unicodeRange.hiragana}]+`,
        'g'
    ), [unicodeRange.hiragana]);
    const isKataRegex = useMemo( () => new RegExp(
        `[${unicodeRange.katakana}]`,
        'g'
    ), [unicodeRange.katakana])
    const isKanjiRegex = useMemo( () => new RegExp(
        `[${unicodeRange.kanji}]+`,
        'g'
    ), [unicodeRange.kanji])
    
    /**
     * 카타카나를 히라가나로 변환
     */
    const kataToHira = useCallback( ( str : string ) => {
        if( str === undefined || str === null){ return "" }
    
        let _hirgana =  str.replace( 
            isKataRegex, $0 => $0 !== 'ー' ? String.fromCharCode($0.charCodeAt(0) - 0x0060) : '-'
        )
    
        return _hirgana
    }, [isKataRegex])
    /**
     * 장음 '-'앞의 문자의 중성에 따라 알맞는 히라가나 반환
     * e단과 o단에만 변화
     */
    const checkChouon = useCallback( ( char : string ) => {
        let normalized = char.normalize('NFD').replace(chosungsRegex, $0 => chosungs[$0.charCodeAt(0) - 0x1100]).replace(jungsungsRegex, $0 => junsungs[$0.charCodeAt(0) - 0x1161]).replace(jongsungsRegex, $0 => jongsungs[$0.charCodeAt(0) - 0x11A8]);
        let second = hangulJunsungHiraMatch[ normalized[1] ];

        switch (second) {
            case 'あ':
                return 'あ';
            case 'い':
                return 'い';
            case 'う':
                return 'う';
            case 'え':
                return 'い'; //e단
            case 'お':
                return 'う'; //o단
            default:
                return 'う';
        }
    }, [chosungsRegex, jongsungsRegex, jungsungsRegex])

    /**
     * う, い문자를 장음발음의 히라가나로 변경
     * 읽기 표시중 단어 단위에만 적용하기 위해 만듬
     * 반환 값은 히라가나
     */
    const reviseHira = useCallback( (hira : string) => {

        let hiraArr = kataToHira(hira).match(hiraganaKumiRegex);
        if(hiraArr === null){
            return hira;
        }

        let revise: string[] = [];
        for(let i = 0; i < hiraArr.length; i++ ){
            let char = hiraArr[i];
            if(char === 'う' && i !== 0){
                let _prev = hiraArr[i-1];
                let _dan = hiraganaDanExpended[ _prev ];

                if( _dan === undefined ){
                    revise.push(char);
                }
                else{
                    revise.push( 'ううううおううお'[_dan] );
                }                
            }
            else if( char === 'い' && i !== 0 ){
                let _prev = hiraArr[i-1];
                let _dan = hiraganaDanExpended[ _prev ];

                if( _dan === undefined ){
                    revise.push(char);
                }
                else{
                    revise.push( 'いいいえいいいい'[_dan] );
                }                
            }
            else{
                revise.push(char);
            }
        }
        
        return revise.join('');
    }, [hiraganaKumiRegex] )

    /**
     * 한글 (문자 하나)을 히라가나로 변환
     * 장음은 '-'로 쓸 경우 앏맞게 변환 가능 (checkChouon참고)
     * 
     * @example hangulToHira('-', 1, '소-조-') : 'う'
     * @example hangulToHira('콘', 0, '콘도') : 'こん'
     * @example hangulToHira('샤', 0, '샤신') : 'しゃ'
     */
    const hangulToHira = useCallback( ( char : string, index : number, arr : string[] ) => {
        let normalized = char.normalize('NFD').replace(chosungsRegex, $0 => chosungs[$0.charCodeAt(0) - 0x1100]).replace(jungsungsRegex, $0 => junsungs[$0.charCodeAt(0) - 0x1161]).replace(jongsungsRegex, $0 => jongsungs[$0.charCodeAt(0) - 0x11A8]);

        if(normalized.length >= 2 && normalized.length <= 3){
            let first = hangulChosungHiraMatch[ normalized[0] ];
            let second = hangulJunsungHiraMatch[ normalized[1] ];

            let third = ''
            if(normalized.length === 3){
                third = hangulJonsungHiraMatch[ normalized[2] ];
            }

            if( second === 'ぁ' || second === 'ぃ'|| second === 'ぅ'|| second === 'ぇ'|| second === 'ぉ'){
                let b = hiraganaKou[first];
                let a = hiraganaTokubetsuDan[second];

                return hiraganaTokubetsuKumi[b+1][a] + third;
            }

            let kou = hiraganaKou[first];
            let dan = hiraganaDan[second];

            if(kou === undefined || dan === undefined){
                return char;
            }

            return hiraganaKumi[kou][dan] + third;
        }
        else{
            if( char === '-' && index !== 0){
                return checkChouon( arr[index-1] );
            }
            return char;
        }
    }, [checkChouon, chosungsRegex, jongsungsRegex, jungsungsRegex])

    /**
     * 히라가나 (문자 하나)를 한글로 변환
     * 읽는 법으로 변환하기 위한 기능
     * 장음기호 '-'는 지원하지 않음
     * 
     * @example HiraToHangul('そ', 0, 'そうぞう') : '소'
     * @example HiraToHangul('ん', 1, 'こんど') : 'ㄴ'
     */
    const HiraToHangul = useCallback( ( char : string, index : number, arr : string[]  ) => {
        
        if(char === 'を'){
            return '오'
        }
        if(char === 'わ'){
            return '와'
        }
        if(char === 'ん'){
            return 'ㄴ';
        }
        if(char === 'っ'){
            return 'ㅅ';
        }
        if(char === ' '){
            return ' '
        }

        if( char === '-' && index !== 0){
            let _prev = arr[index-1];
            let _dan = hiraganaDanExpended[ _prev ];
            
            return '아이우에오아우오'[_dan];
        }

        let _match = hiraAllMatch[ char ];

        if( _match !== undefined ){           
            return _match;
        }
        else{
            let _sute = hiraSuteHangul[ char ];
            if( _sute !== undefined ){
                return _sute;
            }
            let _f = hiraAllMatch[ char[0] ] ?? '';
            let _s = char.length === 2 ? hiraSuteHangul[ char[1] ] ?? '' : '';
            
            return `${_f}${_s}`;
        }

    }, [hiraAllMatch])

    /**
     * 한글 (문자열)을 히라가나로 변환
     * 
     * @example hangulToHira('샤신') : 'しゃしん'
     * @example hangulToHira('소-조-') : 'そうぞう'
     */
    const koNFCToHira = useCallback( ( hangul : string ) => {
        let hangulArr = hangul.split('');
        let hira = hangulArr.map( (word, index, arr) =>  hangulToHira(word, index, arr) )

        return hira.join('');
    }, [hangulToHira])

    /**
     * 히라가나 (문자열)를 한글로 변환
     * 읽는 법으로 변환하기 위한 기능
     * 공백은 무시
     * 
     * @example hangulToHira('しゃしん') : '샤신'
     * @example hangulToHira('そうぞう') : '소우조우'
     */
    const HiraToKoNFC = useCallback( (hira : string) => {
        let hiraArr = kataToHira(hira).match(hiraganaKumiRegex);
        if(hiraArr === null){
            return hira;
        }
        let hangul = hiraArr.map( (v, index, arr) => HiraToHangul(v, index, arr) ).join('');

        return assemble(hangul.split(''));
    }, [hiraganaKumiRegex, HiraToHangul])
  
    /**
     * 모든 문자가 한글일 경우에 true를 반환
     */
    const isAllHangul = useCallback( ( text : string ) => {
        isHangulRegex.lastIndex = 0;
        return isHangulRegex.test(text);
    }, [isHangulRegex])

    /**
     * 모든 문자가 일본어일 경우에 true를 반환
     */
    const isAllNihongo = useCallback( (text : string) => {
        isAllNihongoRegex.lastIndex = 0;
        return isAllNihongoRegex.test(text);
    }, [isAllNihongoRegex])

    /**
     * 모든 문자가 히라가나인 경우에 true를 반환
     */
    const isAllHira = useCallback( (text : string) => {
        isAllHiraRegex.lastIndex = 0;
        return isAllHiraRegex.test(text);
    }, [isAllHiraRegex])

    /**
     * 오쿠리가나가 포함된 표기에서 한자만을 추출
     * 단, 히라가나가 한번 이상 나올 경우는 원하는 대로 나오지 않을 가능성이 있음
     */
    const extractKanji = useCallback( ( okuri : string ) => {
        let hyouki_kanji = okuri.match(isKanjiRegex);

        return hyouki_kanji;
    }, [isKanjiRegex])

    /**
     * 표기에서 앞의 히라가나와 뒤의 히라가나를 추출하는 RegExp를 반환
     */
    const getRegexRevise = useCallback( ( text : string ) => {
        let extractKanjiArr = extractKanji(text);
        let kanjiArr : string[] = extractKanjiArr !== null ? extractKanjiArr.join('').split('') : [""];
        let kanji_pattern = kanjiArr.map( (arr) => `${arr}`).join(`[${unicodeRange.hiragana}]*`);

        let testRegex = new RegExp(
            `(?<pre>[${unicodeRange.hiragana}]*)(?<pattern>${kanji_pattern})(?<suf>[${unicodeRange.hiragana}]*)`
        )

        return testRegex;
    }, [extractKanji, unicodeRange.hiragana])

    /**
     * 오쿠리가나가 포함된 표기에서 히라가나만을 추출
     */
    const extractHira = useCallback( ( okuri : string ) => {
        let hyouki_hira = okuri.match(isHiraRegex);

        return hyouki_hira;
    }, [isHiraRegex])

    /**
     * 일본어 형태를 반환
     * okuri는 한자와 히라가나가 포함된 상태
     * 일본어가 아닌 문자가 섞인 경우는 null
     * 
     * @returns 'hira' | 'kanji' | 'okrui' | null
     */
    const checkKatachi = useCallback( ( nihongo : string ) => {
        let isHiraKanjiRegex = new RegExp(
            `^[${unicodeRange.kanji}${unicodeRange.hiragana}${unicodeRange.katakana}]+$`,
            'g'
        );

        isHiraKanjiRegex.lastIndex = 0;
        if( isHiraKanjiRegex.test(nihongo) ){
            isAllHiraRegex.lastIndex = 0;
            isAllKanjiRegex.lastIndex = 0;

            if( isAllHiraRegex.test(nihongo) ){
                return 'hira';
            }
            else if( isAllKanjiRegex.test(nihongo) ){
                return 'kanji';
            }
            else{
                return 'okuri';
            }
        }
        else{
            return null;
        }
    }, [isAllHiraRegex, isAllKanjiRegex, unicodeRange.hiragana, unicodeRange.kanji, unicodeRange.katakana])

    /**
     * hyouki, yomi와 newText(표기 형태)를 비교해서 같은 단어 형태임을 판단
     * 申し込み　申込み를 같은 형태로 보는 함수
     */
    const isOnajiOkuri = useCallback( ( hyouki : string, yomi : string, newText : string ) => {
        let hyouki_type = checkKatachi(hyouki);
        let newText_type = checkKatachi(newText);

        if(hyouki_type === 'kanji'){
            if(newText_type === 'okuri'){
                
                let exKanji = extractKanji(newText);
                let exHira = extractHira(newText);

                let exKanjiPattern = exKanji !== null ? exKanji.map( (arr) => `(${arr}.*)` ).join('') : "";
                let exKanjiRegex = new RegExp(
                    `^(.*)${exKanjiPattern}$`
                );
                let exHiraPattern = exHira !== null ? exHira.map( (arr) => `(.*${arr})` ).join('') : "";
                let exHiraRegex = new RegExp(
                    `^${exHiraPattern}(.*)$`
                );

                exKanjiRegex.lastIndex = 0;

                if( exKanjiRegex.test(hyouki) ){
                    exHiraRegex.lastIndex = 0;

                    if( exHiraRegex.test(yomi) ){
                        return true;
                    }
                }
            }
        }
        else if(hyouki_type === 'okuri'){
            let exKanji = extractKanji(hyouki);
            let exHira = extractHira(hyouki);

            let exKanjiPattern = exKanji !== null ? exKanji.map( (arr) => `(${arr}.*)` ).join('') : null;
            let exKanjiRegex = new RegExp(
                `^(.*)${exKanjiPattern}$`
            );
            let exHiraPattern = exHira !== null ? exHira.map( (arr) => `(.*${arr})` ).join('') : null;
            let exHiraRegex = new RegExp(
                `^${exHiraPattern}(.*)$`
            );

            if(newText_type === 'kanji'){
                // 'お金', 'おかね', '金' 의 경우에는 true가 나옴, newText의 읽기를 비교할수 없는 문제.
                exKanjiRegex.lastIndex = 0;
                if( exKanjiRegex.test(newText) === true ){
                    let maeOkuriPattern = exKanji !== null ? exKanji.map( (arr) => `${arr}(?:.*)` ).join('') : "";
                    let maeOkuriRegex = new RegExp(
                        `^(?<mae>.*)${maeOkuriPattern}$`
                    );
                    
                    if( hyouki.match(maeOkuriRegex)?.groups?.mae === '' ){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
            }
            else if(newText_type === 'okuri'){
                let extractKanjiArr = extractKanji(newText);
                let exKanjiNew = extractKanjiArr !== null ? extractKanjiArr.join('').split('') : [""];
                
                let exHiraNew = extractHira(newText);

                let exKanjiNewPattern = exKanjiNew !== null ? exKanjiNew.map( (arr) => `(${arr}.*)` ).join('') : "";
                let exKanjiNewRegex = new RegExp(
                    `^(.*)${exKanjiNewPattern}$`
                );
                let exHiraNewPattern = exHiraNew !== null ? exHiraNew.map( (arr) => `(.*${arr})` ).join('') : "";
                let exHiraNewRegex = new RegExp(
                    `^${exHiraNewPattern}(.*)$`
                );

                exKanjiNewRegex.lastIndex = 0;
                if( exKanjiNewRegex.test(hyouki) ){
                    let maeOkuriPattern = exKanjiNew.map( (arr) => `${arr}(?:.*)` ).join('');
                    let maeOkuriRegex = new RegExp(
                        `^(?<mae>.*)${maeOkuriPattern}$`
                    );
                    
                    exHiraNewRegex.lastIndex = 0;

                    if( exHiraNewRegex.test(yomi) ){
                        if( hyouki.match(maeOkuriRegex)?.groups?.mae === newText.match(maeOkuriRegex)?.groups?.mae){
                            return true;
                        }
                        else{
                            return false;
                        }
                    }
                }
            }
        }

        return false;
    }, [checkKatachi, extractHira, extractKanji])

    /**
     * 문장에서 다른 오쿠리가나 형태까지 포함해서 찾은 위치와 해당 문자를 제외한 문장을 반환
     * @todo example추가하기
     */
    const matchOkuri = useCallback( (hyouki : string, yomi : string, bunText : string) : [string | null, number, number] => {
        let hyouki_type = checkKatachi(hyouki);

        if( hyouki_type === 'kanji' || hyouki_type === 'okuri'){
            let kanji_regex = getRegexRevise(hyouki);

            let match_bun = bunText.match(kanji_regex);
            let match_hyouki = hyouki.match(kanji_regex);

            if( match_bun === null){
                return [null, -1, -1];
            }
            

            let preStr = '';
            let sufStr = ''
            if(match_hyouki?.groups?.pre !== ''){
                let preRegex = new RegExp(
                    `${match_hyouki?.groups?.pre}$`,
                    'g'
                )
                if(match_bun?.groups?.pre !== ''){
                    let preMatch = match_bun?.groups?.pre.match(preRegex);
                    if( preMatch !== null && preMatch !== undefined){
                        preStr = preMatch[0];
                    }
                }
            }
            
            if(match_hyouki?.groups?.suf !== '' && match_hyouki?.groups?.suf !== undefined){
                let lastIndex = match_hyouki.groups.suf.length - 1;
                let lastHira = match_hyouki.groups.suf[lastIndex];

                let sufRegex = new RegExp(
                    `^[${unicodeRange.hiragana}]*${lastHira}`
                )

                if(match_bun?.groups?.suf !== ''){
                    let sufMatch = match_bun?.groups?.suf.match(sufRegex);
                    if( sufMatch !== null && sufMatch !== undefined ){

                        for(let key in sufMatch){
                            let tmp_regex = new RegExp(
                                `${sufMatch[key]}$`
                            )
                            if( yomi.match(tmp_regex) !== null){
                                sufStr = sufMatch[key];
                            }
                        }
                    }
                }
            }
            else{
                let lastIndex = yomi.length - 1;
                let lastHira = yomi[lastIndex];

                let sufRegex = new RegExp(
                    `^[${unicodeRange.hiragana}]*${lastHira}`
                )

                if(match_bun?.groups?.suf !== ''){
                    let sufMatch = match_bun?.groups?.suf.match(sufRegex);
                    if( sufMatch !== null && sufMatch !== undefined ){
                        
                        for(let key in sufMatch){
                            let tmp_regex = new RegExp(
                                `${sufMatch[key]}$`
                            )
                            if( yomi.match(tmp_regex) !== null){
                                sufStr = sufMatch[key];
                            }
                        }
                    }
                }
            }
            let reviseRegex = new RegExp(
                `${preStr}${match_bun?.groups?.pattern}${sufStr}`,
                'g'
            )
            let match = bunText.match(reviseRegex);

            if(match === null){
                return [null, -1, -1];
            }

            let matchingIndex = bunText.indexOf(match[0]);
            let endIndex = matchingIndex + match[0].length;

            let replaceStr = bunText.split('').fill("　", matchingIndex, endIndex).join('');

            if( isOnajiOkuri(hyouki, yomi, match[0]) === true){
                return [replaceStr, matchingIndex, endIndex];
            }
            if( hyouki === match[0] ){
                return [replaceStr, matchingIndex, endIndex];
            }
        }

        return [null, -1, -1];
    }, [checkKatachi, getRegexRevise, isOnajiOkuri, unicodeRange.hiragana])

    /**
     * matchOkrui의 반복 실행용 함수
     */
    const matchOkuriExec = useCallback( (hyouki : string, yomi : string, bunText : string) => {
        let text : string = bunText;

        function matchExec(){
            let ret = matchOkuri(hyouki, yomi, text);
            if(ret[0] !== null){
                text = ret[0];
                return ret;
            }
            else{
                return null;
            }
        }

        return {
            exec(){
                return matchExec();
            }
        }
    }, [matchOkuri])

    /**
     * 두 문장의 변경점 추출
     * @param bunText 기존 문장
     * @param newText 새 문장
     * 
     * @todo 반환값이 클로저 패턴이므로 메모리 누수가 있는 지 확인하기
     */
    const getMED = (bunText : string, newText : string) => {
        let medArr = Array.from( Array(bunText.length+1), () => new Array(newText.length+1));

        for(let i = 0; i < medArr.length; i++){
            for(let j = 0; j < medArr[i].length; j++){
                if(i === 0){
                    medArr[i][j] = j;
                }
                else{
                    if(j === 0){
                        medArr[i][j] = i;
                    }
                    else{
                        if( bunText[i-1] === newText[j-1]){
                            medArr[i][j] = medArr[i-1][j-1];
                        }
                        else{
                            medArr[i][j] = Math.min( medArr[i][j-1], medArr[i-1][j], medArr[i-1][j-1] ) + 1;
                        }
                    }
                }
            }
        }

        let retRevise : tracedMed = {
            del : new Array(bunText.length).fill(0),
            add : new Array(newText.length).fill(0)
        }

        let i = medArr.length-1;
        let j = medArr[0].length-1;
        while( !(i === 0 && j === 0) ){
            if( i === 0){
                retRevise.add[j-1] = 1;
                j -= 1;

                continue;
            }
            if( j === 0){
                retRevise.del[i-1] = 1;
                i -= 1;

                continue;
            }

            let min = Math.min( medArr[i][j-1], medArr[i-1][j], medArr[i-1][j-1] );

            if(medArr[i][j] === min){
                i -= 1;
                j -= 1;
            }
            else{
                if( min === medArr[i][j-1]){
                    retRevise.add[j-1] = 1;
                    j -= 1;
                }
                else if( min === medArr[i-1][j]){
                    retRevise.del[i-1] = 1;
                    i -= 1;
                }
                else{
                    retRevise.del[i-1] = 1;
                    retRevise.add[j-1] = 1;
                    i -= 1;
                    j -= 1;
                }
            }
        }

        let delExec = function( delMed : number[] ){
            let medValue = delMed;

            function getValue(){
                return medValue;
            }

            function getIsDel(start : number, end : number){
                return medValue.reduce( (acc, v, i) => {
                    if( start <= i && i < end ){
                        return acc + v;
                    }
                    return acc;
                }, 0);
            }

            function setDel(start : number, end : number){
                medValue = medValue.map( (arr, i) => {
                    if( start <= i && i < end ){
                        return 1;
                    }
                    else{
                        return arr;
                    }
                });
            }

            return{
                getIsDel(start : number, end : number){
                    return getIsDel(start, end);
                },
                setDel(start : number, end : number){
                    return setDel(start, end);
                },
                getValue(){
                    return getValue();
                }
            }
        }

        let addExec = function( addMed : number[] ){
            let medValue = addMed;

            function getValue(){
                return medValue;
            }

            function getIsAdd(start : number, end : number){
                return medValue.reduce( (acc, v, i) => {
                    if( start <= i && i < end ){
                        return acc + v;
                    }
                    return acc;
                }, 0);
            }

            function setAdd(start : number, end : number){
                medValue = medValue.map( (arr, i) => {
                    if( start <= i && i < end ){
                        return 1;
                    }
                    else{
                        return arr;
                    }
                });
            }

            return{
                getIsAdd(start : number, end : number){
                    return getIsAdd(start, end);
                },
                setAdd(start : number, end : number){
                    return setAdd(start, end);
                },
                getValue(){
                    return getValue();
                }
            }
        }

        return { del : delExec(retRevise.del), add : addExec(retRevise.add) };
    }

    /**
     * HUKUMU 변경점 찾는 함수
     * 현대 문장에 포함된 Hukumu가 새 문장에서 어디에 위치하고 변경되었는지 추측
     * 위치 변화 및 오쿠리가나를 포함한 표기 변형, 삭제 여부를 찾음
     */
    const traceHukumu = useCallback( (hukumu : HukumuData[], bunText : string, newText : string) => {
        const med = getMED(bunText, newText);

        //일단 현재 getHukumuData의 양식에 따라서.
        const matchArr = hukumu.map( (arr) => { return matchOkuriExec(arr.hyouki, arr.yomi, newText) });

        let ret = [...hukumu] as tracedHukumu[];

        let { del, add } = med;

        for( let i in hukumu){
            let { startOffset : start, endOffset : end } = hukumu[i];

            let isDel = del.getIsDel(start, end);

            if( isDel === 0 ){
                //아무것도 삭제되지 않은 경우.
                let tmpArr;
                while( (tmpArr = matchArr[i].exec()) !== null){
                    let [ , newStart, newEnd ] = tmpArr;
                    let isAdd = add.getIsAdd( newStart, newEnd );

                    if( isAdd < newEnd - newStart ){
                        del.setDel(start, end);
                        add.setAdd(newStart, newEnd);

                        ret[i].find = { str : newText.substring(newStart, newEnd), startOffset : newStart, endOffset : newEnd }
                        break;
                    }
                }
                if( tmpArr === null ){
                    ret[i].find = null;
                }
            }
            else if( isDel < end - start){
                //일부 삭제된 경우.
                let tmpArr;
                while( (tmpArr = matchArr[i].exec()) !== null){
                    let [ , newStart, newEnd ] = tmpArr;
                    let isAdd = add.getIsAdd( newStart, newEnd );

                    if(isAdd < newEnd - newStart){
                        del.setDel(start, end);
                        add.setAdd(newStart, newEnd);

                        ret[i].find = { str : newText.substring(newStart, newEnd), startOffset : newStart, endOffset : newEnd };
                        break;
                    }
                }
                if( tmpArr === null ){
                    ret[i].find = null;
                }
            }
            else{
                let tmpArr;
                while( (tmpArr = matchArr[i].exec()) !== null){
                    let [ , newStart, newEnd ] = tmpArr;
                    let isAdd = add.getIsAdd( newStart, newEnd );

                    if(isAdd === newEnd - newStart){
                        add.setAdd(newStart, newEnd);

                        ret[i].find = { str : newText.substring(newStart, newEnd), startOffset : newStart, endOffset : newEnd };
                        break;
                    }
                }
                if( tmpArr === null ){
                    ret[i].find = null;
                }
            }
        }

        ret = ret.map( (v) => {
            if(v.find !== null){
                if(v.startOffset === v.find.startOffset && v.endOffset === v.find.endOffset && v.hyouki === v.find.str){
                    return { ...v, tag : 'searched'}
                }
                else{
                    return { ...v, tag : 'modified'}
                }
            }
            else{
                return { ...v, tag : 'deleted'}
            }
        })

        return { trace : ret, del : del, add : add };
    }, [matchOkuriExec])

    /**
     * API를 위해 input의 표기를 쿼리 형태로 변환
     * 백엔드에서 TextData로 변환하기 위해 구분자로 힌트를 얻음
     * 
     * @param multiInputData 
     * @example '申し込み' => '申_し_込_み'
     */
    const getHyoukiQuery = (multiInputData : MultiInput[]) : string => {
        return multiInputData.map( (v) => v.data ).join('_');
    }

    /**
     * API를 위해 input에 입력된 읽기를 쿼리형태로 변환
     * 백엔드에서 TextData로 변환하기 위해 구분자로 힌트를 얻음
     * 
     * @param multiInputData 
     * @param multiValue 
     * @example '申し込み', 'もうしこみ' => 'もう_0_こ_0'
     */
    const getYomiQuery = ( multiInputData : MultiInput[], multiValue : string[] ) : string => {
        return multiInputData.map( (v, i) => v.inputBool === false ? '0' : koNFCToHira(multiValue[i])).join('_');
    }
  
    /**
     * 배열을 객체 형태로 변환하는 함수
     * API로 배열을 전송하기 위해 사용함
     * 
     * @param arr 
     * @returns ObjKey형태의 객체
     */
    const convertObjKey = ( arr : any ) => {
        let obj : ObjKey = {};
        for( let key in arr ){
            obj[key] = arr[key];
        }

        return obj;
    }

    return { 
        koNFCToHira, HiraToKoNFC, reviseHira,
        isAllHangul, isAllNihongo, isAllHira, checkKatachi, isOnajiOkuri, 
        traceHukumu, 
        getHyoukiQuery, getYomiQuery, convertObjKey,
    }
}

export { useJaText }