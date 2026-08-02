import React, { useEffect, useState, useRef, useMemo, CSSProperties, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from 'react-hotkeys-hook';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useHandleKeyboard } from 'shared/hooks/useHandleKeyboard';

//features
import { DeleteBunModalComp } from 'features/bun-delete-modal/index'
import { UpdateBunJaTextModalComp } from 'features/bun-update-modal/index';
import { useUpdateTranslate } from 'features/ko-update-button/index';

//entities
import { Bun } from 'entities/Bun/index';
import { KoText } from 'entities/KoText';

//Redux
import { useAppSelector, useAppDispatch, reactPlayerActions, timelineActions } from 'shared/store';

//CSS@antD
import { Input, Button, Flex, Tooltip, InputRef } from 'antd';
import { StepBackwardOutlined, StepForwardOutlined, RollbackOutlined } from '@ant-design/icons'

//Redux
const { setStartTime, setEndTime } = reactPlayerActions;
const { setCurrentBunId, setCurrentBunIdNext, setCurrentBunIdPrev } = timelineActions;

interface TimelineCarouselCompProps {
    state: ReactPlayerState;
    bIdRef: React.RefObject<BIdRef>;
    refetchHandles: RefetchHandles;
    videoPlayerHandles: VideoPlayerHandles;
    deselect: () => void;
}

const TimelineControlstyle: CSSProperties = {
    height: '70px',
    alignContent: 'center'
}

const TimelineBunStyle: CSSProperties = {
    minHeight: '35px',
    alignContent: 'center'
}

export const TimelineCarouselComp = ({ state, bIdRef, refetchHandles, videoPlayerHandles, deselect }: TimelineCarouselCompProps) => {
    //i18n
    const { t } = useTranslation('TimelineCarouselComp');

    //context
    const { videoId, translationDirection } = useContext(VideoContext);

    //Ref
    const inputRef = useRef<InputRef>(null);

    //State
    const [editYtbId, setEditYtbId] = useState<string | null>(null);
    const [value, setValue] = useState<string>('');

    const currentTimelineBun = useRef<Array<HTMLDivElement | null>>([]);

    const { playedSeconds } = state;

    const { setScratch, gotoTime, keyboard } = videoPlayerHandles;

    //Redux
    const { bunIds } = useAppSelector( (state) => state.timeline ); 

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
    }, [bunIds, playedSeconds]);

    //Memo
    const currentBunId = useMemo( () => { return getCurrentTimeLine() }, [getCurrentTimeLine])

    //Hotkeys
    useHotkeys('enter', () => handleEdit())
    useHotkeys('shift+enter', () => cancelEdit(), { enableOnFormTags: true })

    //Handles
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.selectionStart = e.target.value.length;
    }

    const cancelEdit = useCallback(() => {
        dispatch(setStartTime(0));
        dispatch(setEndTime(0));
        setValue('');
        setEditYtbId(null);
    }, [])

    const handleEdit = useCallback(() => {
        if ( currentBunId == null || bunIds === null) { return }

        setEditYtbId(bunIds[currentBunId].ytBId);
        if( translationDirection === 'ja-ko' ){
            setValue(bunIds[currentBunId].jaText ?? '');
        }
        else{
            setValue(bunIds[currentBunId].koText ?? '');
        }
    }, [bunIds, currentBunId])

    //Handle @timeline
    const prevTimeLine = () => {
        if ( currentBunId == null || bunIds === null) { return }

        deselect();

        if (currentBunId > 0) {
            let curr = bunIds[currentBunId - 1];
            gotoTime(curr.startTime, null);

            dispatch( setCurrentBunIdPrev() );
        }
    }

    const nextTimeLine = () => {
        if ( currentBunId == null || bunIds === null) { return }

        deselect();

        if (currentBunId + 1 < bunIds.length) {
            let curr = bunIds[currentBunId + 1];
            gotoTime(curr.startTime, null);

            dispatch( setCurrentBunIdNext() );
        }
    }

    const currentTimeLine = () => {
        if ( currentBunId == null || bunIds === null) { return }

        let curr = bunIds[currentBunId];
        setScratch(true, curr.startTime, curr.endTime, false);
    }

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

    //Hook
    const { updateHonyaku } = useUpdateTranslate( cancelEdit );

    //Effect
    useEffect(() => {
        moveCurrentTimeLine();
    }, [playedSeconds, bunIds, moveCurrentTimeLine])

    useEffect(() => {
        if ( currentBunId !== null && bunIds && bunIds.length !== 0) {
            setEditYtbId(null);
            cancelEdit();

            let curr = bunIds[currentBunId];
            dispatch(setStartTime(curr.startTime));
            dispatch(setEndTime(curr.endTime));
        }
    }, [bunIds, currentBunId, cancelEdit])

    useEffect(() => {
        if (inputRef.current !== null && editYtbId !== null) {
            inputRef.current.focus();
        }
    }, [editYtbId])

    return (
        <>
            <div>
                <div>
                    <div style={TimelineControlstyle}>
                        {
                            currentTimelineBun !== null &&
                            <Flex justify='center' align='center' gap='middle'>
                                <Button onClick={prevTimeLine}>{t('BUTTON.PREV')}<StepBackwardOutlined /></Button>
                                <Button onClick={currentTimeLine}>{t('BUTTON.CURR')}<RollbackOutlined /></Button>
                                <Button onClick={nextTimeLine}>{t('BUTTON.NEXT')}<StepForwardOutlined /></Button>
                            </Flex>
                        }
                    </div>
                    {
                        bunIds !== null && bunIds.length !== 0 && currentBunId !== null &&
                        <>
                            <div style={{ marginBottom : '8px' }}>
                            {
                                translationDirection === 'ja-ko' ?
                                    <>
                                    {
                                        bunIds[currentBunId].koBId &&
                                        <KoText data={bunIds[currentBunId].koText}/>
                                    }
                                    </>
                                :
                                    <>
                                    {
                                        bunIds[currentBunId].jaBId && 
                                        <div className="jaText" id="activeRange">
                                            <Bun key={bunIds[currentBunId].jaBId} bId={bunIds[currentBunId].jaBId} bIdRef={bIdRef} />
                                        </div>  
                                    }
                                    </>
                            }
                            </div>
                            {
                                editYtbId === null ?
                                    <>
                                        <div style={TimelineBunStyle}>
                                        {
                                            translationDirection === 'ja-ko' ?
                                                bunIds[currentBunId].jaBId !== null &&
                                                <div className="jaText" id="activeRange">
                                                    <Bun key={bunIds[currentBunId].jaBId} bId={bunIds[currentBunId].jaBId} bIdRef={bIdRef} />
                                                </div>
                                            :
                                                <KoText data={bunIds[currentBunId].koText}/>
                                        }
                                        </div>
                                        <Flex justify='flex-end' align='center' gap={8} style={{ padding: '8px' }}>
                                            <Tooltip title={t('TOOLTIP.ENTER')}>
                                                <Button onClick={handleEdit}>{t('BUTTON.MODIFY')}</Button>
                                            </Tooltip>
                                        </Flex>
                                    </>
                                    :
                                    <>
                                        <Input type="text" value={value} onChange={handleChange} style={{ ...TimelineBunStyle, marginLeft: 'auto', width: 'calc(100% - 16px)' }} ref={inputRef} onFocus={handleFocus} />
                                        <Flex justify='flex-end' align='center' gap={8} style={{ padding: '8px' }}>
                                            {
                                                translationDirection === 'ja-ko' ?
                                                    bunIds[currentBunId].jaBId !== null &&  bunIds[currentBunId].jaText !== value && 
                                                    <UpdateBunJaTextModalComp jaBId={bunIds[currentBunId].jaBId} jaText={bunIds[currentBunId].jaText} defaultValue={value} refetchHandles={refetchHandles} cancelEdit={cancelEdit} />
                                                :
                                                    bunIds[currentBunId].koText !== value &&
                                                    <Button onClick={() => { updateHonyaku(videoId, bunIds[currentBunId].ytBId, value) }}>{t('BUTTON.MODIFY')}</Button>

                                            }
                                            <DeleteBunModalComp ytBId={bunIds[currentBunId].ytBId} cancelEdit={cancelEdit} />
                                            <Tooltip title={t('TOOLTIP.SHIFT_ENTER')}>
                                                <Button type="primary" onClick={cancelEdit}>{t('BUTTON.CANCLE')}</Button>
                                            </Tooltip>
                                        </Flex>
                                    </>
                            }
                        </>
                    }
                </div>
            </div>
        </>
    )
}