import React, { useEffect, useState, useRef, useContext, CSSProperties, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

//Components
import Bun from 'components/Bun';
import { HonyakuComp, HonyakuRepresentive } from 'components/HonyakuComp';
import { UpdateBunJaTextModalComp, DeleteBunModalComp } from 'components/BunModalComp'

//Contexts
import { VideoContext } from 'contexts/VideoContext';

//Hook
import { useHandleKeyboard } from 'hooks/VideoPlayHook';
import { useAxiosGet } from 'hooks/AxiosHook';
import { useSelectEdit } from 'hooks/SelectHook'

//Redux
import { store } from 'reducers/store';
import { reactPlayerActions } from 'reducers/reactPlayerReducer';
import { selectionActions } from 'reducers/selectionReducer';

//CSS@antD
import { Input, Button, Flex } from 'antd';
import { StepBackwardOutlined, StepForwardOutlined, RollbackOutlined } from '@ant-design/icons'

//Redux
const { setStartTime, setEndTime } = reactPlayerActions;
const { setSelectedBun, clear } = selectionActions;

interface TimelineCarouselCompProps {
    state : ReactPlayerState;
    playerHandles : PlayerHandles;
    bIdRef : React.RefObject<BIdRef>;
    refetchHandles : RefetchHandles;
    videoPlayerHandles : VideoPlayerHandles;
}

const TimelineControlstyle : CSSProperties = {
    height : '70px',
    alignContent : 'center'
}

const TimelineBunStyle : CSSProperties = {
    minHeight : '35px',
    alignContent : 'center'
}

const TranslateControlstyle : CSSProperties = {
    margin : '16px'
}

const TranslateBunStyle : CSSProperties = {
    minHeight : '35px',
    alignContent : 'center'
}

const TimelineCarouselComp = ({ state, playerHandles, bIdRef, refetchHandles, videoPlayerHandles } : TimelineCarouselCompProps) => {
    
    const { t } = useTranslation('TimelineCarouselComp');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [editYtbId, setEditYtbId] = useState<string | null>(null);
    const [value, setValue] = useState<string>(''); //입력 Input

    const [bunIds, setBunIds] = useState<RES_GET_TIMELINE | null>(null);
    const currentTimelineBun = useRef<Array<HTMLDivElement | null>>([]);

    const [currentBunId, setCurrentBunId] = useState(0);

    const { playedSeconds } = state;

    const { setScratch, gotoTime, keyboard } = videoPlayerHandles;
    
    const customKeyboard = [
        { key : 'ArrowRight', action : () => { nextTimeLine() } },
        { key : 'ArrowLeft', action : () => { prevTimeLine() } }
    ]
    const filteredKeyboard = {
        pauseYT : keyboard.pauseYT,
        prevSec : keyboard.prevSec, 
        nextSec : keyboard.nextSec,
        prevFrame : keyboard.prevFrame,
        nextFrame : keyboard.nextFrame,
        markerPlay : keyboard.markerPlay,
        markerStop : keyboard.markerStop,
        loop : keyboard.loop
    }
    useHandleKeyboard({ ...filteredKeyboard, custom : customKeyboard }); //autoKeyboard는 나중에 추가 바람.
    
    const { response : resGetTimeLine, fetch : refetchTimeline } = useAxiosGet<RES_GET_TIMELINE, REQ_GET_TIMELINE>('/db/timeline', false, { videoId : videoId });


    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    //Handle
    const cancelEdit = useCallback( () => {
        store.dispatch( setStartTime(0) );
        store.dispatch( setEndTime(0) );
        setValue('');
        setEditYtbId(null);
    }, [])

    //Handle @timeline
    const prevTimeLine = () => {
        if( bunIds === null ){
            return;
        }

        store.dispatch( clear() );

        if(currentBunId > 0){
            let curr = bunIds[currentBunId-1];
            //setScratch(true, curr.startTime, curr.endTime, false);
            gotoTime(curr.startTime, null);

            setCurrentBunId(currentBunId-1);
        }
    }

    const nextTimeLine = () => {
        if( bunIds === null ){
            return;
        }

        store.dispatch( clear() );
        
        if(currentBunId+1 < bunIds.length){
            let curr = bunIds[currentBunId+1];
            //setScratch(true, curr.startTime, curr.endTime, false);
            gotoTime(curr.startTime, null);

            setCurrentBunId(currentBunId+1);
        }
    }

    const currentTimeLine = () => {
        if( bunIds === null ){
            return;
        }
        
        let curr = bunIds[currentBunId];
        setScratch(true, curr.startTime, curr.endTime, false);
    }

    const getCurrentTimeLine = useCallback( () => {
        if( bunIds === null ){
            return null;
        }

        let a = bunIds.findIndex( (arr) =>
            arr.startTime <= playedSeconds &&
            playedSeconds < arr.endTime
        );
        let b = bunIds.findIndex( (arr) =>
            arr.startTime === playedSeconds
        );
        
        if( a !== -1 ){
            if( b !== -1 ){
                return b;
            }
            else{
                return a;
            }
        }
        return null;
    }, [bunIds, playedSeconds]);

    const moveCurrentTimeLine = useCallback( () => {
        if(playedSeconds !== null){
            if(bunIds !== null){
                let curTL = getCurrentTimeLine();
                if( curTL !== null){
                    setCurrentBunId( curTL );
                }
            }
        }
    }, [playedSeconds, bunIds, getCurrentTimeLine])
    
    useEffect( () => {
        let res = resGetTimeLine;
        if(res !== null){
            setBunIds(res.data)
        }
    }, [resGetTimeLine])

    useEffect( () => {
        moveCurrentTimeLine();
    }, [playedSeconds, bunIds, moveCurrentTimeLine])

    
    useEffect( () => {
        if( bunIds && bunIds.length !== 0 ){
            setEditYtbId(null);
            cancelEdit();

            let curr = bunIds[currentBunId];
            store.dispatch( setStartTime( curr.startTime ) );
            store.dispatch( setEndTime( curr.endTime ) );
        }
    }, [bunIds, currentBunId, cancelEdit])
    
    
    return(
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
                    bunIds !== null && bunIds.length !== 0 &&
                    <>
                        {
                        editYtbId === null ?
                        <>
                            <div className="jaText" id="activeRange" style={TimelineBunStyle}>
                                <Bun key={bunIds[currentBunId].jaBId} bId={bunIds[currentBunId].jaBId} bIdRef={bIdRef}/>
                            </div>
                            <Flex justify='flex-end' align='center' gap={8} style={{ padding : '8px' }}>
                                <Button onClick={
                                    () => {
                                        setEditYtbId(bunIds[currentBunId].ytBId);
                                        setValue(bunIds[currentBunId].jaText);
                                    }
                                }>{t('BUTTON.MODIFY')}</Button>
                            </Flex>
                        </>
                        :
                        <>
                            <Input type="text" value={value} onChange={handleChange} style={{ ...TimelineBunStyle, marginLeft : 'auto', width : 'calc(100% - 16px)' }}/>
                            <Flex justify='flex-end' align='center' gap={8} style={{ padding : '8px' }}>
                                {
                                    bunIds[currentBunId].jaText !== value &&
                                    <UpdateBunJaTextModalComp ytb={bunIds[currentBunId]} defaultValue={value} refetchHandles={refetchHandles} refetchTimeline={refetchTimeline} cancelEdit={cancelEdit}/>
                                }
                                <DeleteBunModalComp ytb={bunIds[currentBunId]} refetchTimeline={refetchTimeline} cancelEdit={cancelEdit}/>
                                <Button type="primary" onClick={cancelEdit}>{t('BUTTON.CANCLE')}</Button>
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

const TimelineCarouselHonyakuComp = ({ state, playerHandles, bIdRef, refetchHandles, videoPlayerHandles } : TimelineCarouselCompProps ) => {

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [editYtbId, setEditYtbId] = useState<string | null>(null); //사용하지 않는 것으로 보임
    const [value, setValue] = useState<string>(''); //입력 Input, 사용하지 않는 것으로 보임

    const [bunIds, setBunIds] = useState<RES_GET_TIMELINE | null>(null);
    const currentTimelineBun = useRef<Array<HTMLDivElement | null>>([]); //사용하지 않는 것으로 보임

    const [currentBunId, setCurrentBunId] = useState(0);

    const { playedSeconds } = state;
    
    //@honyaku
    const { edit : honyakuEdit, handleSelect : honyakuHandleSelect, clearEdit : honyakuClearEdit } = useSelectEdit();

    const { gotoTime, keyboard } = videoPlayerHandles;
    
    const customKeyboard = [
        { key : 'ArrowRight', action : () => { nextTimeLine( )} },
        { key : 'ArrowLeft', action : () => { prevTimeLine() } }
    ]
    const filteredKeyboard = {
        pauseYT : keyboard.pauseYT,
        prevSec : keyboard.prevSec, 
        nextSec : keyboard.nextSec,
        prevFrame : keyboard.prevFrame,
        nextFrame : keyboard.nextFrame,
        markerPlay : keyboard.markerPlay,
        markerStop : keyboard.markerStop,
        loop : keyboard.loop
    }
    useHandleKeyboard({ ...filteredKeyboard, custom : customKeyboard }); //autoKeyboard는 나중에 추가 바람.
    
    const { response : resGetTimeLine } = useAxiosGet<RES_GET_TIMELINE, REQ_GET_TIMELINE>('/db/timeline', false, { videoId : videoId });

    
    //handle
    const cancelEdit = useCallback( () => {
        store.dispatch( setStartTime(0) );
        store.dispatch( setEndTime(0) );
        setValue('');
        setEditYtbId(null);

        honyakuClearEdit();
    }, [honyakuClearEdit])

    //Handle @timeline
    const prevTimeLine = () => {
        if( bunIds === null ){
            return;
        }

        store.dispatch( clear() );

        if(currentBunId > 0){
            let curr = bunIds[currentBunId-1];
            gotoTime(curr.startTime, null);

            setCurrentBunId(currentBunId-1);
        }
    }

    const nextTimeLine = () => {
        if( bunIds === null ){
            return;
        }

        store.dispatch( clear() );
        
        if(currentBunId+1 < bunIds.length){
            let curr = bunIds[currentBunId+1];
            gotoTime(curr.startTime, null);

            setCurrentBunId(currentBunId+1);
        }
    }

    const getCurrentTimeLine = useCallback( () => {
        if( bunIds === null ){
            return null;
        }

        let a = bunIds.findIndex( (arr) =>
            arr.startTime <= playedSeconds &&
            playedSeconds < arr.endTime
        );
        let b = bunIds.findIndex( (arr) =>
            arr.startTime === playedSeconds
        );
        
        if( a !== -1 ){
            if( b !== -1 ){
                return b;
            }
            else{
                return a;
            }
        }
        return null;
    }, [bunIds, playedSeconds])

    const moveCurrentTimeLine = useCallback( () => {
        if(playedSeconds !== null){
            if(bunIds !== null){
                let curTL = getCurrentTimeLine();
                if( curTL !== null){
                    setCurrentBunId( curTL );
                }
            }
        }
    }, [playedSeconds, bunIds, getCurrentTimeLine])
    
    useEffect( () => {
        let res = resGetTimeLine;
        if(res !== null){
            setBunIds(res.data)
        }
    }, [resGetTimeLine])

    useEffect( () => {
        moveCurrentTimeLine();
    }, [playedSeconds, moveCurrentTimeLine])

    
    useEffect( () => {
        if( bunIds && bunIds.length !== 0 ){
            setEditYtbId(null);
            cancelEdit();

            let curr = bunIds[currentBunId];
            store.dispatch( setStartTime( curr.startTime ) );
            store.dispatch( setEndTime( curr.endTime ) );
            store.dispatch( setSelectedBun( bunIds[currentBunId].jaBId ) );
        }
    }, [bunIds, currentBunId, cancelEdit])

    useEffect( () => {
        if( bunIds && bunIds.length !== 0 ){
            store.dispatch( setSelectedBun( bunIds[0].jaBId ) );
        }
    }, [bunIds])
    
    
    return(
        <>
            <div>
                <div>
                    <div style={TranslateControlstyle}>
                    {
                        bunIds !== null && bunIds.length !== 0 &&
                        <>
                            <div className="jaText" id="activeRange" style={TimelineBunStyle}>
                                <Bun key={bunIds[currentBunId].jaBId} bId={bunIds[currentBunId].jaBId} bIdRef={bIdRef}/>
                            </div>
                            <div style={TranslateBunStyle}>
                            {
                                honyakuEdit === false ?
                                    <HonyakuRepresentive ytBId={bunIds[currentBunId].ytBId} handleSelect={honyakuHandleSelect} bIdRef={bIdRef}/>
                                :
                                    <HonyakuComp ytBId={bunIds[currentBunId].ytBId} clearEdit={honyakuClearEdit} bIdRef={bIdRef}/>
                            }
                            </div>
                        </>
                    }
                    </div>
                </div>
            </div>
        </>
    )
}

TimelineCarouselComp.Honyaku = TimelineCarouselHonyakuComp

export { TimelineCarouselComp }