import { useEffect } from 'react'

//Hook
import { useAxiosPut } from 'shared/hooks/useAxios';

//Redux
import { useAppSelector } from 'shared/store';

export function useUpdateTimelineTime(
    videoId : string,
    duration : number,
    refetchTimeline : () => void,
    cancelEdit : () => void
){
    //Redux
    const { startTime, endTime } = useAppSelector((state) => state.reactPlayer)
    
    const { response, setParams } = useAxiosPut<null, REQ_PUT_BUN_TIME>('/db/bun/time', true, null);

    const updateYTBunTime = ( editYtbId : string | null ) => {
        if(editYtbId === null) return;
        if(startTime === null || endTime === null ) return;
        if(endTime <= startTime) return;
        if(0 > startTime || startTime > duration) return;
        if(0 > endTime || endTime > duration) return;

        setParams({
            videoId : videoId,
            ytBId : editYtbId, 
            startTime : startTime, endTime : endTime
        });
    }
    
    useEffect( () => {
        let res = response;
        if(res !== null){
            if(res.message === 'success'){
                cancelEdit();
                refetchTimeline();
            }
        }
    }, [response, cancelEdit, refetchTimeline])

    return { updateYTBunTime }
}