import { useEffect } from 'react';

//Redux
import { useAppDispatch, reactPlayerActions } from 'shared/store';

//Hook
import { useAxiosPut } from 'shared/hooks/useAxios';

//Redux
const { clear } = reactPlayerActions;

export function useMerge(
    videoId : string,
    bunIds : RES_TIMELINE[] | null,
    refetchTimeline : () => void,
    refetchHandles : RefetchHandles,
    cancelEdit : () => void
){
    const dispatch = useAppDispatch();

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
            dispatch( clear() );
        }
    }, [response, refetchTimeline, refetchHandles, cancelEdit])

    return { heigouBun }
}