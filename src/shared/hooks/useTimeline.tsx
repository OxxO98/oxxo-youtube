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