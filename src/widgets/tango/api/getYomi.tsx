import { useEffect, useState } from 'react';

import { useDebounceEffect } from 'shared/hooks/useDebounceEffect';
import { useAxiosGet } from 'shared/hooks/useAxios';
import { useHuri } from 'shared/lib/useHuri';

const DELAY = 300;

export const useGetYomi = ( selection : string, hukumuCheckLoading : boolean ) => {
    const [yomi, setYomi] = useState<string>("");
    const [autoBool, setAutoBool] = useState<boolean>(false);

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
        if( hukumuCheckLoading == false ){
            setAutoBool(false)
            setParams({ text : selection })
        }
    }, DELAY, [hukumuCheckLoading] )
    
    useEffect( () => {
        let res = response;
        if( res !== null ){
            setYomi(res.data.yomi)
            setAutoBool(true)
        }
    }, [response])

    return { autoYomi : yomi, autoBool }
}