import { useEffect, useState, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next'

//Contexts
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useTimeStamp } from 'shared/lib/useTimeStamp';
import { useTranscript } from 'shared/hooks/useTranscript';
import { useCaptionData } from 'shared/hooks/useCaptionData';

//CSS@antD
import { Button, List, Flex, Modal, Spin, theme, Tabs, Empty, Tag } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'
const { useToken } = theme; 

interface MakeDraftCompProps {
    refetch : () => void;
    gotoTime : (time: number, playBool: boolean | null) => void;
    loading : boolean;
}

export const MakeDrftComp = ({ refetch, gotoTime, loading } : MakeDraftCompProps ) => {
    
    //i18n
    const { t } = useTranslation('MakeDrftComp');

    //Context
    const { videoId } = useContext(VideoContext);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    //Hook
    const { timeToTS } = useTimeStamp();

    const { transcriptData, handleTranscript, postTranscript, state } = useTranscript();
    const { captionData, handleCaption, postCaption, state : captionState } = useCaptionData();

    const { token } = useToken();

    const compareData = useMemo( () => {
        if(transcriptData === null || captionData === null ){ return [] }
        if( captionData.length === 0 ){ return transcriptData }
        if( transcriptData.length === 0 ){ return captionData }
        let _dataArr = [...transcriptData, ...captionData].sort( (a, b) => a.startTime-b.startTime );

        let _ret : any[] = [];
        for( let key in _dataArr ){
            let _data = _dataArr[key];
            if( _ret.length === 0 ){
                _ret.push({
                    ..._data
                });
                continue;
            }

            let _last = _ret[ _ret.length - 1 ];
            if(_last.tag === _data.tag){
                _last.text = _last.text.concat( ' / ', _data.text )
                _last.endTime = _data.endTime
                _last.merged = true;
            }
            else{
                _ret.push({
                    ..._data
                });
            }
        }

        return _ret;
    }, [transcriptData, captionData])

    //Handle
    const showModal = () => {
        setIsModalOpen(true);
        handleCaption(videoId);
    }

    const reHandleTranscript = () => {
        handleTranscript(videoId!, true, 'ja');
    }
    
    const handlePostTranscript = () => {
        postTranscript(videoId);
        setIsModalOpen(false);
    }

    const handlePostCaption = () => {
        postCaption(videoId);
        setIsModalOpen(false);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    //Effect
    useEffect( () => {
        if(state.post.done === true){
            refetch();
        }
    }, [state.post.done, refetch])

    useEffect( () => {
        if(captionState.post.done === true){
            refetch();
        }
    }, [captionState.post.done, refetch])

    return (
        <>
            <Flex style={{ width : '100%', height : '100%' }} vertical justify='center' align='center' gap={16}>
                {
                    !loading ?
                    <>
                        <Button type="primary"
                            loading={state.transcript.loading}
                            onClick={showModal}
                            iconPosition="end"
                        >
                            {t('BUTTON.TITLE')}
                        </Button>
                    </>
                :
                    <Spin indicator={<LoadingOutlined spin />} size="large"/>
                }
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
                        state.transcript.done === true && 
                        <Button 
                            type="dashed"
                            loading={state.transcript.loading}
                            onClick={reHandleTranscript}
                            iconPosition="end"
                            disabled={state.transcript.loading}
                        >{t('BUTTON.RE_TRANSCRIPT')}</Button>
                    }</>,
                    <>{
                        captionState.caption.done === true && captionData !== null &&
                        <Button type="primary" disabled={captionData.length === 0} onClick={handlePostCaption}>{t('BUTTON.DONE_CAPTION')}</Button>
                    }</>,
                    <>{
                        state.transcript.done === true && 
                        <Button type="primary" onClick={handlePostTranscript} disabled={state.transcript.loading}>{t('BUTTON.DONE_TRANSCRIPT')}</Button>
                    }</>,
                    <Button onClick={handleCancel} disabled={state.transcript.loading}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
                <Tabs defaultActiveKey="1" items={
                    [
                        {
                            key : "1",
                            label : t('CONTENTS.0'),
                            children : 
                            <>
                            {
                                captionData !== null ? 
                                <List style={{ maxHeight : '60vh', overflow : 'scroll' }}
                                    bordered
                                    dataSource={ captionData }
                                    key={'startTime'}
                                    renderItem={
                                        (data) => (
                                            <List.Item
                                                onClick={ () => gotoTime(data.startTime, true) }
                                            >
                                                <Flex gap={16}>
                                                    <div>{ timeToTS(data.startTime) }</div>
                                                    <div>{ timeToTS(data.endTime) }</div>
                                                    <div>{data.text}</div>
                                                </Flex>
                                            </List.Item>
                                        )
                                    }
                                />
                                :
                                <>
                                {
                                    captionState.caption.done === false ?
                                    <Spin indicator={<LoadingOutlined spin />} size="large"/>
                                    :
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                }
                                </>
                            }
                            </>
                        },
                        {
                            key : "2",
                            label : t('CONTENTS.1'),
                            children : 
                            <>
                                {state.transcript.done === true && state.transcript.loading === true && (
                                    <>
                                        <Spin indicator={<LoadingOutlined spin />} size="large"/>
                                    </>
                                )}
                                {state.transcript.done === false &&
                                    <>
                                        <Button 
                                            onClick={() => handleTranscript(videoId)}
                                            loading={state.transcript.loading}
                                            iconPosition="end"
                                            disabled={state.transcript.loading}
                                        >
                                            {t('BUTTON.TRANSCRIPT')}
                                        </Button>
                                    </>
                                }
                                {state.transcript.done === true &&  state.transcript.loading === false && transcriptData !== null && (
                                    <List style={{ maxHeight : '60vh', overflow : 'scroll' }}
                                        bordered
                                        dataSource={ transcriptData }
                                        key={'startTime'}
                                        renderItem={
                                            (data) => (
                                                <List.Item 
                                                    style={{ backgroundColor : token.colorBgBase }}
                                                    onClick={ () => gotoTime(data.startTime, true) }
                                                >
                                                    <Flex gap={16}>
                                                        <div>{ timeToTS(data.startTime) }</div>
                                                        <div>{ timeToTS(data.endTime) }</div>
                                                        <div>{data.text}</div>
                                                    </Flex>
                                                </List.Item>
                                            )
                                        }
                                    />
                                )}
                                {state.transcript.done === true && transcriptData === null && (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                            </>
                        },
                        {
                            key : "3",
                            label : t('CONTENTS.2'),
                            disabled : state.transcript.done === false,
                            children : 
                            <>
                                {state.transcript.loading === true && (
                                    <>
                                        <Spin indicator={<LoadingOutlined spin />} size="large"/>
                                    </>
                                )}
                                {state.transcript.done === true && state.transcript.loading === false && compareData !== null && (
                                    <List style={{ maxHeight : '60vh', overflow : 'scroll' }}
                                        bordered
                                        dataSource={compareData}
                                        renderItem={
                                            (data) => (
                                                <List.Item 
                                                    style={{ backgroundColor : data.tag === 'transcript' ? token.colorBgBase : ''}} 
                                                    onClick={ () => gotoTime(data.startTime, true) }
                                                >
                                                    <Flex 
                                                        gap={16} 
                                                        style={{ 
                                                            width : data.tag === 'transcript' ? '100%' : '', 
                                                        }}
                                                    >
                                                        <div>{ timeToTS(data.startTime) }</div>
                                                        <div>{ timeToTS(data.endTime) }</div>
                                                        <div style={{
                                                            width : '100%',
                                                            textAlign : data.tag === 'transcript' ? 'right' : 'left'
                                                        }}>{data.text}</div>
                                                        <>{
                                                            data.merged !== undefined && 
                                                            <Tag color='warning'>병합됨</Tag>
                                                        }</>
                                                        <Tag color='default'>{data.tag}</Tag>
                                                    </Flex>
                                                </List.Item>
                                            )
                                        }
                                    />
                                )}
                                {state.transcript.done === true && transcriptData === null && (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                            </>
                        }
                    ]
                }/>
            </Modal>
        </>
    )
}