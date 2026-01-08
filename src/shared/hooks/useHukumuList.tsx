import { useEffect, useState } from 'react';

import { useAxiosGet } from 'shared/hooks/useAxios';

//Redux
import { useAppSelector } from 'shared/store';

function useHukumuList( videoId : string ){

    //Redux
    const { selectedBun, hukumuData, hukumuCheckLoading } = useAppSelector((state) => state.selection);

    //State  
    const [hukumuList, setHukumuList] = useState<Array<HukumuList> | null>(null);
  
    //Hook  
    const {response, setParams, fetch} = useAxiosGet<RES_GET_LIST_HUKUMU, REQ_GET_LIST_HUKUMU>('/db/list/hukumu', true, null);
  
    useEffect( () => {
        if(hukumuData !== null && hukumuCheckLoading === false ){
            setParams({ 
                videoId : videoId,
                jaBId : selectedBun, startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
                hyouki : hukumuData.hyouki 
            });
        }
        else{
            setHukumuList(null);
        }
    }, [hukumuData, setParams, videoId, selectedBun, hukumuCheckLoading]);
  
    useEffect( () => {
        let res = response;
  
        if(res !== null){
            if(res.data.length === 0){
                setHukumuList(null);
            }
            else{
                setHukumuList(res.data);
            }
        }
        else{
            setHukumuList(null);
        }
    }, [response])
  
    return { hukumuList, fetch }
  }

  export { useHukumuList }