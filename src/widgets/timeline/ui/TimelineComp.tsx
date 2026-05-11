import React, { useEffect, useState, useRef, useMemo, useCallback, CSSProperties } from 'react';
import VirtualList, { ListRef } from 'rc-virtual-list';
import { useHotkeys } from 'react-hotkeys-hook';


import type { timelineHandles } from 'shared/hooks/useTimeline'

//entities
import { TimelineBun } from 'entities/TimelineBun/index'

//ui
import { MakeDrftComp } from './MakeDraftComp';
import { TimelineControlComp } from './TimelineControlComp';

//lib
import { useActive } from '../lib/useActive';

//Redux
import { useAppSelector, useAppDispatch, reactPlayerActions } from 'shared/store';

//CSS@antD
import { Flex, Spin, theme } from 'antd';
const { useToken } = theme; 

//Redux
const { setStartTime, setEndTime } = reactPlayerActions;

interface TimelineCompProps {
    state : ReactPlayerState;
    bIdRef : React.RefObject<BIdRef>;
    timelineHandles : timelineHandles;
    refetchHandles : RefetchHandles;
    videoPlayerHandles : VideoPlayerHandles;
}

const TimelineBunStyle : CSSProperties = {
    width : "100%",
    height : 64,
    border : "solid 0.1px",
    padding : "16px",
}

const TimelineComp = ({ state, bIdRef, timelineHandles, refetchHandles, videoPlayerHandles } : TimelineCompProps) => {
    
    //State
    const [editYtbId, setEditYtbId] = useState<string | null>(null);

    const [value, setValue] = useState<string>('');

    const currentTimelineBun = useRef<Array<HTMLDivElement | null>>([]);
        
    const divBox = useRef<HTMLDivElement>(null);
    const [divBoxHeight, setDivBoxHeight] = useState<number>(800);
    const virtualRef = useRef(null);

    const { playedSeconds } = state;

    //Redux
    const { bunIds } = useAppSelector( (state) => state.timeline );

    const dispatch = useAppDispatch();

    //Hook    
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
        setInputText(bunIds[currentBunId].jaText);
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

    return(
        <>
            <Flex vertical style={{ height : '100%' }}>
                <TimelineControlComp 
                    value={value} setInputText={setInputText} 
                    bunIds={bunIds} refetchTimeline={timelineHandles.refetch} 
                    currentBunId={currentBunId} editYtbId={editYtbId} selectEditYtBId={selectEditYtBId} 
                    state={state} videoPlayerHandles={videoPlayerHandles} refetchHandles={refetchHandles}
                />
                <div style={{ width : "100%", height : "100%", overflow : "scroll", padding : "8px" }} ref={divBox}>
                    {
                        bunIds !== null ?
                            <Spin spinning={timelineHandles.loading}>
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
                                                key={timeline.ytBId} bId={timeline.jaBId} ytbId={timeline.ytBId}
                                                jaText={timeline.jaText}
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
                        <MakeDrftComp refetch={timelineHandles.refetch} gotoTime={gotoTime} loading={timelineHandles.loading}/>
                    }
                </div>
            </Flex>
        </>
    )
}

export { TimelineComp }