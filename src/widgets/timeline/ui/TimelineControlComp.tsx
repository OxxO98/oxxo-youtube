import React, { useEffect, useRef, useContext, useMemo, CSSProperties, useCallback } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Contexts
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useTimeStamp } from 'shared/lib/useTimeStamp';
import { useHandleKeyboard } from 'shared/hooks/useHandleKeyboard';
import { useAxiosGet } from 'shared/hooks/useAxios';

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
const { setStartTime, setEndTime, selectMarkerStart, selectMarkerEnd, unselectMarker } = reactPlayerActions;

interface TimelineControlCompProps {
    value : string;
    setInputText : ( value : string) => void;
    bunIds : RES_TIMELINE[] | null;
    refetchTimeline : () => void;
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

export const TimelineControlComp = ({ value, setInputText, bunIds, refetchTimeline, currentBunId, editYtbId, selectEditYtBId, state, videoPlayerHandles, refetchHandles } : TimelineControlCompProps ) => {

    //i18n
    const { t } = useTranslation('TimelineControlComp');

    //Context
    const { videoId, frameRate } = useContext(VideoContext);

    const inputRef = useRef<InputRef>(null);

    const cancelEdit = useCallback( () => {
        setInputText('');
        selectEditYtBId(null);
    }, [setInputText, selectEditYtBId])

    //Hook
    const { timeToFrameStamp } = useTimeStamp();

    const { insertBun } = usePostTimeline(videoId, refetchTimeline, cancelEdit);
    const { updateYTBunTime } = useUpdateTimelineTime(videoId, refetchTimeline, cancelEdit);
    const { response : resTransRange, setParams : setParamsTransRange } = useAxiosGet<RES_GET_TRANSCRIPT_RANGE, REQ_GET_TRANSCRIPT_RANGE>('/ai/transcript/range', true, null);

    //Redux
    const { startTime, endTime, selectMarker } = useAppSelector((state) => state.reactPlayer)

    const dispatch = useAppDispatch();

    //State
    const { duration, playedSeconds } = state;
    const { gotoTime, keyboard } = videoPlayerHandles; 
    
    const customKeyboard = [
        { key : 'ArrowRight', action : () => { nextTimeLine( )} },
        { key : 'ArrowLeft', action : () => { prevTimeLine() } },
        { key : 'q', action : () => { autoMarker() } },
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
        if( bunIds === null ){
            return;
        }

        if(startTime !== null || endTime !== null){
            if( selectMarker !== null && currentBunId !== null ){
                if(selectMarker === 'startTime'){
                    if( currentBunId > 0 ){
                        let _prev = bunIds[currentBunId-1];

                        dispatch( setStartTime(_prev.endTime) );
                    }
                }
                if(selectMarker === 'endTime'){
                    if( currentBunId < bunIds.length - 1 ){
                        let _next = bunIds[currentBunId+1];

                        dispatch( setEndTime(_next.startTime) );
                    }
                }
            }
            else{
                if(selectMarker === 'startTime' && startTime !== null){
                    let a = bunIds.findIndex( (arr) =>
                        arr.startTime > startTime
                    );

                    if( a !== -1 && a > 0){
                        let curr = bunIds[a-1];
                        dispatch( setStartTime( curr.endTime ) );
                    }
                    else if( bunIds.length > 0 ){
                        if( startTime >= bunIds[bunIds.length-1].endTime ){
                            dispatch( setStartTime(bunIds[bunIds.length-1].endTime) );
                        }
                        else if( startTime <= bunIds[0].startTime ){
                            dispatch( setStartTime(0) );
                        }
                    }
                }
                else if(selectMarker === 'endTime' && endTime !== null){
                    let a = bunIds.findIndex( (arr) =>
                        arr.endTime < endTime
                    );

                    if( a !== -1 && a < bunIds.length-1 ){
                        let curr = bunIds[a+1];
                        if( curr.endTime > endTime ){
                            dispatch( setEndTime( curr.startTime ) );
                        }
                        else{
                            dispatch( setEndTime(duration) );
                        }
                    }
                    else{
                        if( endTime <= bunIds[0].startTime ){
                            dispatch( setEndTime(bunIds[0].startTime) );
                        }
                        else if( endTime >= bunIds[bunIds.length-1].endTime ){
                            dispatch( setEndTime(duration) );
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
                        <BunkatsuTimelineComp ytb={currentYTB} critTime={playedSeconds} refetchTimeline={refetchTimeline} refetchHandles={refetchHandles} cancelEdit={cancelEdit}/>
                        <HeigouTimelineComp bunIds={bunIds} ytb={currentYTB} refetchTimeline={refetchTimeline} refetchHandles={refetchHandles} cancelEdit={cancelEdit}/>
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
                            <Button onClick={ () => updateYTBunTime(editYtbId) }>{t('BUTTON.MODIFY_TIME')}</Button>
                        }
                        {
                            currentYTB !== null &&
                            <>
                                {
                                    currentYTB.jaText !== value && 
                                    <UpdateBunJaTextModalComp ytb={currentYTB} defaultValue={value} refetchHandles={refetchHandles} refetchTimeline={refetchTimeline} cancelEdit={cancelEdit}/>
                                }
                                <DeleteBunModalComp ytb={currentYTB} refetchTimeline={refetchTimeline} cancelEdit={cancelEdit}/>
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