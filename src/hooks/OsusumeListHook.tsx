import { useEffect, useState } from 'react';

import { useAxiosGet } from 'hooks/AxiosHook';
import { useJaText } from 'hooks/JaTextHook';

//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';

function useOsusumeList(){
    //Redux
    const { selection, hukumuData } = useSelector((state : RootState) => state.selection);

    //State
    const [osusumeList, setOsusumeList] = useState<OsusumeList[] | null>(null); //Hyouki로 검색한 추천 HUKUMU 데이터

    //Hook
    const { response, setParams, fetch } = useAxiosGet<RES_GET_LIST_OSUSUME, REQ_GET_LIST_OSUSUME>('/db/list/osusume', true, null);

    const { checkKatachi } = useJaText();

    useEffect( () => {
        let res = response;
        if(res !== null){
            setOsusumeList(res.data);
        }
        else{
            setOsusumeList(null);
        }
    }, [response]);

    useEffect( () => {
        if(selection !== null && selection !== '' && hukumuData === null){
            //useJatext를 통해 일본어만 검색.
            let katachi = checkKatachi(selection);

            if(katachi !== null){
                setParams({
                    hyouki : selection
                });
            }
        }
        else{
            setOsusumeList(null);
        }
    }, [selection, hukumuData, checkKatachi, setParams]);


    return { osusumeList, fetch }
}

export { useOsusumeList }