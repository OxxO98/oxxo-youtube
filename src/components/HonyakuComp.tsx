import React, { useEffect, useState, useContext, RefObject, useRef } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Context
import { VideoContext } from 'contexts/VideoContext';

import { useAxiosGet, useAxiosPost, useAxiosPut, useAxiosDelete } from 'hooks/AxiosHook';
import { useJaText } from 'hooks/JaTextHook'

import { Select, Button, Input, Flex } from 'antd'
const { TextArea } = Input;

interface HonyakuCompProps {
    ytBId : ytBId;
    clearEdit : () => void;
    bIdRef : RefObject<BIdRef>;
}
interface HonyakuTLDropDownProps {
    ytBId : ytBId;
    koBun : koBun;
    koList : Array<koBun>;
    fetch : () => void;
}

interface HonaykuInputProps {
    value : string;
    handleChange : (e : React.ChangeEvent<HTMLTextAreaElement>) => void;
}

interface HonyakuControllerProps {
    ytBId : ytBId;
    translates : RES_GET_TRANSLATE;
    value : string;
    clearEdit : () => void;
    fetch : () => void;
}

interface HonyakuRepresentiveProps {
    ytBId : ytBId;
    handleSelect : (jaBId : jaBId) => void;
    bIdRef : RefObject<BIdRef>;
}

const HonyakuComp = ({ ytBId, clearEdit, bIdRef } : HonyakuCompProps ) => {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [value, setValue] = useState<string>('');
    const [translates, setTranslates] = useState<RES_GET_TRANSLATE | null>(null);

    const { response, setParams, fetch } = useAxiosGet<RES_GET_TRANSLATE, REQ_GET_TRANSLATE>('/db/translate', false, { videoId : videoId, ytBId : ytBId });

    const handleChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
    }

    const handleFillKoText = ( str : string ) => {
        setValue( str );
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            setTranslates(res.data);

            if( bIdRef !== null && res.data !== null && res.data.koBun !== undefined && res.data.koBun !== null ){
                bIdRef.current['bId'+res.data.jaBun.jaBId] = {
                    ...bIdRef.current['bId'+res.data.jaBun.jaBId],
                    fetchTL : fetch,
                    koText : res.data.koBun.koText
                };
            }
            if( res.data.koBun !== null && res.data.koBun !== undefined){
                handleFillKoText(res.data.koBun.koText);
            }
        }
    }, [response, bIdRef, fetch])

    useEffect( () => {
        setParams({ videoId : videoId, ytBId : ytBId });
    }, [setParams, videoId, ytBId])

    return(
        <div>
            {
                translates && 
                <>
                    {
                        (translates.koBun !== null && translates.koList !== null) &&
                            <HonyakuTLDropDown ytBId={ytBId} koBun={translates.koBun} koList={translates.koList} fetch={fetch}/>
                    }
                    <HonaykuInput value={value} handleChange={handleChange}/>
                    <HonyakuController ytBId={ytBId} translates={translates} value={value} clearEdit={clearEdit} fetch={fetch}/>
                </>
            }
        </div>
    )
}

const HonyakuTLDropDown = ({ ytBId, koBun, koList, fetch } : HonyakuTLDropDownProps) => {
    //Context
    const { videoId } = useContext(VideoContext);

    //Hook
    const { response, setParams } = useAxiosPut<null, REQ_PUT_TRANSLATE_REP>('/db/translate/representive', true, null );

    const handleChange = (value: string) => {
        setParams({ videoId : videoId, ytBId : ytBId, koBId : value });
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            fetch();
        }
    }, [response, fetch])

    return(
        <>
        {
            koList !== null && 
            <Select
                defaultValue={koBun.koText}
                style={{ width: '100%' }}
                onChange={handleChange}
                options={
                    koList?.map( (v : koBun) => {
                        return { value : v.koBId, label : v.koText }
                    })
                }
            />
        }
        </>
    )
}

const HonaykuInput = ({ value, handleChange } : HonaykuInputProps ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFocus = (e : React.FocusEvent<HTMLTextAreaElement>) => {
        e.target.selectionStart = e.target.value.length;
    }

    useEffect( () => {
        if(textareaRef.current !== null){
            textareaRef.current.focus();
        }
    }, [])

    return(
        <TextArea id="inputHonyaku" style={{ marginBottom : '8px'}} value={value} onChange={handleChange} autoComplete='off' ref={textareaRef} onFocus={handleFocus}/>
    )
}

const HonyakuController = ({ ytBId, translates, value, clearEdit, fetch, ...props } : HonyakuControllerProps) => {
    
    //i18n
    const { t } = useTranslation('HonyakuController');
        
    //Context
    const { videoId } = useContext(VideoContext);
    
    const { replaceSpecial } = useJaText();

    const { response : resInsert, setParams : setParamsInsert, loading : loadingInsert } = useAxiosPost<null, REQ_POST_TRANSLATE>('/db/translate', true, null );
    const { response : resDelete, setParams : setParamsDelete} = useAxiosDelete<null, REQ_DELETE_TRANSLATE>('/db/translate', true, null );
    const { response : resUpdate, setParams : setParamsUpdate, loading : loadingUpdate } = useAxiosPut<null, REQ_PUT_TRANSLATE>('/db/translate', true, null );

    const postHonyaku = () => {
        let regValue = replaceSpecial(value);

        setParamsInsert({ videoId : videoId, ytBId : ytBId, value : regValue });
    }

    const deleteHonyaku = () => {
        if(translates.koBun !== null){
            let koBId = translates.koBun.koBId;

            setParamsDelete({ videoId : videoId, ytBId : ytBId, koBId : koBId });
        }
    }

    const modifyHonyaku = () => {
        let regValue = replaceSpecial(value);

        setParamsUpdate({ videoId : videoId, ytBId : ytBId, value : regValue });
    }
    
    useHotkeys('ctrl+enter', () => {
        if( loadingInsert === true || loadingUpdate === true ){ return }
        if( value === '' ){ return }
        if( translates.koBun !== null && translates.koBun.koText !== value ){
            modifyHonyaku();
        }
        else{
            postHonyaku();
        }
    }, { enableOnFormTags : true } )
    useHotkeys('shift+enter', () => { clearEdit() }, { enableOnFormTags : true } )

    useEffect( () => {
        if(resInsert || resDelete || resUpdate){
            fetch();
            clearEdit();
        }
    }, [resInsert, resDelete, resUpdate, fetch, clearEdit])

    return(
        <>
            <Flex justify='flex-end' align='center' gap={8}>
                {
                    translates.koBun !== null &&
                    <Button type='dashed' onClick={deleteHonyaku}>{t('BUTTON.DELETE')}</Button>
                }
                {
                    value !== '' &&
                    <Button onClick={()=>{postHonyaku()}}>{t('BUTTON.SAVE_NEW')}</Button>
                }
                {
                    translates.koBun !== null && translates.koBun.koText !== value &&
                    <Button onClick={modifyHonyaku}>{t('BUTTON.MODIFY')}</Button>
                }
                <Button type="primary" onClick={clearEdit}>{t('BUTTON.CANCLE')}</Button>
            </Flex>
        </>
    )
}

//HonyakuComp 편집을 하지 않을 때, 현재 등록된 대표 번역만 보여주는 Comp
const HonyakuRepresentive = ({ ytBId, handleSelect, bIdRef } : HonyakuRepresentiveProps ) => {
    
    //i18n
    const { t } = useTranslation('HonyakuRepresentive');
    
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [ytBun, setYtBun] = useState<YTBun | null>(null);

    const { response, loading, setParams, fetch } = useAxiosGet<RES_GET_TRANSLATE_REP, REQ_GET_TRANSLATE_REP>('/db/translate/representive', true, null);
    
    useHotkeys('enter', () => handleSelect(ytBun?.jaBId!) )

    useEffect( () => {
        let res = response;
        if(res !== null){
            if( res.message === 'empty'){
                setYtBun(null);
            }
            else{
                setYtBun(res.data);
        
                if( bIdRef !== null && res.data !== null){
                    bIdRef.current['bId'+res.data.jaBId] = {
                        ...bIdRef.current['bId'+res.data.jaBId],
                        fetchTL : fetch,
                        koText : res.data.koText
                    };
                }
            }
        }
    }, [response, bIdRef, fetch])

    useEffect( () => {
        setParams({ videoId : videoId, ytBId : ytBId });
    }, [setParams, videoId, ytBId])

    return(
        <div>
            {
                ytBun !== null ?
                <span>{ytBun.koText}</span>
                :
                <span>{loading ? "　" : t('MESSAGE.EMPTY')}</span>
            }
            <Flex justify='right'>
                <Button onClick={() => handleSelect(ytBun?.jaBId!)}>{t('BUTTON.MODIFY')}</Button>
            </Flex>
        </div>
    )
}

export { HonyakuComp, HonyakuRepresentive };
