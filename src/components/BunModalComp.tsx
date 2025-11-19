import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Components
import Bun, { ComplexText } from 'components/Bun';

//Hook
import { useAxiosDelete, useAxiosGet, useAxiosPut } from 'hooks/AxiosHook';
import { useJaText } from 'hooks/JaTextHook';
import { useDebounceEffect } from 'hooks/OptimizationHook';
import { useHuri } from 'hooks/HuriHook';

//CSS@antD
import { Input, Button, Flex, Modal, Card } from 'antd';
import { SplitCellsOutlined, MergeCellsOutlined } from '@ant-design/icons'
import { VideoContext } from 'contexts/VideoContext';


interface UpdateBunJaTextModalCompProps {
    ytb : RES_TIMELINE;
    defaultValue : string; 
    refetchHandles : RefetchHandles;
    refetchTimeline : () => void;
    cancelEdit : () => void;
}

interface DeleteBunModalCompProps {
    ytb : RES_TIMELINE;
    refetchTimeline : () => void;
    cancelEdit : () => void;
}

interface HunkatsuTimelineCompProps {
    ytb : RES_TIMELINE;
    critTime : number;
    refetchTimeline : () => void;
    refetchHandles : RefetchHandles;
    cancelEdit : () => void;
}

interface HeigouTimelineCompProps {
    bunIds : Array<RES_TIMELINE> | null;
    ytb : RES_TIMELINE;
    refetchTimeline : () => void;
    refetchHandles : RefetchHandles;
    cancelEdit : () => void;
}

const UpdateBunJaTextModalComp = ({ ytb, defaultValue, refetchHandles, refetchTimeline, cancelEdit } : UpdateBunJaTextModalCompProps ) => {

    //i18n
    const { t } = useTranslation('UpdateBunJaTextModalComp');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [newJaText, setNewJaText] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hukumuData, setHukumuData] = useState<Array<HukumuData> | null>(null);

    const [searchedList, setSearchedList] = useState<Array<tracedHukumu> | null>(null);
    const [modifiedList, setModifiedList] = useState<Array<tracedHukumu> | null>(null);
    const [deletedList, setDeletedList] = useState<Array<tracedHukumu> | null>(null);

    //Hook
    const { traceHukumu, replaceSpecial, convertObjKey, getHyoukiQuery, getYomiQuery } = useJaText();

    const { complexArr } = useHuri();

    const { response, setParams } = useAxiosGet<RES_GET_HUKUMU, REQ_GET_HUKUMU>('/db/hukumu', true, null);

    const { response : resUpdate, setParams : setParamsUpdate } = useAxiosPut<null, REQ_PUT_HUKUMU_BUN>('/db/hukumu/bun', true, null );

    const { response : resUpdateJaText, setParams : setParamsUpdateJaText } = useAxiosPut<null, REQ_PUT_BUN_JATEXT>('/db/bun/jaText', true, null);

    //Handle
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setNewJaText(e.target.value);
    }

    const showModal = () => {
        setParams({ jaBId : ytb.jaBId });
        setNewJaText(defaultValue);
        setIsModalOpen(true);
    };
    
    const handleOk = () => {
        modifyBun();
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const modifyBun = () => {
        //hukumu 가 아예 없으면 수정이 안됨.
        if( newJaText === '' ){ return }
        if( modifiedList === null || deletedList === null ){ 
            if( hukumuData === null ){
                let jaText = replaceSpecial(newJaText);
                setParamsUpdateJaText({ videoId : videoId, ytBId : ytb.ytBId, jaText : jaText })
            }
            return;
        }

        let jaText = replaceSpecial(newJaText);

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

        setParamsUpdate({ jaBId : ytb.jaBId, jaText : jaText, modifiedObj : modifiedObj, deletedObj : deletedObj })
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

    useHotkeys('ctrl+enter', () => showModal(), { enableOnFormTags : true } )
    const ref = useHotkeys<HTMLDivElement>('enter', () => handleOk(), { enabled : isModalOpen }, [isModalOpen] )
    
    useEffect( () => {
        if(hukumuData !== null){
            getList();
        }
    }, [hukumuData, getList])

    useDebounceEffect( () => getList(), 1000, [newJaText]);

    useEffect( () => {
        let res = response;
        if( res !== null ){
            setHukumuData(res.data);
        }
    }, [response])

    useEffect( () => {
        if( resUpdate !== null || resUpdateJaText !== null){
            refetchHandles.refetch(ytb.jaBId);
            refetchTimeline();
            cancelEdit();
        }
    }, [resUpdate, resUpdateJaText, refetchHandles, ytb.jaBId, refetchTimeline, cancelEdit])


    return(
        <div>
            <Button onClick={showModal}>
                {t('BUTTON.TITLE')}
            </Button>

            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>,
                    <Button type="primary" onClick={handleOk}>{t('BUTTON.DONE')}</Button>
                ]}
                panelRef={ref}
            >
                <Bun bId={ytb.jaBId!}/>
                <Input value={newJaText} onChange={handleChange}/>
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

const DeleteBunModalComp = ({ ytb, refetchTimeline, cancelEdit } : DeleteBunModalCompProps ) => {

    //i18n
    const { t } = useTranslation('DeleteBunModalComp');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hukumuData, setHukumuData] = useState<Array<HukumuData> | null>(null);

    //Hook
    const { response, setParams } = useAxiosGet<RES_GET_HUKUMU, REQ_GET_HUKUMU>('/db/hukumu', true, null);

    const { response : resDelete, setParams : setParamsDelete } = useAxiosDelete<null, REQ_DELETE_HUKUMU_BUN>('/db/hukumu/bun', true, null);

    //Handle
    const showModal = () => {
        setParams({ jaBId : ytb.jaBId });
        setIsModalOpen(true);
    };

    const handleOk = () => {
        deleteBun();
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const deleteBun = () => {
        setParamsDelete({ videoId : videoId, ytBId : ytb.ytBId, jaBId : ytb.jaBId })
    }

    useEffect( () => {
        let res = response;
        if( res !== null ){
            setHukumuData(res.data);
        }
    }, [response])

    useEffect( () => {
        let res = resDelete;
        if(res !== null){
            refetchTimeline();
            cancelEdit();
        }
    }, [resDelete, refetchTimeline, cancelEdit])


    return(
        <>
            <Button onClick={showModal}>{t('BUTTON.TITLE')}</Button>
            
            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>,
                    <Button type="primary" onClick={handleOk}>{t('BUTTON.DONE')}</Button>
                ]}
            >
                <div>{t('CONTENTS.0')}</div>
                <Flex gap={16}>
                {
                    hukumuData !== null &&
                    hukumuData.map( (v) => 
                        <Card>
                            <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>
                        </Card>
                    )
                }
                </Flex>
            </Modal>
        </>
    )
}

const BunkatsuTimelineComp = ({ ytb, critTime, refetchTimeline, refetchHandles, cancelEdit } : HunkatsuTimelineCompProps ) => {

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

    const { response : resHukumu, setParams : setParamsHukumu } = useAxiosGet<RES_GET_HUKUMU, REQ_GET_HUKUMU>('/db/hukumu', true, null);

    const { response, setParams } = useAxiosPut<null, REQ_PUT_BUNKATSU>('/db/bun/bunkatsu', true, null);

    //Handle
    const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setInputs(prevState => ({
            ...prevState,
            [e.target.name] : e.target.value,
        }));
    }

    const hunkatsuBun = () => {
        let _splitedJaText = inputs.jaText.split('/');
        let _splitedKoText = inputs.koText.split('/');
        
        if( _splitedJaText.join('') !== ytb.jaText || _splitedJaText.length !== 2 ){ return }
        if( ( ytb.koBId !== null && _splitedKoText.join('') !== ytb.koText ) || _splitedKoText.length !== 2 ){ return }

        let _critJaText = _splitedJaText[0].length;
        let _critKoText = _splitedKoText[0].length;

        setParams({ videoId : videoId, ytBId : ytb.ytBId, critTime : critTime, critJaText : _critJaText, critKoText : _critKoText  });
    }

    const showModal = () => {
        setIsModalOpen(true);
        setParamsHukumu({ jaBId : ytb.jaBId });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleOk = () => {
        hunkatsuBun();
        setIsModalOpen(false);
    };

    useEffect( () => {
        let res = response;
        if(res !== null){
            refetchTimeline();
            refetchHandles.refetchAll();
            cancelEdit();
        }
    }, [response, refetchTimeline, refetchHandles, cancelEdit])

    useEffect( () => {
        let res = resHukumu;
        if( res !== null ){
            setHukumuDatas(res.data);
        }
    }, [resHukumu])

    useEffect( () => {
        setInputs({
            jaText : ytb.jaText,
            koText : ytb.koText ?? ''
        })
    }, [ytb])

    const _splitedJaText = inputs.jaText.split('/');
    const _splitedKoText = inputs.koText.split('/');

    const _isOk = _splitedJaText.length === 2 && _splitedKoText.length === 2 && hukumuDatas !== null && hukumuDatas.filter( (v) => v.startOffset < _splitedJaText[0].length && _splitedJaText[0].length < v.endOffset ).length === 0;

    return(
        <>
            <Button onClick={showModal}>{t('BUTTON.TITLE')}<SplitCellsOutlined /></Button>
            
            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Button type='primary' disabled={!_isOk} onClick={handleOk}>{t('BUTTON.DONE')}</Button>,
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
                <div>{t('CONTENTS.0')}</div>
                <Input value={inputs.jaText} name='jaText' onChange={handleInputChange}/>
                <Input value={inputs.koText} name='koText' onChange={handleInputChange}/>
                {
                    _isOk &&
                    <>
                        <div>{_splitedJaText[0]}</div>
                        <div>{ _splitedKoText[0] }</div>
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
                        <div>{ _splitedKoText[1] }</div>
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

const HeigouTimelineComp = ({ bunIds, ytb, refetchTimeline, refetchHandles, cancelEdit } : HeigouTimelineCompProps ) => {

    //i18n
    const { t } = useTranslation('HeigouTimelineComp');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { response, setParams } = useAxiosPut<null, REQ_PUT_HEIGOU>('/db/bun/heigou', true, null);

    //Handle
    const heigouBun = () => {
        if( bunIds === null ){ return }

        let _index = bunIds.findIndex( (v) => v.ytBId === ytb.ytBId );
        if( _index === bunIds.length-1 ){ return }

        let _ytBId = bunIds[_index].ytBId;
        let _next = bunIds[_index+1].ytBId

        setParams({ videoId : videoId, ytBId : _ytBId, nextYtBId : _next })
    }

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleOk = () => {
        heigouBun();
        setIsModalOpen(false);
    };

    useEffect( () => {
        let res = response;
        if(res !== null){
            refetchTimeline();
            refetchHandles.refetchAll();
            cancelEdit();
        }
    }, [response, refetchTimeline, refetchHandles, cancelEdit])

    let _index = bunIds !== null ? bunIds.findIndex( (v) => v.ytBId === ytb.ytBId ) : null;

    let _isOk = _index !== null && bunIds !== null && _index !== bunIds.length-1;

    return(
        <>
            <Button onClick={showModal}>{t('BUTTON.TITLE')}<MergeCellsOutlined /></Button>
            
            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Button type='primary' disabled={!_isOk} onClick={handleOk}>{t('BUTTON.DONE')}</Button>,
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
                <div>{t('CONTENTS.0')}</div>
                <Flex gap={16}>
                {
                    _index !== null && bunIds !== null && _index !== bunIds.length-1 &&
                    <>
                        <Card>
                            <div>{bunIds[_index].jaText}</div> 
                            <div>{bunIds[_index].koText}</div>
                        </Card>
                        <Card>
                            <div>{bunIds[_index+1].jaText}</div>
                            <div>{bunIds[_index+1].koText}</div>
                        </Card>
                    </>
                }
                </Flex>
            </Modal>
        </>
    )
}

export { UpdateBunJaTextModalComp, DeleteBunModalComp, BunkatsuTimelineComp, HeigouTimelineComp }