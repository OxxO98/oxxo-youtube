import { useEffect, useState } from 'react';

import { useDebounceEffect } from 'shared/hooks/useDebounceEffect';
import { useAxiosGet } from 'shared/hooks/useAxios';
import { useHuri } from 'shared/lib/useHuri';

const DELAY = 300;

export const useGetYomi = ( selection : string, hukumuDataYomi : string | undefined, hukumuCheckLoading : boolean, kirikaeValue : string[] ) => {
    const [yomi, setYomi] = useState<string[]>(kirikaeValue);

    const { response, setParams } = useAxiosGet<any, any>('/db/auto/yomi', true, null)

    const { yomiToHuri } = useHuri();

    const getDefaultInput = (yomi : string) => {
        if(yomi !== null && yomi !== undefined && selection){
            let huriArr = yomiToHuri(selection, yomi);

            return huriArr;
        }
        else{
            return null;
        }
    }
    
    useDebounceEffect( () => {
        if(hukumuDataYomi == undefined && hukumuCheckLoading == false ){
            setParams({ text : selection })
        }
    }, DELAY, [hukumuCheckLoading] )
    
    useEffect( () => {
        let res = response;
        if( res !== null ){
            let def = getDefaultInput(res.data.yomi);

            let huriIndex = 0;
            let tmp = [...kirikaeValue];
            for(let key in tmp){
                if( tmp[key] === '' && def !== null && def !==  undefined && def[huriIndex] !== undefined ){
                    tmp[key] = def[huriIndex];
                    huriIndex++;
                }
            }

            setYomi(tmp)
        }
    }, [response])

    return { kirikaeValueAuto : yomi }
}