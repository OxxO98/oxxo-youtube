import { useEffect, useState } from 'react';

import { useAxiosGet } from 'shared/hooks/useAxios';
import { useJaText } from 'shared/lib/useJaText';

//Redux
import { useAppSelector } from 'shared/store';

/**
 * 선택된 selection과 정확히 일치하는 hukumu를 검색
 * videoId와는 상관 없이 전체 DB에서 검색
 * 
 * @returns 
 */
function useOsusumeList(){
    //Redux
    const { selection, hukumuData, hukumuCheckLoading } = useAppSelector((state) => state.selection);

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
        if(selection !== null && selection !== '' && hukumuData === null && hukumuCheckLoading === false ){
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
    }, [selection, hukumuData, checkKatachi, setParams, hukumuCheckLoading]);


    return { osusumeList, fetch }
}

export { useOsusumeList }