import { useState, useEffect } from 'react';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//Redux
import { useAppDispatch, timelineActions } from 'shared/store';
const { setBunIds } = timelineActions;

type fetch = () => Promise<void>;
export type timelineHandles = {
    refetch : fetch,
    loading : boolean
}

/**
 * 해당 비디오의 Timeline의 정보를 가져오는 Hook
 * 가져온 뒤에는 store에 저장
 * 
 * @param videoId 비디오 ID
 * @returns 
 */
export function useTimeline( videoId : string ){

    const { response, loading, fetch } = useAxiosGet<RES_GET_TIMELINE, REQ_GET_TIMELINE>('/db/timeline', false, { videoId: videoId });
    
    const dispatch = useAppDispatch();

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            if(res.message === 'success'){
                dispatch( setBunIds(res.data) );
            }
        }
    }, [response])

    const timelineHandles = {
        refetch : fetch,
        loading : loading
    }

    return { timelineHandles }
}