import { useEffect } from 'react';
import { useAxiosPut } from 'shared/hooks/useAxios';

export const useUpdateTranslate = (
    fetch : () => void,
    clearEdit : () => void
) => {
    const { response, setParams, loading } =  useAxiosPut<null, REQ_PUT_TRANSLATE>('/db/translate', true, null );
    
    const updateHonyaku = (videoId : string, ytBId : string, value : string) => {

        setParams({ videoId : videoId, ytBId : ytBId, value : value });
    }

    useEffect( () => {
        if( response !== null ){
            fetch();
            clearEdit();
        }
    }, [response, fetch, clearEdit])

    return { updateHonyaku, loading }
}