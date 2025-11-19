import React, { useEffect, useState, useRef, useContext, useMemo, CSSProperties, useCallback } from 'react';
import VirtualList, { ListRef } from 'rc-virtual-list';
import { useTranslation } from 'react-i18next'

//Components
import { TimelineBun } from 'components/TimelineBun'

import { UpdateBunJaTextModalComp, DeleteBunModalComp, BunkatsuTimelineComp, HeigouTimelineComp } from 'components/BunModalComp';

//Contexts
import { VideoContext } from 'contexts/VideoContext';

//Hook
import { useTimeStamp, useHandleKeyboard } from 'hooks/VideoPlayHook';
import { useActive } from 'hooks/ActiveHook';
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/AxiosHook';

import { useTranscript, useCaptionData } from 'hooks/AiHook';

//Redux
import { useSelector } from 'react-redux';
import { store, RootState } from 'reducers/store';
import { reactPlayerActions } from 'reducers/reactPlayerReducer';

//CSS@antD
import { Input, Button, List, Flex, Modal, Spin, theme, Tabs, Empty } from 'antd';
import { LoadingOutlined, AudioOutlined } from '@ant-design/icons'
const { useToken } = theme; 

//Redux
const { setStartTime, setEndTime, selectMarkerStart, selectMarkerEnd, unselectMarker } = reactPlayerActions;

interface TimelineCompProps {
    state : ReactPlayerState;
    bIdRef : React.RefObject<BIdRef>;
    refetchHandles : RefetchHandles;
    videoPlayerHandles : VideoPlayerHandles;
}

interface TimelineControlCompProps {
    value : string;
    setInputText : ( value : string) => void;
    bunIds : Array<RES_TIMELINE> | null;
    refetchTimeline : () => void;
    currentBunId : number | null;
    editYtbId : string | null;
    selectEditYtBId : ( editYtbId : string | null ) => void;
    state : ReactPlayerState;
    videoPlayerHandles : VideoPlayerHandles;
    refetchHandles : RefetchHandles;
}

interface MakeDraftCompProps {
    refetch : () => void;
    loading : boolean;
}

const TimelineControlStyle : CSSProperties = {
    padding : '8px 8px'
}

const TimelineComp = ({ state, bIdRef, refetchHandles, videoPlayerHandles } : TimelineCompProps) => {
    
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [editYtbId, setEditYtbId] = useState<string | null>(null);
    // const setEditYtbIdCallback = useCallback( (editYtbId : string | null) => {
    //     setEditYtbId(editYtbId)
    // }, [])

    const [value, setValue] = useState<string>(''); //입력 Input
    // const setValueCallback = useCallback( (value : string) => {
    //     setValue(value)
    // }, []);

    const [bunIds, setBunIds] = useState<RES_GET_TIMELINE | null>(null);
    const currentTimelineBun = useRef<Array<HTMLDivElement | null>>([]);
        
    const divBox = useRef<HTMLDivElement>(null); //canvas Div Box 크기
    const [divBoxHeight, setDivBoxHeight] = useState<number>(800);
    const virtualRef = useRef(null);

    const { playedSeconds } = state;

    //Hook
    const { timestampEdit } = useTimeStamp();
    
    const { getActive, setActive } = useActive();

    const { setScratch, gotoTime } = videoPlayerHandles;

    const { token } = useToken();

    const { response : resGetTimeLine, loading, fetch : refetchTimeline } = useAxiosGet<RES_GET_TIMELINE, REQ_GET_TIMELINE>('/db/timeline', false, { videoId : videoId });

    //Handle
    const getCurrentTimeLine = useCallback( () => {
        if(playedSeconds !== null){
            if(bunIds !== null){
                let a = bunIds.findIndex( (timeline) =>
                    timeline.startTime <= playedSeconds &&
                    playedSeconds < timeline.endTime
                )
                if( a !== -1 ){
                    return a;
                }
                else{
                    return null;
                }
            }
        }
        return null;
    }, [playedSeconds, bunIds])

    const selectEditYtBId = useCallback( (editYtbId : string | null) => {
        setEditYtbId(editYtbId)
    }, [])

    const setInputText = useCallback( (value : string) => {
        setValue(value)
    }, [])

    //Memo
    const currentBunId = useMemo( () => { return getCurrentTimeLine() }, [getCurrentTimeLine]) // number : index인듯

    useEffect( () => {
        let res = resGetTimeLine;
        if(res !== null){
            if(res.message === 'success'){
                setBunIds(res.data);
            }
        }
    }, [resGetTimeLine])

    useEffect( () => {
        if( virtualRef.current !== null && currentBunId !== null ){
            (virtualRef.current as ListRef).scrollTo({ index : currentBunId, align : 'top', offset : divBoxHeight/2 });
        }
    }, [currentBunId, divBoxHeight])
    
    useEffect( () => {
        if(divBox.current !== null){
            const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { height } = entry.contentRect;
                setDivBoxHeight(height);
            }
            });

            observer.observe(divBox.current);
        }
    }, [])

    return(
        <>
            <Flex vertical style={{ height : '100%' }}>
                <TimelineControlComp 
                    value={value} setInputText={setInputText} 
                    bunIds={bunIds} refetchTimeline={refetchTimeline} 
                    currentBunId={currentBunId} editYtbId={editYtbId} selectEditYtBId={selectEditYtBId} 
                    state={state} videoPlayerHandles={videoPlayerHandles} refetchHandles={refetchHandles}
                />
                <div style={{ width : "100%", height : "100%", overflow : "scroll", padding : "8px" }} ref={divBox}>
                {
                    bunIds !== null ?
                    <List bordered>
                        <VirtualList
                            data={bunIds}
                            height={divBoxHeight - 2}
                            itemHeight={47}
                            itemKey="ytBId"
                            ref={virtualRef}
                        >
                        {
                            (timeline, index) => (
                                <List.Item ref={(el) => {
                                        currentTimelineBun.current[index] = el;
                                    }}
                                    style={currentBunId === index ? { background :  token.colorPrimaryBg} : undefined}
                                >
                                    <div style={{ width : "100%" }}>
                                        <TimelineBun 
                                            key={timeline.ytBId} bId={timeline.jaBId} ytbId={timeline.ytBId}
                                            jaText={timeline.jaText}
                                            startTimestamp={ timestampEdit( timeline.startTime.toString() ) } endTimestamp={ timestampEdit( timeline.endTime.toString() ) }
                                            startTime={ timeline.startTime } endTime={ timeline.endTime }
                                            setInputText={setInputText}
                                            selectEditYtBId={selectEditYtBId}
                                            setScratch={setScratch}
                                            gotoTime={gotoTime}
                                            bIdRef={bIdRef}
                                            getActive={getActive} setActive={setActive}
                                        />
                                    </div>
                                </List.Item>
                            )
                        }
                        </VirtualList>
                    </List>
                    :
                    <MakeDrftComp refetch={refetchTimeline} loading={loading}/>
                }
                </div>
            </Flex>
        </>
    )
}

const TimelineControlComp = ({ value, setInputText, bunIds, refetchTimeline, currentBunId, editYtbId, selectEditYtBId, state, videoPlayerHandles, refetchHandles } : TimelineControlCompProps ) => {

    //i18n
    const { t } = useTranslation('TimelineComp');

    //Context
    const { videoId, frameRate } = useContext(VideoContext);

    //Hook
    const { timeToFrameStamp } = useTimeStamp();
        
    const { response : resInsert, setParams : setParamsInsert } = useAxiosPost<null, REQ_POST_BUN>('/db/bun', true, null);
    const { response : resModify, setParams : setParamsModify } = useAxiosPut<null, REQ_PUT_BUN_TIME>('/db/bun/time', true, null);

    const { response : resTransRange, setParams : setParamsTransRange } = useAxiosGet<RES_GET_TRANSCRIPT_RANGE, REQ_GET_TRANSCRIPT_RANGE>('/ai/transcript/range', true, null);

    //Redux
    const { startTime, endTime, selectMarker } = useSelector((state : RootState) => state.reactPlayer)

    //State
    const { duration, playedSeconds } = state;
    const { gotoTime, keyboard } = videoPlayerHandles; 
    const { refetchAll } = refetchHandles;
    
    const customKeyboard = [
        { key : 'ArrowRight', action : () => { nextTimeLine( )} },
        { key : 'ArrowLeft', action : () => { prevTimeLine() } },
        { key : 'q', action : () => { autoMarker() } }
    ]
    const { handleKeyboard } = useHandleKeyboard({ ...keyboard, custom : customKeyboard }); //autoMarker는 나중에 추가 바람.
    
    //Handle
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    }

    const cancelEdit = useCallback( () => {
        setInputText('');
        selectEditYtBId(null);
    }, [setInputText, selectEditYtBId])
    
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
        //약간의 버그가 있는 것으로 보임.
        if( bunIds === null ){
            return;
        }

        if(startTime !== null || endTime !== null){
            if( selectMarker !== null && currentBunId !== null ){
                if(selectMarker === 'startTime'){
                    if( currentBunId > 0 ){
                        let _prev = bunIds[currentBunId-1];

                        store.dispatch( setStartTime(_prev.endTime) );
                    }
                }
                if(selectMarker === 'endTime'){
                    if( currentBunId < bunIds.length - 1 ){
                        let _next = bunIds[currentBunId+1];

                        store.dispatch( setEndTime(_next.startTime) );
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
                        store.dispatch( setStartTime( curr.endTime ) );
                    }
                    else if( bunIds.length > 0 ){
                        if( startTime >= bunIds[bunIds.length-1].endTime ){
                            store.dispatch( setStartTime(bunIds[bunIds.length-1].endTime) );
                        }
                        else if( startTime <= bunIds[0].startTime ){
                            store.dispatch( setStartTime(0) );
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
                            store.dispatch( setEndTime( curr.startTime ) );
                        }
                        else{
                            store.dispatch( setEndTime(duration) );
                        }
                    }
                    else{
                        if( endTime <= bunIds[0].startTime ){
                            store.dispatch( setEndTime(bunIds[0].startTime) );
                        }
                        else if( endTime >= bunIds[bunIds.length-1].endTime ){
                            store.dispatch( setEndTime(duration) );
                        }
                    }
                }
            }
        }
    }

    //handle@Axios
    const insertBun = (value : string) => {
        if( value === '' ){ return }
        if( endTime === null || startTime === null ){ return } 
        if( endTime - startTime === 0 ){ return }

        setParamsInsert({
            videoId : videoId,
            jaText : value,
            startTime : startTime,
            endTime : endTime
        });
    }

    const updateYTBunTime = () => {
        if(editYtbId === null) return;
        if(startTime === null || endTime === null ) return;

        setParamsModify({
            videoId : videoId,
            ytBId : editYtbId, 
            startTime : startTime, endTime : endTime
        });
    }

    const getTranscriptRange = () => {
        if(startTime === null || endTime === null){ return }
        if( endTime - startTime === 0 ){ return }

        setParamsTransRange({ videoId : videoId, startOffset : startTime, endOffset : endTime });
    }

    //Handle@Redux
    const dispatchSelectMarkerStart = () => {
        store.dispatch(selectMarkerStart());
    }

    const dispatchSelectMarkerEnd = () => {
        store.dispatch(selectMarkerEnd());
    }

    const dispathcUnselectMarker = () => {
        store.dispatch(unselectMarker());
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

    
    useEffect( () => {
        let res = resInsert;
        if(res !== null){
            cancelEdit();
            refetchTimeline();
        }
    }, [resInsert, cancelEdit, refetchTimeline])

    useEffect( () => {
        let res = resModify;
        if(res !== null){
            cancelEdit();
            refetchTimeline();
            refetchAll();
        }
    }, [resModify, cancelEdit, refetchTimeline, refetchAll])

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
                        <Input type="text" value={value} onChange={handleChange}/>
                        {
                            currentYTB !== null && ( startTime !== null && endTime !== null ) && ( currentYTB.startTime !== startTime || currentYTB.endTime !== endTime ) &&
                            <Button onClick={updateYTBunTime}>{t('BUTTON.MODIFY_TIME')}</Button>
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
                        <Button type="primary" onClick={cancelEdit}>{t('BUTTON.CANCLE')}</Button>
                    </>
                }
            </Flex>
        </div>
    )
}

const MakeDrftComp = ({ refetch, loading } : MakeDraftCompProps ) => {
    
    //i18n
    const { t } = useTranslation('MakeDrftComp');

    //Context
    const { videoId } = useContext(VideoContext);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    //Hook
    const { timeToTS } = useTimeStamp();

    const { transcriptText, handleTranscript, postTranscript, state } = useTranscript();
    const { captionData, handleCaption, postCaption, state : captionState } = useCaptionData();

    const showModal = () => {
        setIsModalOpen(true);
        handleTranscript(videoId);
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

    useEffect( () => {
        if(state.post.done === true){
            refetch();
        }
    }, [state.post.done, refetch])

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
                closable={{ 'aria-label' : 'Custom Close Button'}}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <>{
                        state.transcript.done === true && 
                        <Button 
                            type="dashed"
                            loading={state.transcript.loading}
                            onClick={reHandleTranscript}
                            iconPosition="end"
                        >{t('BUTTON.RE_TRANSCRIPT')}</Button>
                    }</>,
                    <>{
                        state.transcript.done === true && 
                        <Button type="primary" onClick={handlePostTranscript}>{t('BUTTON.DONE_TRANSCRIPT')}</Button>
                    }</>,
                    <>{
                        captionState.caption.done === true && captionData !== null &&
                        <Button type="primary" disabled={captionData.length === 0} onClick={handlePostCaption}>{t('BUTTON.DONE_CAPTION')}</Button>
                    }</>,
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
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
                                    renderItem={
                                        (data) => (
                                            <List.Item>
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
                                {state.transcript.loading === true && (
                                    <>
                                        <Spin indicator={<LoadingOutlined spin />} size="large"/>
                                    </>
                                )}
                                {state.transcript.done === true && transcriptText !== '' && (
                                    <List style={{ maxHeight : '60vh', overflow : 'scroll' }}
                                        bordered
                                        dataSource={ transcriptText.split('\n') }
                                        renderItem={
                                            (text) => (
                                                <List.Item>
                                                    <div>{text}</div>
                                                </List.Item>
                                            )
                                        }
                                    />
                                )}
                                {state.transcript.done === true && transcriptText === '' && (
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

export { TimelineComp }