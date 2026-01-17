import { useEffect, useState } from 'react';

import { useAxiosGet } from 'shared/hooks/useAxios';

/**
 * 해당 비디오의 모든 단어를 가져오는 Hook
 * 
 * @param videoId 비디오 ID
 * @returns 
 */
function useTangoList(videoId : string){

    const [tangoList, setTangoList] = useState<TangoList[] | null>(null);

    const {response, setParams, fetch } = useAxiosGet<RES_GET_LIST_TANGO, REQ_GET_LIST_TANGO>('/db/list/tango', true, null);

    useEffect( () => {
        let res = response;
        if(res !== null){
            setTangoList(res.data);
        }
    }, [response])

    useEffect( () => {
        if( videoId !== null && videoId !== undefined ){
            setParams({ videoId : videoId });
        }
    }, [videoId, setParams])

    return { tangoList, fetch }
}

export { useTangoList }
