import React, { useEffect, useState, useContext, RefObject, useRef } from 'react';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

import { useAxiosGet } from 'shared/hooks/useAxios';

//ui
import { HonyakuController } from './HonyakuController';
import { HonyakuTLDropDown } from './HonyakuDropDown'; 
import { HonaykuInput } from './HonyakuInput';

interface HonyakuCompProps {
    ytBId : ytBId;
    clearEdit : () => void;
    bIdRef : RefObject<BIdRef>;
}

export const HonyakuComp = ({ ytBId, clearEdit, bIdRef } : HonyakuCompProps ) => {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [value, setValue] = useState<string>('');
    const [translates, setTranslates] = useState<RES_GET_TRANSLATE | null>(null);

    const { response, setParams, fetch } = useAxiosGet<RES_GET_TRANSLATE, REQ_GET_TRANSLATE>('/db/translate', false, { videoId : videoId, ytBId : ytBId });

    const handleChange = (e : React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
    }

    //Effect
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
                setValue(res.data.koBun.koText);
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
