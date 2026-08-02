import { useEffect } from 'react';
import { useAxiosPut } from 'shared/hooks/useAxios';

//Redux
import { useAppDispatch, timelineActions } from 'shared/store';
const { requestTimelineRefetch } = timelineActions;

export const useUpdateRepresentiveJaText = (
    fetch : () => void
) => {
    
    const dispatch = useAppDispatch();

    const { response, setParams } = useAxiosPut<null, REQ_PUT_TRANSLATE_REP_JA>('/db/ja/representive', true, null );
    
    const updateJaText = (videoId : string, ytBId : string, jaBId : string) => {

        setParams({ videoId : videoId, ytBId : ytBId, jaBId : jaBId });
    }

    useEffect( () => {
        if(response !== null){
            dispatch( requestTimelineRefetch() );
            fetch();
        }
    }, [response, fetch])

    return { updateJaText }
}