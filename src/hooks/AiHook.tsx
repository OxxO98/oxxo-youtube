import { useEffect, useState, useRef } from 'react';

import { useAxiosGet, useAxiosPost } from './AxiosHook';
import { useJaText } from './JaTextHook';

interface TranscriptOption {
    reset? : 'true' | 'false';
    lang? : lang;
    offset? : OffsetObj;
}

interface ChatHistory {
    user : string;
    response : string;
}

interface RES_CAPTION {
    startTime : number;
    endTime : number;
    text : string;
}

function useTranscript(){
    const [transcriptText, setTranscriptText] = useState<string>('');

    const { response, loading, setParams } = useAxiosGet<RES_GET_TRANSCRIPT, REQ_GET_TRANSCRIPT>('/ai/transcript', true, null);
    const { response : resPost, loading : loadingPost, setParams : setParamsPost } = useAxiosPost<null, REQ_POST_TRANSCRIPT_TO_BUNS>('/db/transcriptToBuns', true, null);
    
    const handleTranscript = ( _videoId : string, _reset? : boolean, _lang? : lang, _offset? : OffsetObj ) => {
        let option : TranscriptOption = {};
        if( _reset !== undefined ){ option.reset = _reset ? 'true' : 'false' }
        if( _lang !== undefined ){ option.lang = _lang }
        if( _offset !== undefined ){ option.offset = _offset }

        if( loading === true ){ return }

        setParams({ videoId : _videoId, ...option });
    }

    const postTranscript = ( _videoId : string ) => {
        setParamsPost({ videoId : _videoId });
    }

    useEffect( () => {
        if(response !== null){
            let res = response;

            setTranscriptText(res.data);
        }
    }, [response])

    //loading의 initial은 true
    const state = { 
        transcript : { loading : loading, done : response !== null },
        post : { loading : loadingPost, done : resPost !== null }
    }

    return { transcriptText, handleTranscript, postTranscript, state }
}

function useChat(){
    const [history, setHistory] = useState<ChatHistory[]>([]);
    const [AImessage, setAIMessage] = useState<string>('');
    const [userMessage, setUserMessage] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);

    const evtSource = useRef<EventSource>(null);

    const { convertObjKey } = useJaText();

    const getContext = ( _user : string, _AI : string ) => {
        let _history = [
            ...history,
            {
                user : _user,
                response : _AI
            }
        ]
        let _context = _history.map( (v) => {
            return [
                {
                    role : 'user',
                    content : v.user
                },
                {
                    role : 'assistant',
                    content : v.response
                }
            ]
        }).flat();

        let _contextObj = _history.length === 0 ? null : convertObjKey(_context);

        let _contextMessage = _contextObj === null ? '' : `&context=${JSON.stringify(_contextObj)}`;

        return _contextMessage;
    }

    const handleChat = (_message : string) => {

        let _context = '';
        if( userMessage !== '' && AImessage !== '' ){
            setHistory( (prevState) => ([
                ...prevState,
                {
                    user : userMessage,
                    response : AImessage
                }
            ]));
            _context = getContext(userMessage, AImessage);
            setUserMessage('');
            setAIMessage('');
        }

        evtSource.current = new EventSource(`http://localhost:5000/ai/chat?message=${_message}${_context}`);
        setLoading(true);
        
        evtSource.current.onopen = () => {
            console.log('연결')
            setUserMessage(_message);
        }

        evtSource.current.onmessage = (e) =>  {
            setAIMessage( (prevState) => prevState.concat( e.data.replaceAll('@@@@', '\n') ) );
        };

        evtSource.current.onerror = (e : any ) => {
            if( evtSource.current === null ){ return }

            evtSource.current.close();
            setLoading(false);

            if( e.error ){
                console.log('에러')
            }
            if(e.target.readyState === EventSource.CLOSED){
                console.log('종료')
            }
        }
    }  
    
    const cancelChat = () => {
        if( evtSource.current === null ){ return }
            
        evtSource.current.close();
        setLoading(false);
    }

    return { AImessage, userMessage, handleChat, cancelChat, loading, history };
}

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
            setCaptionData(res.data);
        }
    }, [response])

    const state = {
        caption : { loading : loading, done : response !== null }
    }

    return { captionData, handleCaption, postCaption, state }
}

export { useTranscript, useChat, useCaptionData }