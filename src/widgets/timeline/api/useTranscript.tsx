import { useEffect, useState } from 'react';

import { useAxiosGet, useAxiosPost } from 'shared/hooks/useAxios';

/**
 * node-whisper 라이브러리를 통해 오디오를 음성인식해 text로 변환하는 Hook
 * postTranscript의 경우 이를 DB에 저장할 수 있음
 * 
 * @returns 
 */
function useTranscript(){
    const [transcriptData, setTranscriptData] = useState<RES_TRANSCRIPT[] | null>(null);

    const { response, loading, setParams } = useAxiosGet<RES_GET_TRANSCRIPT, REQ_GET_TRANSCRIPT>('/ai/transcript', true, null);
    const { response : resPost, loading : loadingPost, setParams : setParamsPost } = useAxiosPost<null, REQ_POST_TRANSCRIPT_TO_BUNS>('/db/transcriptToBuns', true, null);
    
    const handleTranscript = ( _videoId : string, _reviseText? : string, _option? : TranscriptOption ) => {
        let option : TranscriptOption = {};
        if( _option?.reset !== undefined ){ option.reset = _option.reset }
        if( _option?.translate !== undefined ){ option.translate = _option.translate }
        if( _option?.prompt !== undefined ){ option.prompt = _option.prompt }
        if( _option?.lang !== undefined ){ option.lang = _option.lang }

        if( loading === true ){ return }

        setParams({ videoId : _videoId, reviseText : _reviseText ?? "", ...option });
    }

    const postTranscript = ( _videoId : string ) => {
        setParamsPost({ videoId : _videoId });
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            setTranscriptData(res.data.map( (v) => { return {...v, tag : 'transcript'} }));
        }
    }, [response])

    //loading의 initial은 true
    const state = { 
        transcript : { loading : loading, done : response !== null },
        post : { loading : loadingPost, done : resPost !== null }
    }

    return { transcriptData, handleTranscript, postTranscript, state }
}

export { useTranscript}