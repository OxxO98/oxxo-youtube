import React, { useEffect, useState, useRef, useContext, useMemo, CSSProperties, useCallback } from 'react';
import VirtualList, { ListRef } from 'rc-virtual-list';
import { useHotkeys } from 'react-hotkeys-hook';

//Hook
import { useTimeStamp } from 'shared/lib/useTimeStamp';
import { useActive } from 'shared/lib/useActive';

import type { timelineHandles } from 'shared/hooks/useTimeline'

//entities
import { TimelineBun } from 'entities/TimelineBun/index'

//ui
import { MakeDrftComp } from './MakeDraftComp';
import { TimelineControlComp } from './TimelineControlComp';

//Redux
import { useAppSelector, useAppDispatch, reactPlayerActions } from 'shared/store';

//CSS@antD
import { List, Flex, theme } from 'antd';
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

const TimelineComp = ({ state, bIdRef, timelineHandles, refetchHandles, videoPlayerHandles } : TimelineCompProps) => {
    
    //State
    const [editYtbId, setEditYtbId] = useState<string | null>(null);

    const [value, setValue] = useState<string>('');

    const currentTimelineBun = useRef<Array<HTMLDivElement | null>>([]);
        
    const divBox = useRef<HTMLDivElement>(null); //canvas Div Box 크기
    const [divBoxHeight, setDivBoxHeight] = useState<number>(800);
    const virtualRef = useRef(null);

    const { playedSeconds } = state;

    //Redux
    const { bunIds } = useAppSelector( (state) => state.timeline );

    const dispatch = useAppDispatch();

    //Hook
    const { timestampEdit } = useTimeStamp();
    
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
        gotoTime(bunIds[currentBunId].startTime, false);
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
                    <MakeDrftComp refetch={timelineHandles.refetch} gotoTime={gotoTime} loading={timelineHandles.loading}/>
                }
                </div>
            </Flex>
        </>
    )
}

export { TimelineComp }