import { useEffect } from 'react';
import { useAxiosDelete } from 'shared/hooks/useAxios';

export const useDeleteTranslate = (
    fetch? : () => void,
    clearEdit? : () => void
) => {
    const { response, setParams } = useAxiosDelete<null, REQ_DELETE_TRANSLATE>('/db/ko', true, null );

    const deleteHonyaku = (videoId : string, ytBId : string, koBId : string | null) => {
        if( koBId !== null ){
            setParams({ videoId : videoId, ytBId : ytBId, koBId : koBId });
        }
    }

    useEffect( () => {
        if( response !== null ){
            if( fetch !== undefined ){ fetch() };
            if( clearEdit !== undefined ){ clearEdit() };
        }
    }, [response, fetch, clearEdit])

    return { deleteHonyaku }
}