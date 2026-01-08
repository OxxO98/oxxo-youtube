import { useEffect } from 'react';
import { useAxiosDelete } from 'shared/hooks/useAxios';

export const useDeleteTranslate = (
    fetch : () => void,
    clearEdit : () => void
) => {
    const { response, setParams } = useAxiosDelete<null, REQ_DELETE_TRANSLATE>('/db/translate', true, null );

    const deleteHonyaku = (videoId : string, ytBId : string, translates : RES_GET_TRANSLATE) => {
        if(translates.koBun !== null){
            let koBId = translates.koBun.koBId;

            setParams({ videoId : videoId, ytBId : ytBId, koBId : koBId });
        }
    }

    useEffect( () => {
        if( response !== null ){
            fetch();
            clearEdit();
        }
    }, [response, fetch, clearEdit])

    return { deleteHonyaku }
}