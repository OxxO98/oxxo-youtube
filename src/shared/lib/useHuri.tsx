import { useCallback, useContext } from 'react';

import { UnicodeContext } from 'shared/contexts/UnicodeContext';

/**
 * 후리가나에 관한 Hook
 * 
 * @returns yomiToHuri, complexArr, getOkuri
 */
function useHuri(){
    const kanjiRegex = useContext<UnicodeContext>(UnicodeContext).kanji;
    const hiraganaRegex = useContext<UnicodeContext>(UnicodeContext).hiragana;
    const kanjiStartRegex = useContext<UnicodeContext>(UnicodeContext).kanjiStart;
    const kanjiEndRegex = useContext<UnicodeContext>(UnicodeContext).kanjiEnd;
    const okuriRegex = useContext<UnicodeContext>(UnicodeContext).okuri;

    /**
     * 표기와 읽기를 기준으로 표기의 한자 읽기만을 배열로 반환
     * 
     * @example yomiToHuri('申し込み', 'もうしこみ') : ['もう', 'こ']
     */
    const yomiToHuri = useCallback( (hyouki : string, yomi : string) => {
        if(hyouki === null || hyouki === undefined || yomi === null || yomi === undefined){
            return;
        }

        let startBool = hyouki.match(kanjiStartRegex) !== null ? true : false; //true면 한자 시작
        let endBool = hyouki.match(kanjiEndRegex) !== null ? true : false; //true면 한자 시작

        let arrOkuri : RegExpMatchArray | null = hyouki.match(hiraganaRegex);
        let exHiraPattern = arrOkuri !== null ? arrOkuri.join('(.+)') : null;

        let arrHuri : string[] = [];
        
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

    /**
     * 표기와 읽기를 토대로 {한자 + 후리가나} 혹은 {히라가나} 형식으로 분해 후, 각 offset을 반환
     * ComplexText에서 표기, 읽기를 Text 형식으로 분해하는 용도로 쓰임
     * 
     * @param hyouki 표기
     * @param yomi 읽기
     * @param offset 기준 오프셋
     * @example complexArr('申し込み', 'もうしこみ', 0) : [{'申', 'もう', 0}, {'し', null, 1}, {'込', 'こ', 2}, {'み', null, 3}]
     */
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

        let tmp : TextData[] = [];
        
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

    /**
     * 표기 중 맨 뒤의 오쿠리가나를 제외해서 반환
     * 
     * @param hyouki 표기
     * @example getOkuri('申し込み') : { matched : true, hyouki : '申し込', any : '申し', kanji : '込' }
     * @example getOkuri('申込') : { matched : false, hyouki : '申込', any : null, kanji : null }
     */
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