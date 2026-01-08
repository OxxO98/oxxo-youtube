import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Hook
import { useAxiosGet, useAxiosPut } from 'shared/hooks/useAxios';
import { useJaText } from 'shared/lib/useJaText';
import { useDebounceEffect } from 'shared/hooks/useDebounceEffect';
import { useHuri } from 'shared/lib/useHuri';

//entities
import { Bun } from 'entities/Bun/index';
import { ComplexText } from 'entities/ComplexText/index';

//CSS@antD
import { Input, Button, Flex, Modal, Card, Tooltip, InputRef } from 'antd';

interface UpdateBunJaTextModalCompProps {
    ytb : RES_TIMELINE;
    defaultValue : string; 
    refetchHandles : RefetchHandles;
    refetchTimeline : () => void;
    cancelEdit : () => void;
}

export const UpdateBunJaTextModalComp = ({ ytb, defaultValue, refetchHandles, refetchTimeline, cancelEdit } : UpdateBunJaTextModalCompProps ) => {

    //i18n
    const { t } = useTranslation('UpdateBunJaTextModalComp');

    //Context
    const inputRef = useRef<InputRef>(null);

    //State
    const [newJaText, setNewJaText] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hukumuData, setHukumuData] = useState<Array<HukumuData> | null>(null);

    const [searchedList, setSearchedList] = useState<Array<tracedHukumu> | null>(null);
    const [modifiedList, setModifiedList] = useState<Array<tracedHukumu> | null>(null);
    const [deletedList, setDeletedList] = useState<Array<tracedHukumu> | null>(null);

    //Hook
    const { traceHukumu, convertObjKey, getHyoukiQuery, getYomiQuery } = useJaText();

    const { complexArr } = useHuri();

    const { response, setParams } = useAxiosGet<RES_GET_HUKUMU, REQ_GET_HUKUMU>('/db/hukumu', true, null);

    const { response : resUpdate, setParams : setParamsUpdate } = useAxiosPut<null, REQ_PUT_HUKUMU_BUN>('/db/hukumu/bun', true, null );

    //Handle
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        if(isModalOpen === true){
            setNewJaText(e.target.value);
        }
    }

    const handleFocus = (e : React.FocusEvent<HTMLInputElement>) => {
        e.target.selectionStart = e.target.value.length;
    }

    const showModal = () => {
        setParams({ jaBId : ytb.jaBId });
        setNewJaText(defaultValue);
        setIsModalOpen(true);
    };
    
    const handleOk = () => {
        modifyBun();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const modifyBun = () => {
        if( newJaText === '' ){ return }
        if( modifiedList === null || deletedList === null || hukumuData === null ){ 
            return;
        }

        let _modifiedList = modifiedList
            .map( (v) => {
                let textData = complexArr(v.find!.str, v.yomi, 0);
                let multiInputData = textData.map( (t) => {
                    return {
                        data : t.data,
                        inputBool : !(t.ruby === null || t.ruby === undefined)
                    }
                })
                let multiValue = textData.map( (t) => {
                    return t.ruby ?? ''
                })

                return {
                    ...v,
                    find : {
                        ...v.find,
                        hyouki : getHyoukiQuery(multiInputData),
                        yomi : getYomiQuery(multiInputData, multiValue)
                    }
                }
            });

        let modifiedObj = convertObjKey(_modifiedList);
        let deletedObj = convertObjKey(deletedList);

        setParamsUpdate({ jaBId : ytb.jaBId, jaText : newJaText, modifiedObj : modifiedObj, deletedObj : deletedObj })
    }

    const getList = useCallback( () => {
        if(hukumuData === null){ return }

        let { trace } = traceHukumu(hukumuData, ytb.jaText, newJaText);

        let searched = trace.filter( (v) => v.tag === 'searched' );
        let modified = trace.filter( (v) => v.tag === 'modified' );
        let deleted = trace.filter( (v) => v.tag === 'deleted' );

        setSearchedList(searched);
        setModifiedList(modified);
        setDeletedList(deleted);
    }, [hukumuData, newJaText, traceHukumu, ytb.jaText]);

    //HotKeys
    const loaded = isModalOpen && (modifiedList !== null && deletedList !== null && hukumuData !== null);

    useHotkeys('ctrl+enter', () => showModal(), { enableOnFormTags : true, enabled : !isModalOpen }, [isModalOpen, defaultValue] )
    
    const ref = useHotkeys<HTMLDivElement>('ctrl+enter', () => handleOk(), { enableOnFormTags : true, enabled : loaded }, [loaded] )
    useHotkeys('shift+enter', () => handleCancel(), { enableOnFormTags : true, enabled : isModalOpen }, [isModalOpen] )

    //Effect
    useDebounceEffect( () => getList(), 1000, [newJaText]);

    useEffect( () => {
        let res = response;
        if( res !== null ){
            setHukumuData(res.data);
        }
    }, [response])
    
    useEffect( () => {
        if(hukumuData !== null){
            getList();
        }
    }, [hukumuData, getList])

    useEffect( () => {
        if( resUpdate ){
            refetchHandles.refetch(ytb.jaBId)
            refetchTimeline();
            cancelEdit();
            setIsModalOpen(false);
        }
    }, [resUpdate, refetchTimeline, cancelEdit, refetchHandles, ytb.jaBId])

    useEffect( () => {
        if(inputRef.current !== null && isModalOpen === true){
            inputRef.current.focus();
        }
    }, [isModalOpen])

    return(
        <div>
            <Tooltip title={t('TOOLTIP.CTRL_ENTER')}>
                <Button onClick={showModal}>
                    {t('BUTTON.TITLE')}
                </Button>
            </Tooltip>

            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                keyboard={false}
                width={'80%'}
                footer={[
                    <Tooltip title={t('TOOLTIP.SHIFT_ENTER')}>
                        <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                    </Tooltip>,
                    <Tooltip title={t('TOOLTIP.CTRL_ENTER')}>
                        <Button loading={!loaded} type="primary" onClick={handleOk}>{t('BUTTON.DONE')}</Button>
                    </Tooltip>
                ]}
                panelRef={ref}
                destroyOnHidden={true}
            >
                <Bun bId={ytb.jaBId!}/>
                <Input value={newJaText} onChange={handleChange} ref={inputRef} onFocus={handleFocus}/>
                <div>{t('CONTENTS.0')}</div>
                <Flex gap={16}>
                {
                    modifiedList !== null &&
                    modifiedList.map( (v) => 
                        <Card>
                            <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>
                        </Card>
                    )
                }
                </Flex>
                <div>{t('CONTENTS.1')}</div>
                <Flex gap={16}>
                {
                    deletedList !== null &&
                    deletedList.map( (v) => 
                        <Card>
                            <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>
                        </Card>
                    )
                }
                </Flex>       
            </Modal>
        </div>
    )
}