import React, { useContext, useEffect, useState } from 'react';
import { UnicodeContext } from 'contexts/UnicodeContext';

import { useDebounceEffect } from 'hooks/OptimizationHook';
import { useJaText } from 'hooks/JaTextHook';
import { useHuri } from 'hooks/HuriHook';

function useKirikae(value : string, handleChange : (e : React.ChangeEvent<any>) => void){

  const [kirikae, setKirikae] = useState<string | null>(null); //변환된 히라가나
  const [isKirikae, setIsKirikae] = useState<boolean>(false);

  const { isAllHangul, isAllHira, koNFCToHira } = useJaText();

  const handleKrikae = (e : React.ChangeEvent) => {
    if( isKirikae === true ){
      setIsKirikae(false);
    }
    else{
      handleChange(e);
    }
  }

  const changeHira = (value : string) => {
    if( isAllHangul(value) === true && isAllHira(value) === false ){
      return koNFCToHira(value);
    }
    else{
      return value;
    }
  }

  useDebounceEffect( () => {
    if(isKirikae === false ){ setIsKirikae( true ) }
  }, 1000, [value, isKirikae] )

  useEffect( () => {
    if(value !== null){
      if(isKirikae === true){
        setIsKirikae(false);
      }
      else{
        let kirikaeTmp = changeHira(value);
        setKirikae(kirikaeTmp);
      }
    }
  }, [value])

  const kirikaeValue = isKirikae ? kirikae : value;

  return { kirikaeValue, handleChange : handleKrikae, kirikae }
}

function useMultiKirikae(dependancy : string | null, multiValue : Array<string>, handleMultiChange : (e : React.ChangeEvent<any>, index : number) => void ){

  const [value, setValue] = useState<Array<string>>([]); //변환된 히라가나 배열
  const [isKirikae, setIsKirikae] = useState<boolean>(false);

  const { isAllHangul, isAllHira, koNFCToHira } = useJaText();

  const handleChange = (e : React.ChangeEvent, index : number) => {
    if( isKirikae === true){
      setIsKirikae(false);
    }
    else{
      handleMultiChange(e, index);
    }
  }

  const changeHira = (value : string) => {
    if( isAllHangul(value) === true && isAllHira(value) === false ){
      return koNFCToHira(value);
    }
    else{
      return value;
    }
  }

  const changeMultiHira = () => {
    let kirikaeTmp = [...value];
    for(let key in multiValue){
      kirikaeTmp[key] = changeHira( multiValue[key] );
    }
    setValue(kirikaeTmp);
  }

  const concatMultiInput = () => {
    let retStr = '';
    for(let key in multiValue){
      retStr += changeHira(multiValue[key]);
    }
    return retStr;
  }

  useDebounceEffect( () => {
    if(isKirikae === false ){ setIsKirikae( true ) }
  }, 1000, [isKirikae, multiValue] )

  useEffect( () => {
    if(multiValue !== null){
      changeMultiHira();
      if(isKirikae === true){
        setIsKirikae(false);
      }
    }
  }, [multiValue])

  useEffect( () => {
    if(dependancy !== null){
      setValue([]);
    }
  }, [dependancy])

  const kirikaeValue = isKirikae ? value : multiValue;

  return { kirikaeValue, concatMultiInput, handleChange }
}

function useMultiInput(dependancy : string | null, defaultInput? : string | undefined, edit? : boolean ){

  const [multiValue, setMultiValue] = useState<Array<string>>([]);

  const [multiInputData, setMultiInputData] = useState([{data : '', inputBool : false}]);

  const { yomiToHuri } = useHuri();

  //useHuri로 대체 할 수 있는 지 확인 바람.
  const kanjiRegex = useContext<UnicodeContext>(UnicodeContext).kanji;
  const hiraganaRegex = useContext<UnicodeContext>(UnicodeContext).hiragana;

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>, index : number) => {
    let tmp = [...multiValue];
    tmp[index] = e.target.value;
    setMultiValue(tmp);
  }

  const multiInput = (tango : string) => {
    let arrKanji = tango.match(kanjiRegex);
    let arrOkuri = tango.match(hiraganaRegex);
    let arrHuri = []; //tango의 히라가나 부분만 들어가는 배열

    let startBool = true; //true면 한자 시작

    let tmp = [];

    let endIndex = 0;
    if(arrOkuri !== null){
      for(let idx = 0; idx < arrOkuri.length; idx++){

        if(tango.substring(endIndex, tango.indexOf(arrOkuri[idx], endIndex)) === ''){
          startBool = false;
        }
        else{
          arrHuri.push(tango.substring(endIndex, tango.indexOf(arrOkuri[idx], endIndex)));
        }
        endIndex = tango.indexOf(arrOkuri[idx], endIndex)+arrOkuri[idx].length;
        //첫문자가 히라가나로 시작할 경우 빈문자열 push됨.
      }
      if(tango.substring(endIndex) !== ''){
        arrHuri.push(tango.substring(endIndex));
      }
    }

    let kanjiIndex = 0;
    let okuriIndex = 0;
    if(arrOkuri !== null && arrKanji !== null){
      for(let i = 0; i < arrKanji.length + arrOkuri.length; i++){
        if(startBool === false){
          tmp.push({ data : arrOkuri[okuriIndex], inputBool : false });
          okuriIndex++;
          startBool = true;
        }
        else{
          tmp.push({ data : arrKanji[kanjiIndex], inputBool : true });
          kanjiIndex++;
          startBool = false;
        }
      }
    }
    else{
      if(arrOkuri !== null && arrKanji === null){
        tmp = [{ data : arrOkuri[0], inputBool :  false }];
      }
      else if(arrOkuri === null && arrKanji !== null){
        tmp = [{ data : arrKanji[0], inputBool : true }];
      }
      else{
        tmp = [{ data : '', inputBool : false }];
      }
    }

    return tmp;
  }

  //불안정.
  const getDefaultInput = () => {
    if(defaultInput !== null && defaultInput !== undefined && dependancy){
      let huriArr = yomiToHuri(dependancy, defaultInput);

      return huriArr;
    }
    else{
      return null;
    }
  }

  useEffect( () => {
    if(dependancy !== null && dependancy !== undefined){
      if( dependancy.length > 10 ){
        return;
      }
      let tmp = multiInput(dependancy);

      setMultiInputData(tmp);

      let ret : Array<string> = [];
      for(let key in tmp){
        if(tmp[key]['inputBool'] === false){
          ret[key] = tmp[key]['data'];
        }
        else{
          ret[key] = '';
        }
      }
      setMultiValue( ret );
    }
  }, [dependancy]);

  useEffect( () => {
    if( edit === true && defaultInput !== undefined ){
      let def = getDefaultInput();

      let huriIndex = 0;
      let tmp = [...multiValue];
      for(let key in tmp){
        if( def !== null && def !==  undefined ){
          tmp[key] = def[huriIndex];
          huriIndex++;
        }
      }
      
      setMultiValue(tmp);
    }
  }, [edit])


  return { multiValue, multiInputData, handleChange }
}

export { useKirikae, useMultiKirikae, useMultiInput }
