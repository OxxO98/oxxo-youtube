import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isHotkeyPressed } from 'react-hotkeys-hook'

//api
import { useHandleShare } from '../api/useHandleShare';

//ui
import { SharedRangeBun } from './SharedRangeBun';

//config
import { BASE_URL, COPY_MAX } from '../config/share-config';

//Contexts
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet, useAxiosPost } from 'shared/hooks/useAxios';

//CSS@Antd
import { Modal, Input, Button, Slider, Flex, Dropdown } from 'antd';
import { ShareAltOutlined, DownOutlined, CloudUploadOutlined } from '@ant-design/icons'

const ShareModalComp = () => {
    
    //i18n
    const { t } = useTranslation('SharedModalComp');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [bunIds, setBunIds] = useState<RES_SHARE[] | null>(null);
    const [range, setRange] = useState<number[] | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [json, setJson] = useState<JSON_DATA[] | null>(null);

    const [jsonBunIds, setJsonBunIds] = useState<RES_JSON[] | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { response : resGetTimeLine, setParams } = useAxiosGet<RES_GET_SHARE, REQ_GET_SHARE>('/db/share', true, null);
    const { response : resGetJson, setParams : setParamsJson } = useAxiosGet<RES_GET_JSON, REQ_GET_JSON>('/db/json', true, null);

    const { response : resGetUserId, fetch : fetchUserId } = useAxiosGet<RES_GET_USERID, REQ_GET_USERID>('/db/userId', false, null);
    const { response : resPostUserId, setParams : setParamsUserId } = useAxiosPost<null, REQ_POST_USERID>('/db/userId', true, null);

    //api
    const { 
        url,
        contextHolder,
        lightItems,
        rangeItems,
        handleCopy,
        handleSave,
        handleSaveByCaption,
        handlePostLong,
        handleGetShort,
        handleLightMenuClick,
        handleRangeMenuClick
    } = useHandleShare(videoId, bunIds, range, userId, json, () => setIsModalOpen(false), setParamsUserId);

    const showModal = () => {
        setParams({ videoId : videoId });
        setParamsJson({ videoId : videoId });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleRange = ( value : number[] ) => {
       setRange(value);
    }

    useEffect( () => {
        let res = resGetUserId;
        if(res !== null && res.message === 'success'){
            setUserId(res.data.userId);
        }
    }, [resGetUserId])

    useEffect( () => {
        let res = resPostUserId;
        if(res !== null){
            fetchUserId();
        }
    }, [resPostUserId, fetchUserId])

    useEffect( () => {
        if(jsonBunIds !== null){
            let _json = jsonBunIds.map( (v) => {
                return {
                    'startTime' : v.startTime,
                    'endTime' : v.endTime,
                    'hurigana' : v.textData.map( (td) => td.ruby ?? '　' ).join('').trim(),
                    'jaText' : v.jaText,
                    'koText' : v.koText ?? '',
                    'reading' : v.reading ?? ''
                }
            })

            setJson(_json);
        }
    }, [jsonBunIds])

    useEffect( () => {
        let res = resGetTimeLine;
        if(res !== null){
            if(res.data.length !== 0){
                setBunIds(res.data);
            }
            setRange([0, res.data.length-1]);
        }
    }, [resGetTimeLine])

    useEffect( () => {
        let res = resGetJson;
        if( res !== null ){
            setJsonBunIds(res.data);
        }
    }, [resGetJson])

    return(
        <>
            {contextHolder}
            <Button onClick={showModal}>
                {t('BUTTON.TITLE')}<ShareAltOutlined />
            </Button>
            
            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Button onClick={() => handleSaveByCaption()}>{t('BUTTON.SAVE_CAPTION_JA')}</Button>,
                    <Button onClick={() => handleSaveByCaption('ko')}>{t('BUTTON.SAVE_CAPTION_KO')}</Button>,
                    <Button onClick={handleSave}>{t('BUTTON.SAVE')}</Button>,
                    <Dropdown menu={{ items : rangeItems, onClick : handleRangeMenuClick }}>
                        <Button type='primary'>{t('BUTTON.COPY_RANGE')}<DownOutlined /></Button>
                    </Dropdown>,
                    <Dropdown menu={{ items : lightItems, onClick : handleLightMenuClick }}>
                        <Button type='primary'>{t('BUTTON.COPY_LIGHT')}<DownOutlined /></Button>
                    </Dropdown>,
                    <Button type='primary' onClick={() => handlePostLong()} disabled={ isHotkeyPressed('shift') ? false : url.length < COPY_MAX } icon={<CloudUploadOutlined />} iconPosition='end'>{t('BUTTON.COPY_UPLOAD')}</Button>,
                    <>{
                        url.length >= COPY_MAX || isHotkeyPressed('shift') ?
                        <Button type='primary' onClick={() => handleGetShort()}>{t('BUTTON.COPY')}</Button>
                        :
                        <Button type='primary' onClick={() => handleCopy()}>{t('BUTTON.COPY')}</Button>
                    }</>,
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>, 
                ]}
            >
                { 
                    bunIds !== null && range !== null &&
                    <>
                        <Slider range={{ draggableTrack: true }} defaultValue={[0, bunIds.length-1]} max={bunIds.length-1} value={range} onChange={handleRange} />
                        <Flex justify='space-between' style={{ marginBottom : '16px'}} >
                            <SharedRangeBun data={bunIds[range[0]]}/>
                            <SharedRangeBun data={bunIds[range[1]]}/>
                        </Flex>
                    </> 
                }
                <Input.TextArea style={{ marginBottom : '16px'}} autoSize={{ minRows : 2, maxRows : 10 }} value={`${BASE_URL}?a=${url}`} count={{ show : true, max : COPY_MAX}}/>
            </Modal>
        </>
    )
}

export { ShareModalComp };