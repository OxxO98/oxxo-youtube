import React, { useEffect, useState, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//api
import { useDivide } from '../api/useDivide';

//Redux
import { useAppDispatch, reactPlayerActions } from 'shared/store';

//CSS@antD
import { Input, Button, Flex, Modal, Card, Tooltip, InputRef } from 'antd';
import { SplitCellsOutlined } from '@ant-design/icons'
import { VideoContext } from 'shared/contexts/VideoContext';

//Redux
const { clear } = reactPlayerActions;

interface BunkatsuTimelineCompProps {
    ytb : RES_TIMELINE;
    critTime : number;
    refetchHandles : RefetchHandles;
    cancelEdit : () => void;
}

export const BunkatsuTimelineComp = ({ ytb, critTime, refetchHandles, cancelEdit } : BunkatsuTimelineCompProps ) => {

    //i18n
    const { t } = useTranslation('BunkatsuTimelineComp');

    //Context
    const { videoId } = useContext(VideoContext);
    
    const inputRef = useRef<InputRef>(null);

    const dispatch = useAppDispatch();

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputs, setInputs] = useState({
        jaText : '',
        koText : ''
    })

    const [hukumuDatas, setHukumuDatas] = useState<HukumuData[] | null>(null);

    //Hook
    const { response : resHukumu, setParams : setParamsHukumu } = useAxiosGet<RES_GET_HUKUMU, REQ_GET_HUKUMU>('/db/hukumu', true, null);

    const { bunkatsuBun } = useDivide( videoId, refetchHandles, cancelEdit );

    //Handle
    const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setInputs(prevState => ({
            ...prevState,
            [e.target.name] : e.target.value,
        }));
    }
    const showModal = () => {
        setIsModalOpen(true);
        if( ytb.jaBId !== null ){
            setParamsHukumu({ jaBId : ytb.jaBId });
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleOk = () => {
        bunkatsuBun( inputs, ytb, critTime );
        setIsModalOpen(false);
        dispatch( clear() );
    };

    //HotKeys
    const _splitedJaText = inputs.jaText.split('/');
    const _splitedKoText = inputs.koText.split('/');
    const _isOk = _splitedJaText.length === 2 && _splitedKoText.length === 2 && hukumuDatas !== null && hukumuDatas.filter( (v) => v.startOffset < _splitedJaText[0].length && _splitedJaText[0].length < v.endOffset ).length === 0;

    useHotkeys('ctrl+shift+e, ctrl+q', () => showModal(), { enableOnFormTags : true, enabled : !isModalOpen, preventDefault : true, useKey: false }, [isModalOpen] )
    
    const ref = useHotkeys<HTMLDivElement>('ctrl+enter', () => handleOk(), { enableOnFormTags : true, enabled : isModalOpen && _isOk }, [isModalOpen, _isOk] )
    useHotkeys('shift+enter', () => { handleCancel(); inputRef.current?.blur() }, { enableOnFormTags : true, enabled : isModalOpen }, [isModalOpen] )

    useHotkeys('esc', () => { inputRef.current?.blur(); }, { enableOnFormTags : true } );
    useHotkeys('tab', () => { inputRef.current?.focus(); }, { enableOnFormTags : false } );

    //Effect
    useEffect( () => {
        let res = resHukumu;
        if( res !== null ){
            setHukumuDatas(res.data);
        }
    }, [resHukumu])

    useEffect( () => {
        setInputs({
            jaText : ytb.jaText ?? '/',
            koText : ytb.koText ?? '/'
        })
    }, [ytb])

    return(
        <>
            <Tooltip title={t('TOOLTIP.BUNKATSU')}>
                <Button onClick={showModal}>{t('BUTTON.TITLE')}<SplitCellsOutlined /></Button>
            </Tooltip>
            
            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Tooltip title={t('TOOLTIP.CTRL_ENTER')}>
                        <Button type='primary' disabled={!_isOk} onClick={handleOk}>{t('BUTTON.DONE')}</Button>
                    </Tooltip>,
                    <Tooltip title={t('TOOLTIP.SHIFT_ENTER')}>
                        <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                    </Tooltip>
                ]}
                panelRef={ref}
                destroyOnHidden={true}
            >
                <div>{t('CONTENTS.0')}</div>
                <Input value={inputs.jaText} name='jaText' onChange={handleInputChange} ref={inputRef}/>
                <Input value={inputs.koText} name='koText' onChange={handleInputChange}/>
                {
                    _isOk &&
                    <>
                        <div>{_splitedJaText[0]}</div>
                        <div>{_splitedKoText[0]}</div>
                        <Flex gap={16}>
                        {
                            hukumuDatas !== null && hukumuDatas.filter( (v) => v.endOffset <= _splitedJaText[0].length ).map( (v) => 
                                <Card>
                                    <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>
                                </Card>
                            )
                        }
                        </Flex>
                        <div>{_splitedJaText[1]}</div>
                        <div>{_splitedKoText[1]}</div>
                        <Flex gap={16}>
                        {
                            hukumuDatas !== null && hukumuDatas.filter( (v) => v.startOffset >= _splitedJaText[0].length ).map( (v) => 
                                <Card>
                                    <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>
                                </Card>
                            )
                        }
                        </Flex>
                    </>
                }
            </Modal>
        </>
    )
}