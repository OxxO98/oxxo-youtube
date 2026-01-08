import { useEffect } from 'react';

//Hook
import { useAxiosPost } from 'shared/hooks/useAxios';

//Redux
import { useAppSelector } from 'shared/store';

export const usePostImi = (
    fetch : () => void,
    clearEdit : () => void
) => {
    //Redux
    const { hukumuData, selectedBun } = useAppSelector( (_state) => _state.selection);

    const { response, setParams } = useAxiosPost<null, REQ_POST_IMI>('/db/imi', true, null);
    
    const postImi = ( value : string ) => {
        if( !hukumuData ){ return } 

        setParams({
            jaBId : selectedBun,
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
            tId : hukumuData.tId, value : value
        })
    }
    
    useEffect( () => {
        if( response !== null ){
            fetch();
            clearEdit();
        }
    }, [response, fetch])

    return { postImi }
}