import React, { RefObject, useContext, useRef } from 'react'

//Context
import { VideoContext } from 'contexts/VideoContext';

//Hook
import { Input } from 'antd';
import type { InputRef } from 'antd';

interface VideoControlCompProps {
    handleKeyboard : ( e : React.KeyboardEvent<Element>) => void;
    inputKeyboard : RefObject<InputRef | null>;
}

const VideoControlComp = ( { handleKeyboard, inputKeyboard } : VideoControlCompProps ) => {

    return(
        <div style={{ margin : '4px 0' }}>
            <Input variant="filled" onKeyDown={handleKeyboard} ref={inputKeyboard} value=""/>
        </div>
    )
}

export { VideoControlComp }