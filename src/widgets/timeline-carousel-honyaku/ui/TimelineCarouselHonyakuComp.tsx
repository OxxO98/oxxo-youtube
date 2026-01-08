import React, { useEffect, useState, useContext, CSSProperties, useCallback } from 'react';

//Hook
import { useHandleKeyboard } from 'shared/hooks/useHandleKeyboard';
import { useSelectEdit } from 'shared/lib/useSelect'

//widgets
import { HonyakuComp } from 'widgets/honyaku/index';
import { HonyakuRepresentive } from 'widgets/honyaku-representive/index';

//entities
import { Bun } from 'entities/Bun/index';

//Redux
import { useAppSelector, useAppDispatch, reactPlayerActions, selectionActions, timelineActions } from 'shared/store';
const { setStartTime, setEndTime } = reactPlayerActions;
const { setSelectedBun, clear } = selectionActions;
const { setCurrentBunId, setCurrentBunIdNext, setCurrentBunIdPrev } = timelineActions;

interface TimelineCarouselCompProps {
    state: ReactPlayerState;
    bIdRef: React.RefObject<BIdRef>;
    videoPlayerHandles: VideoPlayerHandles;
    deselect: () => void;
}

const TimelineBunStyle: CSSProperties = {
    minHeight: '35px',
    alignContent: 'center'
}

const TranslateControlstyle: CSSProperties = {
    margin: '16px'
}

const TranslateBunStyle: CSSProperties = {
    minHeight: '35px',
    alignContent: 'center'
}

export const TimelineCarouselHonyakuComp = ({ state, bIdRef, videoPlayerHandles, deselect }: TimelineCarouselCompProps) => {

    //State
    const { playedSeconds } = state;

    //@honyaku
    const { edit: honyakuEdit, handleSelect: honyakuHandleSelect, clearEdit: honyakuClearEdit } = useSelectEdit();

    const { gotoTime, keyboard } = videoPlayerHandles;

    //Redux
    const { bunIds, currentBunId } = useAppSelector( (state) => state.timeline ); 

    const dispatch = useAppDispatch();

    const customKeyboard = [
        { key: 'ArrowRight', action: () => { nextTimeLine() } },
        { key: 'ArrowLeft', action: () => { prevTimeLine() } }
    ]
    const filteredKeyboard = {
        pauseYT: keyboard.pauseYT,
        prevSec: keyboard.prevSec,
        nextSec: keyboard.nextSec,
        prevFrame: keyboard.prevFrame,
        nextFrame: keyboard.nextFrame,
        markerPlay: keyboard.markerPlay,
        markerStop: keyboard.markerStop,
        loop: keyboard.loop
    }
    useHandleKeyboard({ ...filteredKeyboard, custom: customKeyboard });

    //handle
    const cancelEdit = useCallback(() => {
        dispatch(setStartTime(0));
        dispatch(setEndTime(0));

        honyakuClearEdit();
    }, [honyakuClearEdit])

    //Handle @timeline
    const prevTimeLine = () => {
        if (bunIds === null) {
            return;
        }

        dispatch(clear());
        deselect();

        if (currentBunId > 0) {
            let curr = bunIds[currentBunId - 1];
            gotoTime(curr.startTime, null);

            dispatch( setCurrentBunIdPrev() );
        }
    }

    const nextTimeLine = () => {
        if (bunIds === null) {
            return;
        }

        dispatch(clear());
        deselect();

        if (currentBunId + 1 < bunIds.length) {
            let curr = bunIds[currentBunId + 1];
            gotoTime(curr.startTime, null);

            dispatch( setCurrentBunIdNext() );
        }
    }

    const getCurrentTimeLine = useCallback(() => {
        if (bunIds === null) {
            return null;
        }

        let a = bunIds.findIndex((arr) =>
            arr.startTime <= playedSeconds &&
            playedSeconds < arr.endTime
        );
        let b = bunIds.findIndex((arr) =>
            arr.startTime === playedSeconds
        );

        if (a !== -1) {
            if (b !== -1) {
                return b;
            }
            else {
                return a;
            }
        }
        return null;
    }, [bunIds, playedSeconds])

    const moveCurrentTimeLine = useCallback(() => {
        if (playedSeconds !== null) {
            if (bunIds !== null) {
                let curTL = getCurrentTimeLine();
                if (curTL !== null) {
                    dispatch( setCurrentBunId(curTL) );
                }
            }
        }
    }, [playedSeconds, bunIds, getCurrentTimeLine])

    //Effect
    useEffect(() => {
        moveCurrentTimeLine();
    }, [playedSeconds, moveCurrentTimeLine])

    useEffect(() => {
        if (bunIds && bunIds.length !== 0) {
            cancelEdit();

            let curr = bunIds[currentBunId];
            dispatch(setStartTime(curr.startTime));
            dispatch(setEndTime(curr.endTime));
            dispatch(setSelectedBun(bunIds[currentBunId].jaBId));
        }
    }, [bunIds, currentBunId, cancelEdit])

    useEffect(() => {
        if (bunIds && bunIds.length !== 0) {
            dispatch(setSelectedBun(bunIds[0].jaBId));
        }
    }, [bunIds])

    return (
        <> 
            <div style={TranslateControlstyle}>
                {
                    bunIds !== null && bunIds.length !== 0 &&
                    <>
                        <div className="jaText" id="activeRange" style={TimelineBunStyle}>
                            <Bun key={bunIds[currentBunId].jaBId} bId={bunIds[currentBunId].jaBId} bIdRef={bIdRef} />
                        </div>
                        <div style={TranslateBunStyle}>
                            {
                                honyakuEdit === false ?
                                    <HonyakuRepresentive ytBId={bunIds[currentBunId].ytBId} handleSelect={honyakuHandleSelect} bIdRef={bIdRef} />
                                    :
                                    <HonyakuComp ytBId={bunIds[currentBunId].ytBId} clearEdit={honyakuClearEdit} bIdRef={bIdRef} />
                            }
                        </div>
                    </>
                }
            </div>
        </>
    )
}