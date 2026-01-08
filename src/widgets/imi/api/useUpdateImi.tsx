import { useEffect } from 'react';

//Hook
import { useAxiosPut } from 'shared/hooks/useAxios';

//Redux
import { useAppSelector } from 'shared/store';

export const useUpdateImi = (
    fetch : () => void
) => {
    //Redux
    const { hukumuData, selectedBun } = useAppSelector( (_state) => _state.selection);

    const { response, setParams } = useAxiosPut<null, REQ_PUT_IMI>('/db/imi', true, null);
    
    const setIIdHukumu = ( value : string ) => {
        if( !hukumuData ){ return } 

        setParams({
            jaBId : selectedBun,
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
            iId : value
        })
    }
    
    useEffect( () => {
        if( response !== null ){
            fetch();
        }
    }, [response, fetch])

    return { setIIdHukumu }
}