import { useEffect } from 'react';
import { useAxiosPut } from 'shared/hooks/useAxios';

//Redux
import { useAppDispatch, timelineActions } from 'shared/store';
const { requestTimelineRefetch } = timelineActions;

export const useUpdateRepresentive = (
    fetch : () => void
) => {
    const dispatch = useAppDispatch();

    const { response, setParams } = useAxiosPut<null, REQ_PUT_TRANSLATE_REP>('/db/ko/representive', true, null );
    
    const updateHonyaku = (videoId : string, ytBId : string, koBId : string) => {

        setParams({ videoId : videoId, ytBId : ytBId, koBId : koBId });
    }

    useEffect( () => {
        if(response !== null){
            dispatch( requestTimelineRefetch() );
            fetch();
        }
    }, [response, fetch])

    return { updateHonyaku }
}