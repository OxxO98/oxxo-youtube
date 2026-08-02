import React, { useEffect, useState, useContext, RefObject } from 'react';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

import { useAxiosGet } from 'shared/hooks/useAxios';

//ui
import { HonyakuController } from './HonyakuController';
import { HonyakuTLDropDown } from './HonyakuDropDown'; 
import { HonaykuInput } from './HonyakuInput';

interface HonyakuCompProps {
    ytBId : string;
    clearEdit : () => void;
    bIdRef : RefObject<BIdRef>;
}

export const HonyakuComp = ({ ytBId, clearEdit, bIdRef } : HonyakuCompProps ) => {
    //Context
    const { videoId, translationDirection } = useContext(VideoContext);

    //State
    const [value, setValue] = useState<string>('');
    const [translates, setTranslates] = useState<RES_GET_TRANSLATE | null>(null);

    const { response, setParams, fetch } = useAxiosGet<RES_GET_TRANSLATE, REQ_GET_TRANSLATE>('/db/bun/translate', false, { videoId : videoId, ytBId : ytBId });
    const { response : resAuto, setParams : setParamsAuto } = useAxiosGet<RES_GET_TRANSLATE_AUTO, REQ_GET_TRANSLATE_AUTO>('/db/bun/translate/auto', true, null);

    const handleChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
    }

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            setTranslates(res.data);

            if( bIdRef !== null && res.data !== null && 
                res.data.koBun !== undefined && res.data.koBun !== null &&
                res.data.jaBun !== undefined && res.data.jaBun !== null
            ){
                bIdRef.current['bId'+res.data.jaBun.jaBId] = {
                    ...bIdRef.current['bId'+res.data.jaBun.jaBId],
                    fetchTL : fetch,
                    koText : res.data.koBun.koText
                };
            }
            if( translationDirection === 'ja-ko' ){
                if( res.data.koBun !== null && res.data.koBun !== undefined){
                    setValue(res.data.koBun.koText);
                }
                else if( res.data.jaBun !== null ){
                    setParamsAuto({ videoId : videoId, value : res.data.jaBun.jaText, translationDirection : translationDirection });
                }
            }
            else{
                if( res.data.jaBun !== null && res.data.jaBun !== undefined ){
                    setValue(res.data.jaBun.jaText);
                }
                else if( res.data.koBun !== null ){
                    setParamsAuto({ videoId : videoId, value : res.data.koBun.koText, translationDirection : translationDirection });
                }
            }
        }
    }, [response, bIdRef, fetch])

    useEffect( () => {
        let res = resAuto;
        if(res !== null){
            if(res.data !== ""){
                setValue(res.data);
            }
        }
    }, [resAuto])

    useEffect( () => {
        setParams({ videoId : videoId, ytBId : ytBId });
    }, [setParams, videoId, ytBId])

    return(
        <div>
            {
                translates && 
                <>
                    <HonyakuTLDropDown ytBId={ytBId} translates={translates} fetch={fetch}/>
                    <HonaykuInput value={value} handleChange={handleChange}/>
                    <HonyakuController ytBId={ytBId} translates={translates} value={value} clearEdit={clearEdit} fetch={fetch}/>
                </>
            }
        </div>
    )
}
