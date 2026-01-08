import { useEffect } from 'react'

//Hook
import { useAxiosPut } from 'shared/hooks/useAxios';

//Redux
import { useAppSelector } from 'shared/store';

export function useUpdateTimelineTime(
    videoId : string,
    refetchTimeline : () => void,
    cancelEdit : () => void,
    refetchAll : () => void
){
    //Redux
    const { startTime, endTime } = useAppSelector((state) => state.reactPlayer)
    
    const { response, setParams } = useAxiosPut<null, REQ_PUT_BUN_TIME>('/db/bun/time', true, null);

    const updateYTBunTime = ( editYtbId : string | null ) => {
        if(editYtbId === null) return;
        if(startTime === null || endTime === null ) return;

        setParams({
            videoId : videoId,
            ytBId : editYtbId, 
            startTime : startTime, endTime : endTime
        });
    }
    
    useEffect( () => {
        let res = response;
        if(res !== null){
            cancelEdit();
            refetchTimeline();
            refetchAll();
        }
    }, [response, cancelEdit, refetchTimeline, refetchAll])

    return { updateYTBunTime }
}