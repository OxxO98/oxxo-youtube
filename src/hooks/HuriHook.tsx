import { useCallback, useContext } from 'react';

import { UnicodeContext } from 'contexts/UnicodeContext';

function useHuri(){
  const kanjiRegex = useContext<UnicodeContext>(UnicodeContext).kanji;
  const hiraganaRegex = useContext<UnicodeContext>(UnicodeContext).hiragana;
  const kanjiStartRegex = useContext<UnicodeContext>(UnicodeContext).kanjiStart;
  const kanjiEndRegex = useContext<UnicodeContext>(UnicodeContext).kanjiEnd;
  const okuriRegex = useContext<UnicodeContext>(UnicodeContext).okuri;

  //현재 애매한 부분..
  /*
    개선 이유 : 일단 HUKUMU가 없이 임의로 입력하는 경우, ComplexText => Text의 과정이 필요
    또한 Hukumu가 있다면 해당 데이터로 출력도 가능하게 분리 예정.
  */
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

  //삭제 예정..
  const yomiToHuriLegacy = (hyouki : string, yomi : string) => {
    if(hyouki === null || hyouki === undefined || yomi === null || yomi === undefined){
      return;
    }

    let startBool = hyouki.match(kanjiStartRegex) !== null ? true : false; //true면 한자 시작

    let arrKanji : RegExpMatchArray | null = hyouki.match(kanjiRegex);
    let arrOkuri : RegExpMatchArray | null = hyouki.match(hiraganaRegex);
    let arrHuri : string[] = [];

    let endIndex = 0;
    if(startBool === false){
      if(arrOkuri !== null && arrOkuri !== undefined){
        let shiftOkuri = arrOkuri.shift();
        if(shiftOkuri !== undefined ){
          endIndex = shiftOkuri.length;
        }

        if(arrOkuri.length === 0){
          arrHuri.push( yomi.substring(endIndex) );
          return arrHuri;
        }
      }
    }

    if(arrOkuri !== null){
      for(let idx = 0; idx < arrOkuri.length; idx++){
        let revise = endIndex + 1;
        let matchedYomi = yomi.indexOf(arrOkuri[idx], revise);
        arrHuri.push( yomi.substring(endIndex, matchedYomi) );
  
        endIndex = matchedYomi + arrOkuri[idx].length;
      }
    }

    //후작업.
    if(yomi.substring(endIndex) !== ''){
      //한자로 끝나서 okuri가 없는 경우에는 추가가 맞음
      //히라가나로 끝나는 경우는 잘못 된 검색이 이루어진 것.
      if( arrOkuri !== null){
        let lastOkuri = arrOkuri[arrOkuri.length-1];
        if( yomi.lastIndexOf(lastOkuri) === yomi.length - lastOkuri.length ){
          arrHuri[arrHuri.length-1] = yomi.substring(endIndex-lastOkuri.length, yomi.length - lastOkuri.length);
        }
        else{
          //okrui가 있지만 한자로 끝난 경우
          arrHuri.push(yomi.substring(endIndex));
        }
      }
      else{
        //okuri가 아예 없던 경우 (한자만 존재)
        arrHuri.push(yomi.substring(endIndex));
      }
    }
    //arr의 형태로 반환
    return arrHuri;
  }

  const hysToHuri = (bunText : string, hys : string, huri : string) => {
    //HYS는 표기를 전각 공백으로 연결 한 것
    let hurigana = "";
    if(huri !== null && hys !== null){
      let kanjiBunArr : ObjKey | null = bunText.match(kanjiRegex);
      let hyoukiArr = hys.split('　');
      let huriArr = huri.split('　');

      let hyoukiKanjiArr = [];

      for(let i in hyoukiArr){
        let sel = hyoukiArr[i];
        let a : RegExpMatchArray | null = sel.match(kanjiRegex);
        if(a !== null){
          for( let key in a){
            hyoukiKanjiArr.push(a[key]);
          }
        }
      }

      let tmp : Array<string> = [];
      for(let i in huriArr){
        let sel = yomiToHuri(hyoukiArr[i], huriArr[i]);
        if(sel !== null && sel !== undefined){
          for( let key in sel ){
            tmp.push( sel[key] );
          }
        }
      }

      hurigana = kanjiBunArr !== null ? kanjiBunArr.join('　') : "";
      hyoukiKanjiArr.map( (arr, index) => {
        hurigana = hurigana.replace( arr, tmp[index]);
      })
    }

    return hurigana;
  }

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

  return { yomiToHuri, hysToHuri, complexArr, getOkuri }
}

export { useHuri }