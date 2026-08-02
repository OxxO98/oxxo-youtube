import React, { useEffect, useState, useRef, useMemo, useCallback, CSSProperties, useContext } from 'react';
import VirtualList, { ListRef } from 'rc-virtual-list';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation } from 'react-router-dom';

//entities
import { TimelineBun } from 'entities/TimelineBun/index'

//ui
import { MakeDrftComp } from './MakeDraftComp';
import { TimelineControlComp } from './TimelineControlComp';

//lib
import { useActive } from '../lib/useActive';

//Redux
import { useAppSelector, useAppDispatch, reactPlayerActions } from 'shared/store';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//CSS@antD
import { Flex, Spin, theme } from 'antd';
const { useToken } = theme; 

//Redux
const { setStartTime, setEndTime } = reactPlayerActions;

interface TimelineCompProps {
    state : ReactPlayerState;
    bIdRef : React.RefObject<BIdRef>;
    refetchHandles : RefetchHandles;
    videoPlayerHandles : VideoPlayerHandles;
}

const TimelineBunStyle : CSSProperties = {
    width : "100%",
    height : 64,
    border : "solid 0.1px",
    padding : "16px",
}

const TimelineComp = ({ state, bIdRef, refetchHandles, videoPlayerHandles } : TimelineCompProps) => {
    
    //Context
    const { translationDirection } = useContext(VideoContext);

    //State
    const [editYtbId, setEditYtbId] = useState<string | null>(null);

    const [value, setValue] = useState<string>('');

    const currentTimelineBun = useRef<Array<HTMLDivElement | null>>([]);
    
    const appliedStartTimeRef = useRef<string | null>(null);

    const divBox = useRef<HTMLDivElement>(null);
    const [divBoxHeight, setDivBoxHeight] = useState<number>(800);
    const virtualRef = useRef(null);

    const { playedSeconds } = state;

    //Redux
    const { bunIds, timelineLoading } = useAppSelector( (state) => state.timeline );

    const dispatch = useAppDispatch();

    //Hook    
    const location = useLocation();

    const { getActive, setActive } = useActive();

    const { setScratch, gotoTime } = videoPlayerHandles;

    const { token } = useToken();

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
    const currentBunId = useMemo( () => { return getCurrentTimeLine() }, [getCurrentTimeLine])

    const handleEditCurrent = () => {
        if( currentBunId === null || bunIds === null ){ return }
        dispatch( setStartTime(bunIds[currentBunId].startTime) );
        dispatch( setEndTime(bunIds[currentBunId].endTime) );
        if( translationDirection === 'ja-ko' ){
            setInputText(bunIds[currentBunId].jaText ?? '');
        }
        else{
            setInputText(bunIds[currentBunId].koText ?? '');
        }
        selectEditYtBId(bunIds[currentBunId].ytBId);
        if( bunIds[currentBunId].startTime > state.playedSeconds || state.playedSeconds > bunIds[currentBunId].endTime ){
            gotoTime(bunIds[currentBunId].startTime, false);
        }
        else{
            gotoTime(state.playedSeconds, false);
        }
    }
    
    //Hotkeys
    useHotkeys('enter', () => handleEditCurrent() )

    //Effect
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

    useEffect( () => {
        let params = new URLSearchParams(location.search);
        let rawStartTime  = params.get('startTime');

        if(rawStartTime === null) return;
        if(appliedStartTimeRef.current === rawStartTime) return;
        if(state.duration <= 0) return;

        const startTime = Number(rawStartTime);

        if(!Number.isFinite(startTime) || startTime < 0){
            appliedStartTimeRef.current = rawStartTime;
            return;
        }

        const safeStartTime = Math.min(startTime, state.duration);

        appliedStartTimeRef.current = rawStartTime;
        gotoTime(safeStartTime, false);

    }, [location.search, state.duration, gotoTime])

    return(
        <>
            <Flex vertical style={{ height : '100%' }}>
                <TimelineControlComp 
                    value={value} setInputText={setInputText} 
                    bunIds={bunIds}
                    currentBunId={currentBunId} editYtbId={editYtbId} selectEditYtBId={selectEditYtBId} 
                    state={state} videoPlayerHandles={videoPlayerHandles} refetchHandles={refetchHandles}
                />
                <div style={{ width : "100%", height : "100%", overflow : "scroll", padding : "8px" }} ref={divBox}>
                    {
                        bunIds !== null ?
                            <Spin spinning={timelineLoading}>
                                <VirtualList
                                    data={bunIds}
                                    height={divBoxHeight}
                                    itemHeight={64}
                                    itemKey="ytBId"
                                    ref={virtualRef}
                                >
                                {
                                    (timeline, index) => (
                                        <div
                                            ref={(el) => {
                                                currentTimelineBun.current[index] = el;
                                            }}
                                            style={currentBunId === index ? 
                                                { ...TimelineBunStyle, background : token.colorPrimaryBg, borderColor : token.colorBgContainer } : 
                                                { ...TimelineBunStyle, borderColor : token.colorBgContainer } 
                                            }
                                        >
                                            <TimelineBun 
                                                key={timeline.ytBId} jaBId={timeline.jaBId} ytBId={timeline.ytBId}
                                                jaText={timeline.jaText} koText={timeline.koText}
                                                startTimestamp={ timeline.startTime.toString() } endTimestamp={ timeline.endTime.toString() }
                                                startTime={ timeline.startTime } endTime={ timeline.endTime }
                                                state={state}
                                                setInputText={setInputText}
                                                selectEditYtBId={selectEditYtBId}
                                                setScratch={setScratch}
                                                gotoTime={gotoTime}
                                                bIdRef={bIdRef}
                                                getActive={getActive} setActive={setActive}
                                            />
                                        </div>
                                    )
                                }
                                </VirtualList>
                            </Spin>
                        :
                        <MakeDrftComp gotoTime={gotoTime}/>
                    }
                </div>
            </Flex>
        </>
    )
}

export { TimelineComp }