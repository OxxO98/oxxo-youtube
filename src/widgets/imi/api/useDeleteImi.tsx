import { useEffect } from 'react';

//Hook
import { useAxiosDelete } from 'shared/hooks/useAxios';

//Redux
import { useAppSelector } from 'shared/store';

export const useDeleteImi = (
    fetch : () => void,
    clearEdit : () => void
) => {
    //Redux
    const { hukumuData, selectedBun } = useAppSelector( (_state) => _state.selection);

    const { response, setParams } = useAxiosDelete<null, REQ_DELETE_IMI>('/db/imi', true, null);

    const deleteImi = ( _iId : string ) => {
        if( !hukumuData ){ return } 

        setParams({
            jaBId : selectedBun,
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
            iId : _iId
        })
    }
    
    useEffect( () => {
        if( response !== null ){
            fetch();
            clearEdit();
        }
    }, [response, fetch])

    return { deleteImi }
}