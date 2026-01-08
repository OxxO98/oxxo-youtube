import React, { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

//ui
import { AutoLengthInput } from './AutoLengthInput';

//CSS@antD
import { Input } from 'antd';
import type { InputRef } from 'antd';

interface AutoMultiInputProps {
    multiInputData : Array<MultiInput>;
    multiValue : Array<string>;
    handleMultiChange : (e : React.ChangeEvent, index : number) => void;
    handleHighlight? : () => void;
}

export const AutoMultiInput = ({ multiInputData, multiValue, handleMultiChange, ...props } : AutoMultiInputProps ) => {

    //Context
    const inputRef = useRef<InputRef[] | null[]>([]);

    const focusFisrtInput = () => {
        let _index = multiInputData.findIndex( (v) => v.inputBool === true );
        inputRef.current[_index]?.focus()
    }
    
    //Hotkeys
    useHotkeys('backslash', () => focusFisrtInput(), { enableOnFormTags : false })

    return (
        <>
            {
                multiInputData.map( (v, index, arr) => {
                    if(v['inputBool'] === true){
                        return(
                            <AutoLengthInput key={'id'+index}>
                                <Input ref={(el) => { inputRef.current[index] = el; }} className="input dynamic" key={'id'+index} value={multiValue[index]} onChange={(e) => handleMultiChange(e, index)} onFocus={props?.handleHighlight} autoComplete='off'/>
                            </AutoLengthInput>
                        )
                    }
                    else{
                        return (
                            <span className="inputNasi" key={'id'+index} style={{ margin : index === 0 ? '0 4px 0 0' : '0 4px'}}>
                                {
                                    arr.length !== 1 ?
                                        v['data']
                                        :
                                        ''
                                }
                            </span>
                        )
                    }
                })
            }
        </>
    )
}