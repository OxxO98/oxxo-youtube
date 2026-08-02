import { useEffect, useState } from 'react';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

export function useGetVideoLang(){
    const [lang, setLang] = useState<'ja' | 'ko'>('ja');
    
    const { response, loading, setParams } = useAxiosGet<RES_GET_VIDEO_LANG, REQ_GET_VIDEO_LANG>('/db/video/lang', true, null);

    const getVideoLang = ( videoId : string ) => {
        setParams({ videoId : videoId })
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            if( res.data.lang !== null ){
                setLang(res.data.lang);
            }
        }
    }, [response])

    const direction : TranslationDirection = lang === 'ja' ? 'ja-ko' : 'ko-ja'

    return { lang, setLang, direction, loading, getVideoLang }
}