import { useCallback, useContext } from 'react';

//Context
import { UnicodeContext } from 'shared/contexts/UnicodeContext'

//hooks
import { useJaText } from 'shared/lib/useJaText';
import { useHuri } from 'shared/lib/useHuri'

export const useSearchedList = () => {
    
    //Context
    const hiraganaRegex = useContext<UnicodeContext>(UnicodeContext).hiragana;

    const { isOnajiOkuri } = useJaText();
    const { getOkuri } = useHuri();

    const getSearchedList = useCallback( ( selection : string, value : string, searchText : SearchText, data : Array<RES_SEARCH_TANGO> ) => {
        if(data !== null && searchText !== null){
            let kanzenSame : RES_SEARCH_TANGO[] = []; //표기 읽기 완전 일치
            let orSame : RES_SEARCH_TANGO[] = []; //표기 or 읽기 완전 일치
            let prefix : RES_SEARCH_TANGO[] = []; //전방일치 (표기)
            let suffix : RES_SEARCH_TANGO[] = []; //후방일치 (표기)
            let okuriHyouki : RES_SEARCH_TANGO[] = []; //오쿠리가나 표기 방식 다름
            let theOther : RES_SEARCH_TANGO[] = []; //그 외

            let okuri = getOkuri( searchText.hyouki );
            let text = okuri.hyouki; //검색어

            for(let key in data){
                let cpr = data[key];

                if( okuri.matched === false ){
                    //검색 텍스트가 okuri가 없을 때,
                    if( selection === cpr.hyouki ){
                        //표기 완전 일치
                        if( value === cpr.yomi ){
                        //읽기 완전 일치
                            kanzenSame.push(cpr);
                        }
                        else{
                            orSame.push(cpr);
                        }
                    }
                    else{
                        if( cpr.hyOffset > 1){
                            prefix.push(cpr);
                        }
                        else if(cpr.hyOffset === 1){
                            suffix.push(cpr);
                        }
                        else{
                            //표기 불일치, 읽기는 일부 일치
                            if( value === cpr.yomi ){
                                if( isOnajiOkuri( selection, value, cpr.hyouki ) ){
                                    okuriHyouki.push(cpr);
                                }
                                else{
                                    orSame.push(cpr);
                                }
                            }
                            else{
                                theOther.push(cpr);
                            }
                        }
                    }
                }
                else{
                    //검색 텍스트가 okuri가 있을 떄,
                    if( selection === cpr.hyouki ){
                        //표기 완전 일치
                        if( value === cpr.yomi ){
                        //읽기 완전 일치
                            kanzenSame.push(cpr);
                        }
                        else{
                            orSame.push(cpr);
                        }
                    }
                    else{
                        // text === cpr['DATA'] 비교할 필요가 있는가.
                        if( cpr.hyOffset> 1){
                            //%text%의 결과 일 수도.
                            if( cpr.hyouki.substring(cpr.hyOffset + text.length) !== '' ){
                                //뒤에 %에 문자가 있을 떄
                                if( cpr.hyouki.substring(cpr.hyOffset + text.length).match( hiraganaRegex ) === null ){
                                    //%에 한자가 들어간 경우
                                    theOther.push(cpr);
                                }
                                else{
                                    //히라가나인 경우 일단 prefix
                                    if( isOnajiOkuri( selection, value, cpr.hyouki ) ){
                                        okuriHyouki.push(cpr);
                                    }
                                    else{
                                        prefix.push(cpr);
                                    }
                                }
                            }
                            else{
                                if( cpr.hyouki.substring(0, cpr.hyOffset).match( hiraganaRegex ) === null ){
                                    //%에 한자가 들어간 경우
                                    theOther.push(cpr);
                                }
                                else{
                                    prefix.push(cpr);
                                }
                            }
                        }
                        else if(cpr.hyOffset === 1){
                            //text%의 결과.
                            if( cpr.hyouki.substring(text.length).match( hiraganaRegex ) === null ){
                                //%에 한자가 들어간 경우
                                theOther.push(cpr);
                            }
                            else{
                                suffix.push(cpr);
                            }
                        }
                        else{
                            //표기 불일치, 읽기는 일부 일치
                            if( value === cpr.yomi ){
                                if( isOnajiOkuri( selection, value, cpr.hyouki ) ){
                                    okuriHyouki.push(cpr);
                                }
                                else{
                                    orSame.push(cpr);
                                }
                            }
                            else{
                                theOther.push(cpr);
                            }
                        }
                    }
                }

            }

            return {
                kanzen : kanzenSame,
                orSame : orSame,
                prefix : prefix,
                suffix : suffix,
                okuri : okuriHyouki,
                theOther : theOther
            }
        }
        else{
            return null;
        }
    }, [getOkuri, hiraganaRegex, isOnajiOkuri])

    return { getSearchedList }
}