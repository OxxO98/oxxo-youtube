import React, { useCallback, useContext, useEffect, useState } from 'react';

import LZstring from 'lz-string'
import { useTranslation } from 'react-i18next';
import { saveAs } from 'file-saver';

//Contexts
import { VideoContext } from 'contexts/VideoContext';

//Hook
import { useAxiosGet } from 'hooks/AxiosHook';
import { useDebounceEffect } from 'hooks/OptimizationHook';

//CSS@Antd
import { Modal, Input, Button, message, Slider, Flex, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { ShareAltOutlined, DownOutlined } from '@ant-design/icons'
import { useTimeStamp } from 'hooks/VideoPlayHook';

const COPY_MAX = 8192; //nginx 8k, 브라우저의 경우 10000까지 가능
// const BASE_URL = 'http://localhost:3000/shared';
const BASE_URL = 'http://oxxo.ddns.net'

interface SharedRangeBunProps {
    data : RES_SHARE
}

const ShareModalComp = () => {
    
    //i18n
    const { t } = useTranslation('SharedModalComp');
    
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [bunIds, setBunIds] = useState<Array<RES_SHARE> | null>(null);
    const [jsonBunIds, setJsonBunIds] = useState<Array<RES_JSON> | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [url, setUrl] = useState<string>('');
    const [json, setJson] = useState<Array<JSON_DATA> | null>(null);

    const [range, setRange] = useState<number[] | null>(null);

    const [messageApi, contextHolder] = message.useMessage();

    //Hook
    const { timeToTS } = useTimeStamp()

    const { response : resGetTimeLine, setParams } = useAxiosGet<RES_GET_SHARE, REQ_GET_SHARE>('/db/share', true, null);
    const { response : resGetJson, setParams : setParamsJson } = useAxiosGet<RES_GET_JSON, REQ_GET_JSON>('/db/json', true, null);

    const showModal = () => {
        setParams({ videoId : videoId });
        setParamsJson({ videoId : videoId });
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const success = () => {
        messageApi.open({
            type: 'success',
            content: t('MESSAGE.SUCCESS'),
        });
    };

    const error = () => {
        messageApi.open({
            type: 'error',
            content: t('MESSAGE.ERROR'),
        });
    };

    const handleRange = ( value : number[] ) => {
        setRange(value);
    }

    const _getEncoded = useCallback( ( arr : RES_SHARE[], start : number = 0, end : number = arr.length ) => {
        let sharedTimeline = arr.slice(start, end+1).map( (v) => {
            return {
                s : v.startTime,
                e : v.endTime,
                j : v.textData,
                k : v.koText ?? ''
            }
        })

        let shared = {
            v : videoId,
            t : sharedTimeline
        }

        let stringify = JSON.stringify(shared)

        let compressed = LZstring.compressToEncodedURIComponent(stringify);

        return compressed;
    }, [videoId]);

    const _getEncodedLight = useCallback( ( arr : RES_SHARE[], start : number = 0, end : number = arr.length, opt : 'both' | 'ja' | 'ko' = 'both' ) => {
        const _returnOpt = ( v : RES_SHARE ) => {
            if( opt === 'ja'){
                return {
                    s : v.startTime,
                    e : v.endTime,
                    j : v.jaText
                }
            }
            else if(opt === 'ko' && v.koText !== undefined){
                return {
                    s : v.startTime,
                    e : v.endTime,
                    k : v.koText
                }
            }
            else{
                return {
                    s : v.startTime,
                    e : v.endTime,
                    j : v.jaText,
                    k : v.koText ?? ''
                }
            }
        }
        
        let sharedTimeline = arr.slice(start, end+1).map( (v) => _returnOpt(v) )

        let shared = {
            v : videoId,
            t : sharedTimeline
        }

        let stringify = JSON.stringify(shared)

        let compressed = LZstring.compressToEncodedURIComponent(stringify);

        return compressed;
    }, [videoId]);

    const _findRange = ( arr : RES_SHARE[], startPoint : number = 0 ) => {
        
        let start = startPoint;
        let end = arr.length-1;
        let mid = Math.floor( (end+start)/2 );

        let maxEndcoded = _getEncoded(arr, 0+startPoint, end);

        if(maxEndcoded.length < COPY_MAX){
            return { encoded : maxEndcoded, offset : end }
        }

        while( start <= end ){
            mid = Math.floor( (end+start)/2 );

            maxEndcoded = _getEncoded(arr, 0+startPoint, mid);

            let sharedLength = maxEndcoded.length;

            if( sharedLength < COPY_MAX ){
                if( end > mid+1 ){
                    start = mid;
                }
                else{
                    return { encoded : maxEndcoded, offset : mid };
                }
            }
            else{
                if(mid-1 === start){
                    maxEndcoded =  _getEncoded(arr, 0+startPoint, start);

                    return { encoded : maxEndcoded, offset : start };
                }
                else{
                    end = mid;
                }
            }
        }
        return { encoded : maxEndcoded, offset : mid };
    }

    const _findRangeLight = ( arr : RES_SHARE[], startPoint : number = 0, opt : 'both' | 'ja' | 'ko' = 'both' ) => {
        
        let start = startPoint;
        let end = arr.length-1;
        let mid = Math.floor( (end+start)/2 );

        let maxEndcoded = _getEncodedLight(arr, 0+startPoint, end, opt);

        if(maxEndcoded.length < COPY_MAX){
            return { encoded : maxEndcoded, offset : end }
        }

        while( start <= end ){
            mid = Math.floor( (end+start)/2 );

            maxEndcoded = _getEncodedLight(arr, 0+startPoint, mid, opt);

            let sharedLength = maxEndcoded.length;

            if( sharedLength < COPY_MAX ){
                if( end > mid+1 ){
                    start = mid;
                }
                else{
                    return { encoded : maxEndcoded, offset : mid };
                }
            }
            else{
                if(mid-1 === start){
                    maxEndcoded =  _getEncodedLight(arr, 0+startPoint, start, opt);

                    return { encoded : maxEndcoded, offset : start };
                }
                else{
                    end = mid;
                }
            }
        }
        return { encoded : maxEndcoded, offset : mid };
    }

    const handleCopy = async( opt : 'def' | 'range' | 'max' | 'light' | 'light ko' | 'light ja' = 'def' ) => {
        try {
            let _url = url;

            if( ( opt === 'light' || opt === 'light ko' || opt === 'light ja' ) && bunIds !== null ){       
                let _encodeOpt : 'both' | 'ja' | 'ko' = opt === 'light ko' ? 'ko' : opt === 'light ja' ? 'ja' : 'both';         
                _url = _getEncodedLight(bunIds, 0, bunIds.length, _encodeOpt); //약간 legacy, textData만 제외
                if( _url.length > COPY_MAX && range !== null ){
                    _url = _findRangeLight( bunIds, range[0], _encodeOpt ).encoded;
                }
            }
            if( opt === 'max' && bunIds !== null && range !== null ){
                let ret = _findRange(bunIds, range[0] ); //range 시작 지점에서 최대 복사
                _url = ret.encoded;
            }
            if( opt === 'range' && bunIds !== null && range !== null ){
                _url = _getEncoded(bunIds, range[0], range[1] ); //range만 복사, 근데 지금 useEffect로 인해 url이 바뀌어서 그냥 복사와 같음
                if(_url.length > COPY_MAX){
                    _url = _findRange(bunIds, range[0] ).encoded;
                }
            }
            console.log(_url.length);

            await navigator.clipboard.writeText(`${BASE_URL}?a=${_url}`);
            success();
            handleOk();
        } catch (e) {
            error();
        }
    }

    const handleSave = () => {
        if(json === null){ return }

        let filename = `DATA_${videoId}`;

        let blob = new Blob([JSON.stringify(json)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, `${filename}.json`);
    }

    const handleSaveByCaption = ( opt : 'ko' | 'ja' = 'ja' ) => {
        if(json === null ){ return }

        let filename = `CAPTION_${videoId}`;

        let _captionData = json.map( (v) => {
            return {
                startTime : timeToTS(v.startTime),
                endTime : timeToTS(v.endTime),
                jaText : v.jaText,
                koText : v.koText
            }
        })

        let _toJaCaption = _captionData.map( (v, i) => {
            return `${i}\n${v.startTime} --> ${v.endTime}\n${ opt === 'ko' ? v.koText : v.jaText }\n`
        }).join('\n')
        
        let blob = new Blob([_toJaCaption], {type: "text/plain;charset=utf-8"});
        saveAs(blob, `${filename}.srt`);
    }

    //드롭다운 버튼
    const handleLightMenuClick: MenuProps['onClick'] = (e) => {
        if( e.key === '1' ){
            handleCopy('light')
        }
        else if( e.key === '2'){
            handleCopy('light ja')
        }
        else if(e.key === '3'){
            handleCopy('light ko')
        }
    };

    const lightItems: MenuProps['items'] = [
        {
            label: '전체 복사',
            key: '1'
        },
        {
            label: '일본어만 복사',
            key: '2'
        },
        {
            label: '한국어만 복사',
            key: '3'
        }
    ];

    const handleRangeMenuClick : MenuProps['onClick'] = (e) => {
        if( e.key === '1' ){
            handleCopy('range')
        }
        else if( e.key === '2'){
            handleCopy('max')
        }
    }

    const rangeItems: MenuProps['items'] = [
        {
            label: '범위 복사',
            key: '1'
        },
        {
            label: '범위 최대 복사',
            key: '2'
        }
    ];

    useEffect( () => {
        if(bunIds !== null){
            setUrl( _getEncoded(bunIds) );
        }
    }, [bunIds, _getEncoded])

    useEffect( () => {
        if(jsonBunIds !== null){
            let _json = jsonBunIds.map( (v) => {
                return {
                    'startTime' : v.startTime,
                    'endTime' : v.endTime,
                    'hurigana' : v.textData.map( (td) => td.ruby ?? '　' ).join('').trim(),
                    'jaText' : v.jaText,
                    'koText' : v.koText ?? ''
                }
            })

            setJson(_json);
        }
    }, [jsonBunIds])

    useEffect( () => {
        let res = resGetTimeLine;
        if(res !== null){
            setBunIds(res.data)
            setRange([0, res.data.length-1])
        }
    }, [resGetTimeLine])

    useEffect( () => {
        let res = resGetJson;
        if( res !== null ){
            setJsonBunIds(res.data);
        }
    }, [resGetJson])

    useDebounceEffect( () => {
        if( range !== null && bunIds !== null ){
            setUrl( _getEncoded(bunIds, range[0], range[1]) )
        }
    }, 1000, [range, bunIds, _getEncoded])

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
                        <Button type='primary'>범위 {t('BUTTON.COPY')}<DownOutlined /></Button>
                    </Dropdown>,
                    <Dropdown menu={{ items : lightItems, onClick : handleLightMenuClick }}>
                        <Button type='primary'>가벼운 {t('BUTTON.COPY')}<DownOutlined /></Button>
                    </Dropdown>,
                    <Button type='primary' onClick={() => handleCopy()} disabled={url.length > COPY_MAX}>{t('BUTTON.COPY')}</Button>,
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

const SharedRangeBun = ({ data } : SharedRangeBunProps ) => {

    const { timeToTS } = useTimeStamp()

    return(
        <Flex vertical>
            <Flex justify='space-between'>
                <div>{ timeToTS(data.startTime) }</div>
                <div>{ timeToTS(data.endTime) }</div>
            </Flex>
            <div>{data.jaText}</div>
            <div>{data.koText}</div>
        </Flex>
    )
}

export { ShareModalComp };