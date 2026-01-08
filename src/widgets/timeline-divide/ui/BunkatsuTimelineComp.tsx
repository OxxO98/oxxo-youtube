import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Hook
import { useAxiosGet, useAxiosPut } from 'shared/hooks/useAxios';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//CSS@antD
import { Input, Button, Flex, Modal, Card, Tooltip } from 'antd';
import { SplitCellsOutlined } from '@ant-design/icons'
import { VideoContext } from 'shared/contexts/VideoContext';
import { useDivide } from '../api/useDivide';

interface BunkatsuTimelineCompProps {
    ytb : RES_TIMELINE;
    critTime : number;
    refetchTimeline : () => void;
    refetchHandles : RefetchHandles;
    cancelEdit : () => void;
}

export const BunkatsuTimelineComp = ({ ytb, critTime, refetchTimeline, refetchHandles, cancelEdit } : BunkatsuTimelineCompProps ) => {

    //i18n
    const { t } = useTranslation('BunkatsuTimelineComp');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputs, setInputs] = useState({
        jaText : '',
        koText : ''
    })

    const [hukumuDatas, setHukumuDatas] = useState<Array<HukumuData> | null>(null);

    //Hook
    const { response : resHukumu, setParams : setParamsHukumu } = useAxiosGet<RES_GET_HUKUMU, REQ_GET_HUKUMU>('/db/hukumu', true, null);

    const { bunkatsuBun } = useDivide( videoId, refetchTimeline, refetchHandles, cancelEdit );

    //Handle
    const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setInputs(prevState => ({
            ...prevState,
            [e.target.name] : e.target.value,
        }));
    }
    const showModal = () => {
        setIsModalOpen(true);
        setParamsHukumu({ jaBId : ytb.jaBId });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleOk = () => {
        bunkatsuBun( inputs, ytb, critTime );
        setIsModalOpen(false);
    };

    //HotKeys
    const _splitedJaText = inputs.jaText.split('/');
    const _splitedKoText = inputs.koText.split('/');
    const _isOk = _splitedJaText.length === 2 && _splitedKoText.length === 2 && hukumuDatas !== null && hukumuDatas.filter( (v) => v.startOffset < _splitedJaText[0].length && _splitedJaText[0].length < v.endOffset ).length === 0;

    useHotkeys('ctrl+shift+e, ctrl+q', () => showModal(), { enableOnFormTags : true, enabled : !isModalOpen, preventDefault : true }, [isModalOpen] )
    
    const ref = useHotkeys<HTMLDivElement>('ctrl+enter', () => handleOk(), { enableOnFormTags : true, enabled : isModalOpen && _isOk }, [isModalOpen, _isOk] )
    useHotkeys('shift+enter', () => handleCancel(), { enableOnFormTags : true, enabled : isModalOpen }, [isModalOpen] )

    //Effect
    useEffect( () => {
        let res = resHukumu;
        if( res !== null ){
            setHukumuDatas(res.data);
        }
    }, [resHukumu])

    useEffect( () => {
        setInputs({
            jaText : ytb.jaText,
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
                <Input value={inputs.jaText} name='jaText' onChange={handleInputChange}/>
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