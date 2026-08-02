import { useEffect } from 'react';
import { useAxiosPut } from 'shared/hooks/useAxios';

//Redux
import { useAppDispatch, timelineActions } from 'shared/store';
const { requestTimelineRefetch } = timelineActions;

export const useUpdateTranslate = (
    fetch? : () => void,
    clearEdit? : () => void
) => {
    const dispatch = useAppDispatch();

    const { response, setParams, loading } =  useAxiosPut<null, REQ_PUT_TRANSLATE>('/db/ko', true, null );
    
    const updateHonyaku = (videoId : string, ytBId : string, value : string) => {

        setParams({ videoId : videoId, ytBId : ytBId, value : value });
    }

    useEffect( () => {
        if( response !== null ){
            dispatch( requestTimelineRefetch() );
            
            if( fetch !== undefined ){ fetch() };
            if( clearEdit !== undefined ){ clearEdit() };
        }
    }, [response, fetch, clearEdit])

    return { updateHonyaku, loading }
}