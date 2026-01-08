import { useEffect } from 'react';

//Hook
import { useAxiosPut } from 'shared/hooks/useAxios';

export function useMerge(
    videoId : string,
    bunIds : RES_TIMELINE[] | null,
    refetchTimeline : () => void,
    refetchHandles : RefetchHandles,
    cancelEdit : () => void
){
    const { response, setParams } = useAxiosPut<null, REQ_PUT_HEIGOU>('/db/bun/heigou', true, null);

    //Handle
    const heigouBun = ( ytb : RES_TIMELINE ) => {
        if( bunIds === null ){ return }

        let _index = bunIds.findIndex( (v) => v.ytBId === ytb.ytBId );
        if( _index === bunIds.length-1 ){ return }

        let _ytBId = bunIds[_index].ytBId;
        let _next = bunIds[_index+1].ytBId

        setParams({ videoId : videoId, ytBId : _ytBId, nextYtBId : _next })
    }
    
    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            refetchTimeline();
            refetchHandles.refetchAll();
            cancelEdit();
        }
    }, [response, refetchTimeline, refetchHandles, cancelEdit])

    return { heigouBun }
}