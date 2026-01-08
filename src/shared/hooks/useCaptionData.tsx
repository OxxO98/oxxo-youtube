import { useEffect, useState } from 'react';

import { useAxiosGet, useAxiosPost } from './useAxios';

function useCaptionData(){
    const [captionData, setCaptionData] = useState<Array<RES_CAPTION> | null>(null);
    
    const { response, loading, setParams } = useAxiosGet<RES_GET_CAPTION, REQ_GET_CAPTION>('/yts/caption', true, null);
    const { response : resPost, loading : loadingPost, setParams : setParamsPost } = useAxiosPost<null, REQ_POST_CAPTION_TO_BUNS>('/db/captionToBuns', true, null);

    const handleCaption = ( _videoId : string ) => {
        setParams({ videoId : _videoId });
    }

    const postCaption = ( _videoId : string ) => {
        setParamsPost({ videoId : _videoId });
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            if( res.message === 'empty' ){ setCaptionData([]); return; }
            setCaptionData(res.data.map( (v) => { return {...v, tag : 'caption'} }) );
        }
    }, [response])

    const state = {
        caption : { loading : loading, done : response !== null },
        post : { loading : loadingPost, done : resPost !== null }
    }

    return { captionData, handleCaption, postCaption, state }
}

export { useCaptionData }