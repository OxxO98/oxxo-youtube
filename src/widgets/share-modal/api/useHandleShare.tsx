import React, { useCallback, useContext, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { saveAs } from 'file-saver';
import axios from 'axios';

//hooks
import { useTimeStamp } from 'shared/lib/useTimeStamp';

//lib
import { useShare } from '../lib/useShare'

//api
import { useMessageApi } from '../api/useMessageApi';

//config
import { API_POST_LONG, API_GET_SHORT, BASE_URL, COPY_MAX } from '../config/share-config';

//CSS@Antd
import type { MenuProps } from 'antd';

export type handleOk = () => void;
export type setParamsUserId = ( params : REQ_POST_USERID ) => void;

export function useHandleShare(
    videoId : string,
    bunIds : RES_SHARE[] | null,
    range : number[] | null,
    userId : string | null,
    json : JSON_DATA[] | null,
    handleOk : () => void,
    setParamsUserId : ( params : REQ_POST_USERID ) => void
){    
    //i18n
    const { t } = useTranslation('SharedModalComp');

    //State
    const [url, setUrl] = useState<string>(''); 

    //Hook
    const { timeToTS } = useTimeStamp();

    //lib
    const { _getEncoded, _getEncodedLight, _findRange, _findRangeLight} = useShare(videoId, bunIds, setUrl, range);

    //api
    const { contextHolder, success, error } = useMessageApi();
    
    const handleCopy = async( opt : 'def' | 'range' | 'max' | 'light' | 'light ko' | 'light ja' = 'def' ) => {
        try {
            let _url = url;

            if( ( opt === 'light' || opt === 'light ko' || opt === 'light ja' ) && bunIds !== null ){       
                let _encodeOpt : 'both' | 'ja' | 'ko' = opt === 'light ko' ? 'ko' : opt === 'light ja' ? 'ja' : 'both';         
                _url = _getEncodedLight(bunIds, 0, bunIds.length, _encodeOpt); //textData만 제외
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

    const handlePostLong = async () => {
        try {
            let opt = userId === null ? {} : { userId : userId }
            
            axios.post(
                API_POST_LONG,
                { videoId : videoId, string : url, ...opt }
            ).then( 
                ( res ) => {
                    if( res.data.message === 'error'){ return }
                    setParamsUserId({ userId : res.data.data.userId })

                    navigator.clipboard.writeText(`${BASE_URL}?l=${res.data.data.shortURL}`);
                    success();
                    handleOk();
                }
            ).catch(
                (error) => {
                    console.log('error', error);
                }
            )
        } catch (e) {
            error();
        }
    };

    const handleGetShort = async () => {
        if( userId == null ) return;

        try {
            axios.get(
                API_GET_SHORT,
                { params : { userId : userId, videoId : videoId } }
            ).then( 
                ( res ) => {
                    if( res.data.message === 'error'){ return }

                    navigator.clipboard.writeText(`${BASE_URL}?l=${res.data.data.shortURL}`);
                    success();
                    handleOk();
                }
            ).catch(
                (error) => {
                    console.log('error', error);
                }
            )
        } catch (e) {
            error();
        }
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
            label: t('LIGHT_OPTIONS.0'),
            key: '1'
        },
        {
            label: t('LIGHT_OPTIONS.1'),
            key: '2'
        },
        {
            label: t('LIGHT_OPTIONS.2'),
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
            label: t('RANGE_OPTIONS.0'),
            key: '1'
        },
        {
            label: t('RANGE_OPTIONS.1'),
            key: '2'
        }
    ];

    return {
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
    }
}