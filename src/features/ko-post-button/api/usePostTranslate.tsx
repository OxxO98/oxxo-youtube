import { useEffect } from 'react';
import { useAxiosPost } from 'shared/hooks/useAxios';

export const usePostTranslate = (
    fetch? : () => void,
    clearEdit? : () => void
) => {
    const { response, setParams, loading } = useAxiosPost<null, REQ_POST_TRANSLATE>('/db/ko', true, null );
 
    const postHonyaku = (videoId : string, ytBId : string, value : string) => {

        setParams({ videoId : videoId, ytBId : ytBId, value : value });
    }

    useEffect( () => {
        if( response !== null ){
            if( fetch !== undefined ){ fetch() };
            if( clearEdit !== undefined ){ clearEdit() };
        }
    }, [response, fetch, clearEdit])

    return { postHonyaku, loading }
}