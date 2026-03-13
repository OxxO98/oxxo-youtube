import { useEffect, useState } from 'react';

import { useDebounceEffect } from 'shared/hooks/useDebounceEffect';
import { useAxiosGet } from 'shared/hooks/useAxios';

const DELAY = 300;

export const useGetYomi = ( selection : string, hukumuCheckLoading : boolean, hukumuData : HukumuData | null ) => {
    const [yomi, setYomi] = useState<string>("");
    const [autoBool, setAutoBool] = useState<boolean>(false);

    const { response, setParams } = useAxiosGet<any, any>('/db/auto/yomi', true, null)

    useDebounceEffect( () => {
        if( hukumuData === null && hukumuCheckLoading == false ){
            setAutoBool(false)
            setParams({ text : selection })
        }
    }, DELAY, [hukumuCheckLoading] )
    
    useEffect( () => {
        let res = response;
        if( res !== null ){
            if(res.message === 'success'){
                setYomi(res.data.yomi)
                setAutoBool(true)
            }
            else{
                setYomi("")
                setAutoBool(false)
            }
        }
    }, [response])

    return { autoYomi : yomi, autoBool }
}