import { useCallback, useRef } from 'react';

function useBunRefetch( fetchInHR : () => void ){
    const bIdRef = useRef<BIdRef>([]);

    const refetchAll = useCallback( () => {
        for(let key in bIdRef.current ){
            let fetchBUN = bIdRef.current[key]?.fetchBun;
            let fetchHUKUMU = bIdRef.current[key]?.fetchHukumu;
            let fetchTL = bIdRef.current[key]?.fetchTL;

            if(fetchBUN !== null && fetchBUN !== undefined){
                fetchBUN();
            }
            if(fetchHUKUMU !== null && fetchHUKUMU !== undefined){
                fetchHUKUMU();
            }
            if(fetchTL !== null && fetchTL !== undefined){
                fetchTL();
            }
        }
    }, [])

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
        let fetchHUKUMU = bIdRef.current[key]?.fetchHukumu;
        let fetchTL = bIdRef.current[key]?.fetchTL;

        if(fetchBUN !== null && fetchBUN !== undefined){
            fetchBUN();
        }
        if(fetchHUKUMU !== null && fetchHUKUMU !== undefined){
            fetchHUKUMU();
        }
        if(fetchTL !== null && fetchTL !== undefined){
            fetchTL();
        }
        fetchInHR();
    }, [refetchAll, fetchInHR])

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