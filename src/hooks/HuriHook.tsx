import { useCallback, useContext } from 'react';

import { UnicodeContext } from 'contexts/UnicodeContext';

function useHuri(){
  const kanjiRegex = useContext<UnicodeContext>(UnicodeContext).kanji;
  const hiraganaRegex = useContext<UnicodeContext>(UnicodeContext).hiragana;
  const kanjiStartRegex = useContext<UnicodeContext>(UnicodeContext).kanjiStart;
  const kanjiEndRegex = useContext<UnicodeContext>(UnicodeContext).kanjiEnd;
  const okuriRegex = useContext<UnicodeContext>(UnicodeContext).okuri;

  const yomiToHuri = useCallback( (hyouki : string, yomi : string) => {
    if(hyouki === null || hyouki === undefined || yomi === null || yomi === undefined){
      return;
    }

    let startBool = hyouki.match(kanjiStartRegex) !== null ? true : false; //true면 한자 시작
    let endBool = hyouki.match(kanjiEndRegex) !== null ? true : false; //true면 한자 시작

    let arrOkuri : RegExpMatchArray | null = hyouki.match(hiraganaRegex);
    let exHiraPattern = arrOkuri !== null ? arrOkuri.join('(.+)') : null;

    let arrHuri : Array<string> = [];
    
    if( exHiraPattern === null ){
      return [yomi];
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
      matched
        .filter( (v, i) => i !== 0 )
        .map( (v) => arrHuri.push(v) );
    }

    return arrHuri;
  }, [hiraganaRegex, kanjiEndRegex, kanjiStartRegex])

  //ComplexText에서 표기, 읽기를 Text 형식으로 분해.
  const complexArr = (hyouki : string, yomi : string | null, offset : number) => {
    if(yomi === null){
      return [{
        data : hyouki,
        ruby : null,
        offset : offset
      }]
    }

    let arrKanji : ObjKey | null = hyouki.match(kanjiRegex);
    let arrOkuri : ObjKey | null = hyouki.match(hiraganaRegex);
    let arrHuri = yomiToHuri( hyouki, yomi );

    if(arrOkuri === null || arrKanji === null){
      return [{
        data : hyouki,
        ruby : yomi,
        offset : offset
      }]
    }

    let startBool = hyouki.match(kanjiStartRegex) !== null ? true : false; //true면 한자 시작

    let kanjiIndex = 0;
    let okuriIndex = 0;
    let tmpOffset = offset;

    let tmp : Array<TextData> = [];
    
    for(let i = 0; i < arrKanji.length + arrOkuri.length; i++){
      if(startBool === false){
        tmp.push({data : arrOkuri[okuriIndex], ruby: null, offset : tmpOffset});
        tmpOffset += arrOkuri[okuriIndex].length;
        okuriIndex++;
        startBool = true;
      }
      else{
        if(arrHuri !== null && arrHuri !== undefined){
          tmp.push({data : arrKanji[kanjiIndex], ruby : arrHuri[kanjiIndex], offset : tmpOffset});
        }
        else{
          tmp.push({data : arrKanji[kanjiIndex], ruby : null, offset : tmpOffset});
        }
        tmpOffset += arrKanji[kanjiIndex].length;
        kanjiIndex++;
        startBool = false;
      }
    }
    
    return tmp;
  }

  const getOkuri = useCallback( (hyouki : string) => {
    //표기중 뒤의 오쿠리가나를 제외해서 반환
    let a = hyouki.match(okuriRegex);

    if(a?.groups !== undefined ){
      return {
        matched : true,
        hyouki : a.groups.any + a.groups.kanji,
        any : a.groups.any,
        kanji : a.groups.kanji
      }
    }
    else{
      return {
        matched : false,
        hyouki : hyouki,
        any : null,
        kanji : null
      }
    }
  }, [okuriRegex])

  return { yomiToHuri, complexArr, getOkuri }
}

export { useHuri }