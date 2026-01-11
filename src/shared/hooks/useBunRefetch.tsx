import { useCallback, useRef } from 'react';

import { useAppDispatch, refetchActions } from 'shared/store';
const { setRefetchChecking } = refetchActions

/**
 * 문장 Refetch를 위한 Hook
 * 
 * @returns bIdRef, refetchHandles
 */
function useBunRefetch(){
    const bIdRef = useRef<BIdRef>([]);

    const dispatch = useAppDispatch();

    /**
     * 전체 Refetch
     */
    const refetchAll = useCallback( () => {
        for(let key in bIdRef.current ){
            let fetchBUN = bIdRef.current[key]?.fetchBun;
            let fetchTL = bIdRef.current[key]?.fetchTL;

            if(fetchBUN !== null && fetchBUN !== undefined){
                fetchBUN();
            }
            if(fetchTL !== null && fetchTL !== undefined){
                fetchTL();
            }
        }
        dispatch( setRefetchChecking() )
    }, [])

    /**
     * 특정 bId Refetch
     * 
     * @param bId 문장 ID
     * @param [prop] 'all'일 경우 refetchAll
     */
    const refetch = useCallback( (bId : string, ...props : any[]) => {
        if(props[0] !== null && props[0] === 'all'){
            refetchAll();
            return;
        }

        if(bIdRef.current === null){
            return;
        }
        
        let key : string = 'bId'.concat(bId.toString());

        let fetchBUN = bIdRef.current[key]?.fetchBun;
        let fetchTL = bIdRef.current[key]?.fetchTL;

        if(fetchBUN !== null && fetchBUN !== undefined){
            fetchBUN();
        }
        if(fetchTL !== null && fetchTL !== undefined){
            fetchTL();
        }
        dispatch( setRefetchChecking() )

    }, [refetchAll])

    /**
     * bIdRef 리셋
     */
    const resetList = () => {
        bIdRef.current = [];
    }

    const refetchHandles : RefetchHandles = {
        bId : refetch,
        reset : resetList,
        refetch : refetch,
        refetchAll : refetchAll,
        resetList : resetList
    }

    return { bIdRef, refetchHandles }
}

export { useBunRefetch }