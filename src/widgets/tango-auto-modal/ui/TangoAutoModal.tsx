import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//ui
import { TangoCard } from './TangoCard';
import { MatchedTangoList } from './MatchedTangoList'
import { TangoAutoControl } from './TangoAutoControl'

//api
import { useAutoCommit } from '../api/postCommitData';

//model
import { commitDataDTO } from '../model/commitDataDTO';

//type
import type { auto_db } from '../type';

//Redux
import { useAppSelector } from 'shared/store';

//CSS@antD
import { Button, Flex, Modal, Alert, Spin } from 'antd';
import { WarningOutlined, OpenAIOutlined } from '@ant-design/icons'

interface autoDBOption {
    imi? : 'true' | 'false'
}

interface TangoAutoModalProps {
    refetchTangoList : () => void;
    refetchTimeline : () => void;
}

export const TangoAutoModal = ({ refetchTangoList, refetchTimeline } : TangoAutoModalProps) => {
    const { t } = useTranslation('TangoAutoModal');

    //Context
    const { videoId } = useContext(VideoContext);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [dbData, setDBData] = useState<auto_db | null>(null);
    const [curr, setCurr] = useState<number>(0);
    const [step, setStep] = useState<number>(0);

    //Redux
    const { bunIds } = useAppSelector( (state) => state.timeline );

    //Hook
    const { commitData, index, handleAutoCommit, moreTIdList } = useAutoCommit(videoId, refetchTangoList, refetchTimeline);

    const { response, loading, setParams } = useAxiosGet<auto_db, REQ_GET_AUTO_DB>('/db/auto', true, null);
    
    //Handle
    const showModal = () => {
        setIsModalOpen(true);
        setCurr(0);
        setStep(0);
    }

    const handleCommit = useCallback( (tId : string | null, skip : boolean) => {
        if( dbData === null || commitData.current === null ){ return }
        let ids = dbData[curr].map( (v) => v.id );

        let _v = index.current.toString().padStart(4, '0');
        for( let id of ids ){
            commitData.current[id].tId = tId == null ? `T${_v}` : tId;
            commitData.current[id].skip = skip;
        }
        let _currData = dbData[curr][0];
        moreTIdList.current.push([{
            hyId : `HY${_v}`,
            textData : _currData.textData,
            yomi : _currData.yomi,
            hyouki : _currData.hyouki,
            tId : `T${_v}`
        }])
        index.current++;
        setCurr(curr+1);
    }, [dbData, curr]);

    const handleSkip = () => {
        if( dbData !== null && curr < dbData.length ){
            handleCommit(null, true);
        }
    }

    const handleSubmit = () => {
        handleAutoCommit();
        setIsModalOpen(false);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    const handleComfirm = ( option_imi : boolean = false ) => {
        if( bunIds === null ){ return }
        setStep(1);
        setParams({ videoId : videoId, option : option_imi ? 'true' : 'false' })
    }

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null && bunIds !== null){
            setDBData(res.data);
            commitData.current = commitDataDTO(bunIds, res.data);
        }
    }, [response])

    return(
        <>
            <Flex style={{ width : '100%', height : '100%' }} vertical justify='center' align='center' gap={16}>
                <Button type="primary"
                    onClick={showModal}
                >
                    {t('BUTTON.TITLE')}
                </Button>
            </Flex>
            
            <Modal
                title={t('TITLE')}
                closable={false}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                maskClosable={false}
                footer={[
                    <>{
                        step === 0 &&
                        <>
                            <Button disabled={curr !== 0} onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                        </>
                    }</>,
                    <>{
                        step === 1 && dbData !== null && curr < dbData.length &&
                        <div>{curr+1}/{dbData?.length}</div>
                    }</>,
                    <>{
                        step === 1 && dbData !== null && curr >= dbData.length &&
                        <Button type="primary" onClick={handleSubmit}>{t('BUTTON.DONE')}</Button>
                    }</>
                ]}
            >
                {
                    step === 0 &&
                    <Alert style={{ width : '100%' }} message={t('ALERT.MESSAGE')} description={
                        <>
                            <div style={{ marginBottom : '16px' }}>{t('ALERT.DESCRIPTION')}</div>
                            <Flex gap={16}>
                                <Button onClick={() => handleComfirm(true)}>{t('BUTTON.CONFIRM_WITH_AI')}<OpenAIOutlined /></Button>
                                <Button type="primary" onClick={() => handleComfirm(false)}>{t('BUTTON.CONFIRM')}</Button>
                            </Flex>
                        </>
                    } type="error" showIcon icon={<WarningOutlined />}/>
                }
                {
                    step === 1 && 
                    <Spin spinning={loading}>
                    {
                        dbData !== null && curr < dbData.length ?
                        <>
                            <Flex justify="space-around" style={{ height : '60vh' }}>
                                <TangoCard data={dbData[curr]}/>
                                <MatchedTangoList tIdList={
                                    [
                                        ...dbData[curr][0].tIdList,
                                        ...moreTIdList.current.filter( (v) => v[0].hyouki == dbData[curr][0].hyouki || v[0].yomi == dbData[curr][0].yomi )
                                    ]
                                } handleCommit={handleCommit}/>
                            </Flex>
                            <TangoAutoControl handleSkip={handleSkip}/>
                        </>
                        :
                        <div style={{ height : '60vh' }}>
                            <Flex style={{ height : '60vh', justifyContent : 'center', alignItems : 'center' }}>
                            {
                                dbData !== null && curr >= dbData?.length &&
                                <div>{t('MESSAGE.DONE')}</div>
                            }
                            </Flex>
                        </div>
                    }
                    </Spin>
                }
            </Modal>
        </>
    )
}