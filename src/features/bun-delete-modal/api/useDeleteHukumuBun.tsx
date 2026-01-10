import { useEffect } from 'react';

import { useAxiosDelete } from 'shared/hooks/useAxios'

export function useDeleteHukumuBun(
    videoId : string,
    ytb : RES_TIMELINE,
    refetchTimeline : () => void,
    cancelEdit : () => void
){
    const { response, setParams } = useAxiosDelete<null, REQ_DELETE_HUKUMU_BUN>('/db/hukumu/bun', true, null);

    const deleteBun = () => {
        setParams({ videoId : videoId, ytBId : ytb.ytBId, jaBId : ytb.jaBId })
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            refetchTimeline();
            cancelEdit();
        }
    }, [response, refetchTimeline, cancelEdit])

    return { deleteBun }
}