import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';
import { useJaText } from 'shared/lib/useJaText';
import { useDebounceEffect } from 'shared/hooks/useDebounceEffect';

//entities
import { Bun } from 'entities/Bun/index';
import { ComplexText } from 'entities/ComplexText/index';

//CSS@antD
import { Input, Button, Flex, Modal, Card, Tooltip, InputRef } from 'antd';
import { useUpdateHukumuBun } from '../api/useUpdateHukumuBun';

interface UpdateBunJaTextModalCompProps {
    jaBId : string;
    jaText : string;
    defaultValue : string; 
    refetchHandles? : RefetchHandles;
    cancelEdit? : () => void;
}

export const UpdateBunJaTextModalComp = ({ jaBId, jaText, defaultValue, refetchHandles, cancelEdit } : UpdateBunJaTextModalCompProps ) => {

    //i18n
    const { t } = useTranslation('UpdateBunJaTextModalComp');

    //Context
    const inputRef = useRef<InputRef>(null);

    //State
    const [newJaText, setNewJaText] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hukumuData, setHukumuData] = useState<HukumuData[] | null>(null);

    const [searchedList, setSearchedList] = useState<tracedHukumu[] | null>(null);
    const [modifiedList, setModifiedList] = useState<tracedHukumu[] | null>(null);
    const [deletedList, setDeletedList] = useState<tracedHukumu[] | null>(null);

    //Hook
    const { traceHukumu } = useJaText();

    const { response, setParams } = useAxiosGet<RES_GET_HUKUMU, REQ_GET_HUKUMU>('/db/hukumu', true, null);

    const { modifyBun } = useUpdateHukumuBun( jaBId, setIsModalOpen, refetchHandles, cancelEdit );

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
        setParams({ jaBId : jaBId });
        setNewJaText(defaultValue);
        setIsModalOpen(true);
    };
    
    const handleOk = () => {
        modifyBun(modifiedList, deletedList, hukumuData, newJaText);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const getList = useCallback( () => {
        if(hukumuData === null){ return }

        let { trace } = traceHukumu(hukumuData, jaText, newJaText);

        let searched = trace.filter( (v) => v.tag === 'searched' );
        let modified = trace.filter( (v) => v.tag === 'modified' );
        let deleted = trace.filter( (v) => v.tag === 'deleted' );

        setSearchedList(searched);
        setModifiedList(modified);
        setDeletedList(deleted);
    }, [hukumuData, newJaText, traceHukumu, jaText]);


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
                <Bun bId={jaBId}/>
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