import { useEffect } from 'react'

//Hook
import { useAxiosPost } from 'shared/hooks/useAxios';

//Redux
import { useAppDispatch, useAppSelector, timelineActions } from 'shared/store';
const { requestTimelineRefetch } = timelineActions;

export function usePostTimeline( 
    videoId : string,
    translationDirection : TranslationDirection,
    cancelEdit : () => void
){

    //Redux
    const { startTime, endTime } = useAppSelector((state) => state.reactPlayer)
    const dispatch = useAppDispatch();

    const { response, setParams } = useAxiosPost<null, REQ_POST_BUN>('/db/bun', true, null);

    const insertBun = ( value : string ) => {
        if( value === '' ){ return }
        if( endTime === null || startTime === null ){ return } 
        if( endTime - startTime === 0 ){ return }

        setParams({
            videoId : videoId,
            translationDirection : translationDirection,
            value : value,
            startTime : startTime,
            endTime : endTime
        });
    }
    useEffect( () => {
        let res = response;
        if(res !== null){
            if(res.message === 'success'){
                cancelEdit();
                dispatch( requestTimelineRefetch() );
            }
        }
    }, [response, cancelEdit])

    return { insertBun }
}