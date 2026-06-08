import { useEffect, useState } from 'react'

//Hook
import { useAxiosPost } from 'shared/hooks/useAxios';

//Redux
import { useAppSelector } from 'shared/store';

export function usePostTimeline( 
    videoId : string,
    refetchTimeline : () => void,
    cancelEdit : () => void
){
    //Redux
    const { startTime, endTime } = useAppSelector((state) => state.reactPlayer)
    
    const { response, setParams } = useAxiosPost<null, REQ_POST_BUN>('/db/bun', true, null);

    const insertBun = ( value : string) => {
        if( value === '' ){ return }
        if( endTime === null || startTime === null ){ return } 
        if( endTime - startTime === 0 ){ return }

        setParams({
            videoId : videoId,
            jaText : value,
            startTime : startTime,
            endTime : endTime
        });
    }
    useEffect( () => {
        let res = response;
        if(res !== null){
            if(res.message === 'success'){
                cancelEdit();
                refetchTimeline();
            }
        }
    }, [response, cancelEdit, refetchTimeline])

    return { insertBun }
}