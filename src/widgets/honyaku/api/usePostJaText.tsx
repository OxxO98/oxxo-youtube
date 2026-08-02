import { useEffect } from 'react';
import { useAxiosPost } from 'shared/hooks/useAxios';

export const usePostJaText = (
    fetch : () => void,
    clearEdit : () => void
) => {
    const { response, setParams, loading } = useAxiosPost<null, REQ_POST_TRANSLATE>('/db/ja', true, null );
 
    const postJaText = (videoId : string, ytBId : string, value : string) => {

        setParams({ videoId : videoId, ytBId : ytBId, value : value });
    }

    useEffect( () => {
        if( response !== null ){
            fetch();
            clearEdit();
        }
    }, [response, fetch, clearEdit])

    return { postJaText, loading }
}