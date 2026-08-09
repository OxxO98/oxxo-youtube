import React, { useEffect, useRef, useContext, useMemo, CSSProperties, useCallback } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Contexts
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useTimeStamp } from 'shared/lib/useTimeStamp';
import { useHandleKeyboard } from 'shared/hooks/useHandleKeyboard';
import { useAxiosGet } from 'shared/hooks/useAxios';

//features
import { useUpdateTranslate } from 'features/ko-update-button/index';

//widgets
import { UpdateBunJaTextModalComp } from 'features/bun-update-modal/index';
import { DeleteBunModalComp } from 'features/bun-delete-modal/index';
import { BunkatsuTimelineComp } from 'widgets/timeline-divide/index';
import { HeigouTimelineComp } from 'widgets/timeline-merge/index';

//api
import { usePostTimeline } from '../api/usePostTimeline';
import { useUpdateTimelineTime } from '../api/useUpdateTimelineTime';

//Redux
import { useAppSelector, useAppDispatch, reactPlayerActions } from 'shared/store';

//CSS@antD
import { Input, Button, Flex, Tooltip, InputRef } from 'antd';
import { AudioOutlined } from '@ant-design/icons'

//Redux
const { setStartTime, setEndTime, selectMarkerStart, selectMarkerEnd, unselectMarker, clear } = reactPlayerActions;

interface TimelineControlCompProps {
    value : string;
    setInputText : ( value : string) => void;
    bunIds : RES_TIMELINE[] | null;
    currentBunId : number | null;
    editYtbId : string | null;
    selectEditYtBId : ( editYtbId : string | null ) => void;
    state : ReactPlayerState;
    videoPlayerHandles : VideoPlayerHandles;
    refetchHandles : RefetchHandles;
}

const TimelineControlStyle : CSSProperties = {
    padding : '8px 8px'
}

export const TimelineControlComp = ({ value, setInputText, bunIds, currentBunId, editYtbId, selectEditYtBId, state, videoPlayerHandles, refetchHandles } : TimelineControlCompProps ) => {

    //i18n
    const { t } = useTranslation('TimelineControlComp');

    const dispatch = useAppDispatch();

    //Context
    const { videoId, frameRate, translationDirection } = useContext(VideoContext);

    const inputRef = useRef<InputRef>(null);

    const cancelEdit = useCallback( () => {
        dispatch( clear() );
        setInputText('');
        selectEditYtBId(null);
    }, [setInputText, selectEditYtBId])


    //State
    const { duration, playedSeconds } = state;
    const { gotoTime, keyboard } = videoPlayerHandles; 
    
    //Hook
    const { timeToFrameStamp } = useTimeStamp();

    const { insertBun } = usePostTimeline(videoId, translationDirection, cancelEdit);
    const { updateYTBunTime } = useUpdateTimelineTime(videoId, duration, cancelEdit);
    const { response : resTransRange, setParams : setParamsTransRange } = useAxiosGet<RES_GET_TRANSCRIPT_RANGE, REQ_GET_TRANSCRIPT_RANGE>('/ai/transcript/range', true, null);
    
    const { updateHonyaku } = useUpdateTranslate( cancelEdit );

    //Redux
    const { startTime, endTime, selectMarker } = useAppSelector((state) => state.reactPlayer)
    
    const customKeyboard = [
        { code : 'ArrowRight',  action : () => { nextTimeLine( )} },
        { code : 'ArrowLeft', action : () => { prevTimeLine() } },
        { code : 'KeyQ', action : () => { autoMarker() } },
    ]
    const { handleKeyboard } = useHandleKeyboard({ ...keyboard, custom : customKeyboard });
    
    //Handle
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    }

    const handleFocus = (e : React.FocusEvent<HTMLInputElement>) => {
        e.target.selectionStart = e.target.value.length;
    }

    const prevTimeLine = () => {
        if( bunIds === null ){ return }

        if( currentBunId !== null && currentBunId > 0 ){
            let _prev = bunIds[currentBunId-1];

            gotoTime(_prev.startTime, null);
        }
    }

    const nextTimeLine = () => {
        if( bunIds === null ){ return }

        if( currentBunId !== null && currentBunId < bunIds.length - 1 ){
            let _next = bunIds[currentBunId+1];

            gotoTime(_next.startTime, null);
        }
    }

    const autoMarker = () => {
        if( bunIds === null ) return;
        if( selectMarker === null ) return;
        if( startTime === null && endTime === null ) return;

        let _bunIdsWithIndex = bunIds.map( (_, i) => { return { ..._, index : i } } )

        if( editYtbId !== null ){
            let _bun = _bunIdsWithIndex
                .find( (v) => v.ytBId == editYtbId ) ?? null;

            if( _bun === null ) return;

            if( selectMarker === 'startTime' ){
                if( _bun.index-1 >= 0 ){
                    dispatch( setStartTime( bunIds[_bun.index-1].endTime ) );
                }
                else{
                    dispatch( setStartTime( 0 ) );
                }
            }
            else if( selectMarker === 'endTime' ){
                if( _bun.index+1 <= bunIds.length-1 ){
                    dispatch( setEndTime( bunIds[_bun.index+1].startTime ) );
                }
                else{
                    dispatch( setEndTime( duration ) );
                }
            }
        }
        else{
            let _includeStart = startTime !== null ? _bunIdsWithIndex
                .filter( (v) => v.startTime < startTime && startTime < v.endTime ) : [];
            let _lastStart = _includeStart.length > 0 ? _includeStart[_includeStart.length-1] : null;

            let _includeEnd = endTime !== null ? _bunIdsWithIndex
                .filter( (v) => v.startTime < endTime && endTime < v.endTime ) : [];
            let _firstEnd = _includeEnd.length > 0 ? _includeEnd[0] : null;

            if( 
                _lastStart !== null && _firstEnd !== null && 
                _lastStart.index+1 === _firstEnd.index && 
                timeToFrameStamp(_lastStart.endTime, frameRate) !== timeToFrameStamp(_firstEnd.startTime, frameRate)
            ){
                if( selectMarker === 'startTime' ){
                    dispatch( setStartTime( _lastStart.endTime ) );
                }
                else if( selectMarker === 'endTime' ){
                    dispatch( setEndTime( _firstEnd.startTime ) );
                }
            }
            else if( _lastStart === null || _firstEnd === null ){
                let _prevStart = startTime !== null ? _bunIdsWithIndex
                    .filter( (v) => v.startTime < startTime ) : []
                let _lastPrev = _prevStart.length > 0 ? _prevStart[_prevStart.length-1] : null;

                let _nextEnd = endTime !== null ? _bunIdsWithIndex
                    .filter( (v) => v.endTime > endTime ) : []
                let _firstNext = _nextEnd.length > 0 ? _nextEnd[0] : null;

                if( selectMarker === 'startTime' && startTime !== null ){
                    if( _lastPrev === null ){
                        if( 
                            (_firstEnd !== null && _firstEnd.index === 0) || 
                            (_firstEnd === null && _firstNext !== null && _firstNext.index === 0)
                        ){
                            dispatch( setStartTime( 0 ) );
                        }
                    }
                    else{
                        if(
                            (_firstNext !== null && _lastPrev.index+1 === _firstNext.index) ||
                            (_firstNext === null && _lastPrev.index === bunIds.length-1) 
                        ){
                            dispatch( setStartTime( _lastPrev.endTime ) );
                        }
                    }
                }
                else if( selectMarker === 'endTime' && endTime !== null ){
                    if( _firstNext === null ){
                        if(
                            (_lastStart !== null && _lastStart.index === bunIds.length-1) ||
                            (_lastStart === null && _lastPrev !== null && _lastPrev.index === bunIds.length-1)
                        ){
                            dispatch( setEndTime( duration ) );
                        }
                    }
                    else{
                        if(
                            (_lastPrev !== null && _lastPrev.index+1 === _firstNext.index) ||
                            (_firstEnd === null && _firstNext.index === 0)
                        ){
                            dispatch( setEndTime( _firstNext.startTime ) );
                        }
                    }
                }
            }
        }
    }

    //Handle@Axios
    const getTranscriptRange = () => {
        if( startTime === null || endTime === null ){ return }
        if( endTime - startTime === 0 ){ return }

        setParamsTransRange({ videoId : videoId, startOffset : startTime, endOffset : endTime });
    }

    //Handle@Redux
    const dispatchSelectMarkerStart = () => {
        dispatch(selectMarkerStart());
    }

    const dispatchSelectMarkerEnd = () => {
        dispatch(selectMarkerEnd());
    }

    const dispathcUnselectMarker = () => {
        dispatch(unselectMarker());
    }

    const currentYTB = useMemo( () => {
        if(editYtbId !== null && bunIds !== null ){
            let ytb = bunIds.filter( (v) => v.ytBId === editYtbId )[0];

            return ytb ?? null;
        }
        else{
            return null;
        }
    }, [editYtbId, bunIds])

    //Hotkeys
    useHotkeys('shift+enter', () => { cancelEdit(); inputRef.current?.blur() }, { enableOnFormTags : true } )
    useHotkeys('esc', () => { inputRef.current?.blur(); }, { enableOnFormTags : true } );
    useHotkeys('tab', () => { inputRef.current?.focus(); }, { enableOnFormTags : false } );

    useHotkeys('ctrl+t, ctrl+r', () => { updateYTBunTime(editYtbId) }, { enableOnFormTags : true, useKey : false } );
    
    //Effect
    useEffect( () => {
      let res = resTransRange;
      if(res !== null){
        
        setInputText(res.data);
      }
    }, [resTransRange, setInputText])

    return(
        <div>
            <Flex justify="flex-start" gap={8} style={TimelineControlStyle}>
                {
                    startTime !== null ?
                        <Input type="text" value={timeToFrameStamp(startTime, frameRate)}
                            onFocus={dispatchSelectMarkerStart} onBlur={dispathcUnselectMarker}
                            onKeyDown={handleKeyboard}/>
                    :
                        <Input type="text" value={timeToFrameStamp(0, frameRate)}/>
                }
                {
                    endTime !== null ?
                        <Input type="text" value={timeToFrameStamp(endTime, frameRate)}
                            onFocus={dispatchSelectMarkerEnd} onBlur={dispathcUnselectMarker}
                            onKeyDown={handleKeyboard}/>
                    :
                        <Input type="text" value={timeToFrameStamp(0, frameRate)}/>
                }
                {
                    currentYTB !== null &&
                    <>
                        <BunkatsuTimelineComp ytb={currentYTB} critTime={playedSeconds} refetchHandles={refetchHandles} cancelEdit={cancelEdit}/>
                        <HeigouTimelineComp bunIds={bunIds} ytb={currentYTB} refetchHandles={refetchHandles} cancelEdit={cancelEdit}/>
                        <Button onClick={getTranscriptRange}>{t('BUTTON.PART_TRANSCRIPT')}<AudioOutlined /></Button>
                    </>
                }
            </Flex>
            <Flex justify="space-between" gap={8} style={TimelineControlStyle}>
                {
                    editYtbId === null ?
                    <>
                        <Input type="text" value={value} onChange={handleChange}/>
                        {
                            value !== '' &&
                            <Button type="primary" onClick={ () => { insertBun(value) } }>{t('BUTTON.SAVE_NEW')}</Button>
                        }
                    </>
                    :
                    <>
                        <Input type="text" value={value} onChange={handleChange} ref={inputRef} onFocus={handleFocus}/>
                        {
                            currentYTB !== null && ( startTime !== null && endTime !== null ) && ( currentYTB.startTime !== startTime || currentYTB.endTime !== endTime ) &&
                            <Tooltip title={t('TOOLTIP.CTRL_T')}>
                                <Button onClick={ () => updateYTBunTime(editYtbId) }>{t('BUTTON.MODIFY_TIME')}</Button>
                            </Tooltip>
                        }
                        {
                            currentYTB !== null &&
                            <>
                            {
                                translationDirection === 'ja-ko' ?
                                <>
                                    {
                                        currentYTB.jaText !== value && currentYTB.jaBId !== null && currentYTB.jaText !== undefined &&
                                        <UpdateBunJaTextModalComp jaBId={currentYTB.jaBId} jaText={currentYTB.jaText} defaultValue={value} refetchHandles={refetchHandles} cancelEdit={cancelEdit}/>
                                    }
                                    {
                                        currentYTB.jaBId !== null &&
                                        <DeleteBunModalComp ytBId={currentYTB.ytBId} cancelEdit={cancelEdit}/>
                                    }
                                </>
                                :
                                <>
                                    {
                                        currentYTB.koText !== value &&
                                        <Button onClick={() => { updateHonyaku(videoId, currentYTB.ytBId, value) }}>{t('BUTTON.MODIFY_TEXT')}</Button>
                                    }
                                    <DeleteBunModalComp ytBId={currentYTB.ytBId} cancelEdit={cancelEdit}/>
                                </>
                            }   
                            </>
                        }
                        <Tooltip title={t('TOOLTIP.SHIFT_ENTER')}>
                            <Button type="primary" onClick={cancelEdit}>{t('BUTTON.CANCLE')}</Button>
                        </Tooltip>
                    </>
                }
            </Flex>
        </div>
    )
}