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
}

export const TangoAutoModal = ({ refetchTangoList } : TangoAutoModalProps) => {
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
    const { commitData, index, handleAutoCommit, moreTIdList } = useAutoCommit(videoId, refetchTangoList);

    const { response, loading, setParams } = useAxiosGet<auto_db, REQ_GET_AUTO_DB>('/db/auto', true, null);
    
    //Handle
    const showModal = () => {
        setIsModalOpen(true);
        setCurr(0);
        setStep(0);
    }

    /**
     * tId가 null이면 새로 생성 T{4자리 숫자}
     * skip이 null이면 일부 skip
     * skip에 상관 없이 TID가 들어가지만, commit에서는 skip에 우선순위가 있기 때문에 상관 없음
     */
    const handleCommit = useCallback( (tId : string | null, skip : boolean | null) => {
        if( dbData === null || commitData.current === null ){ return }
        let ids = dbData[curr].map( (v) => v.id );

        let _v = curr.toString().padStart(4, '0');
        for( let id of ids ){
            commitData.current[id].tId = tId == null ? `T${_v}` : tId;
            if( skip !== null ){
                commitData.current[id].skip = skip;
            }
        }
        
        let _added = ids.filter( (v) => commitData.current?.[v].skip === false ).length;
        if( moreTIdList.current !== null ){
            if( _added > 0 ){
                let _currData = dbData[curr][0];
                moreTIdList.current[curr] = [{
                    hyId : `HY${_v}`,
                    textData : _currData.textData,
                    yomi : _currData.yomi,
                    hyouki : _currData.hyouki,
                    tId : `T${_v}`,
                    kanjisQuery : `${_currData.kanjis.join('')}`
                }]
            }
            else{
                moreTIdList.current[curr] = []
            }
        }
        
        
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
            moreTIdList.current = [];
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
                closable
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                maskClosable={false}
                footer={[
                    <>{
                        <>
                            <Button disabled={curr === 0} onClick={() => setCurr(prev => prev-1)}>{t('BUTTON.PREV')}</Button>
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
                    <Alert style={{ width : '100%' }} title={t('ALERT.MESSAGE')} description={
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
                                <TangoCard data={dbData[curr]} commitData={commitData}/>
                                <MatchedTangoList tIdList={
                                    [
                                        ...dbData[curr][0].tIdList,
                                        ...moreTIdList.current.slice(0, curr-1).filter( (v) => v.length !== 0 && ( v[0].hyouki == dbData[curr][0].hyouki || v[0].yomi == dbData[curr][0].yomi || v[0].kanjisQuery == dbData[curr][0].kanjis.join('') ) )
                                    ]
                                } hyouki = { dbData[curr][0].hyouki } 
                                yomi = { dbData[curr][0].yomi }
                                handleCommit={handleCommit}/>
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