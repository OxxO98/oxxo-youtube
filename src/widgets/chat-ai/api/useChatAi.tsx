import { useState, useRef } from 'react';

import { useJaText } from 'shared/lib/useJaText';

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

export { useChat }