import { useEffect, useRef } from 'react';

//type
import type { auto_db_moreTId } from '../type';

import { useAxiosPost } from 'shared/hooks/useAxios';

export const useAutoCommit = ( videoId : string, refetchTangoList : () => void, refetchTimeline : () => void ) => {
    const commitData = useRef<ObjKey>(null);
    const index = useRef<number>(0);
    const moreTIdList = useRef<(auto_db_moreTId[])[]>([]);

    const { response, setParams } = useAxiosPost<null, REQ_POST_AUTO_DB>('/db/auto', true, null);

    const handleAutoCommit = () => {
        if( commitData.current === null ){ return }
        setParams({ videoId : videoId, change : commitData.current });
    }

    useEffect( () => {
        let res = response;
        if( res !== null ){
            refetchTangoList();
            refetchTimeline();
        }
    }, [response])

    return { commitData, index, handleAutoCommit, moreTIdList }
}