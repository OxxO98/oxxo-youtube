import { useEffect } from 'react';

import { useAxiosDelete } from 'shared/hooks/useAxios'

//Redux
import { useAppDispatch, timelineActions } from 'shared/store';
const { requestTimelineRefetch } = timelineActions;

export function useDeleteHukumuBun(
    videoId : string,
    ytBId : string,
    cancelEdit? : () => void
){
    const dispatch = useAppDispatch();

    const { response, setParams } = useAxiosDelete<null, REQ_DELETE_BUN>('/db/bun', true, null);

    const deleteBun = () => {
        setParams({ videoId : videoId, ytBId : ytBId })
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            dispatch( requestTimelineRefetch() );

            if( cancelEdit !== undefined ) cancelEdit();
        }
    }, [response, cancelEdit])

    return { deleteBun }
}