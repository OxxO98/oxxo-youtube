import { useEffect, useState } from 'react';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//Redux
import { useAppDispatch, timelineActions, useAppSelector } from 'shared/store';
const { setBunIds, setLoading } = timelineActions;

/**
 * 해당 비디오의 Timeline의 정보를 가져오는 Hook
 * 가져온 뒤에는 store에 저장
 * 
 * @param videoId 비디오 ID
 * @returns 
 */
export function useTimeline( videoId : string ){

    //Redux
    const { refetchKey } = useAppSelector( (state) => state.timeline );

    //State
    const [translationDirection, setTranslateionDirection] = useState<TranslationDirection>('ja-ko');

    //Hook
    const { response, loading, fetch } = useAxiosGet<RES_GET_TIMELINE, REQ_GET_TIMELINE>('/db/timeline', false, { videoId: videoId });
    
    const dispatch = useAppDispatch();

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            if(res.message === 'success'){
                dispatch( setBunIds(res.data.timeline) );
            }
            if(res.message === 'empty'){
                dispatch( setBunIds(null) );
            }
            setTranslateionDirection( res.data.direction );
        }
    }, [response])

    useEffect( () => {
        if( refetchKey > 0 ){
            fetch();
        }
    }, [refetchKey, fetch])

    useEffect( () => {
        dispatch( setLoading(loading) );
    }, [loading])

    return { translationDirection }
}