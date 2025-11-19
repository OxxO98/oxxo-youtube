import { useEffect, useState } from 'react';

import { useAxiosGet } from 'hooks/AxiosHook';

//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';

function useHukumuList( videoId : string ){

    //Redux
    const { selectedBun, hukumuData } = useSelector((state : RootState) => state.selection);

    //State  
    const [hukumuList, setHukumuList] = useState<Array<HukumuList> | null>(null);
  
    //Hook  
    const {response, setParams, fetch} = useAxiosGet<RES_GET_LIST_HUKUMU, REQ_GET_LIST_HUKUMU>('/db/list/hukumu', true, null);
  
    useEffect( () => {
        if(hukumuData !== null){
            setParams({ 
                videoId : videoId,
                jaBId : selectedBun, startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
                hyouki : hukumuData.hyouki 
            });
        }
        else{
            setHukumuList(null);
        }
    }, [hukumuData, setParams, videoId, selectedBun]);
  
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