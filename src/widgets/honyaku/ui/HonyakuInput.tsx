import React, { useEffect, useRef } from 'react';

//CSS@Antd
import { Input, InputRef } from 'antd'
const { TextArea } = Input; 

interface HonaykuInputProps {
    value : string;
    handleChange : (e : React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const HonaykuInput = ({ value, handleChange } : HonaykuInputProps ) => {
    
    //Ref
    const textareaRef = useRef<InputRef>(null);

    //Handle
    const handleFocus = (e : React.FocusEvent<HTMLTextAreaElement>) => {
        e.target.selectionStart = e.target.value.length;
    }

    //Effect
    useEffect( () => {
        if(textareaRef.current !== null){
            textareaRef.current.focus();
        }
    }, [])

    return(
        <TextArea id="inputHonyaku" style={{ marginBottom : '8px'}} value={value} onChange={handleChange} autoComplete='off' ref={textareaRef} onFocus={handleFocus}/>
    )
}