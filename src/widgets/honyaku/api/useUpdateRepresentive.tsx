import { useEffect } from 'react';
import { useAxiosPut } from 'shared/hooks/useAxios';

export const useUpdateRepresentive = (
    fetch : () => void
) => {
    const { response, setParams } = useAxiosPut<null, REQ_PUT_TRANSLATE_REP>('/db/translate/representive', true, null );
    
    const updateHonyaku = (videoId : string, ytBId : string, value : string) => {

        setParams({ videoId : videoId, ytBId : ytBId, koBId : value });
    }

    useEffect( () => {
        if(response !== null){
            fetch();
        }
    }, [response, fetch])

    return { updateHonyaku }
}