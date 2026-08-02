import { useEffect } from 'react';

//Hook
import { useAxiosPut } from 'shared/hooks/useAxios';

export function useUpdateVideo(
    
){
    //Hook
    const { response, setParams } = useAxiosPut<null, REQ_PUT_LASTEDIT>('/db/video/lastEdit', true, null);

    const updateLastEdit = ( videoId : string ) => {
        setParams({ videoId : videoId });
    }
    
    return { updateLastEdit }
}