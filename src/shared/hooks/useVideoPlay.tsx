import { useEffect, useState, useContext, useCallback } from 'react';

//Hooks
import { useDebounce } from 'shared/hooks/useDebounce';
import { VideoContext } from 'shared/contexts/VideoContext';
import { useTimeStamp } from 'shared/lib/useTimeStamp';

//Redux
import { useAppSelector, useAppDispatch, reactPlayerActions } from 'shared/store';
const { setStartTime, setEndTime, selectMarkerStart, selectMarkerEnd, unselectMarker, setMarkerTime } = reactPlayerActions;

const DEBOUNCE_TIME_MS = 200;
/**
 * 비디오 재생 컨트롤 Hook
 * 
 * @param playing React-player의 재생상태
 * @param setPlaying React-player의 재생상태 설정 함수 handlePausePlay
 * @param state React-player의 전체상태
 * @param handleSeek React-player의 재생 이동 함수 handleSeek
 * @param filteredData filteredData - 정규화된 오디오 데이터 (좌/우 채널)
 * @returns 
 */
function useVideoPlayHook( 
    playing : boolean, setPlaying : (playing : boolean) => void,
    state : ReactPlayerState,
    handleSeek : ( time : number ) => void,
    filteredData : FilteredData | null = null
){
    //Context
    const { frameRate : frame } = useContext(VideoContext);

    //State
    const [autoStop, setAutoStop] = useState<AutoStop>({
        set : false,
        startOffset : 0,
        endOffset : 0,
        loop : false
    });

    //Redux
    const { selectMarker, startTime, endTime, markerTime } = useAppSelector((state) => state.reactPlayer);

    const dispatch = useAppDispatch();

    const { duration, playedSeconds } = state;

    //Hook
    const { floorFrame } = useTimeStamp();

    const debounce = useDebounce();

    //Handle
    /**
     * 원하는 시간으로 이동
     * playBool로 재생상태 변경 가능
     * playBool이 null일 경우는 재생상태 변경 없음
     */
    const gotoTime = useCallback( (time : number, playBool : boolean | null) => {
        if(playedSeconds !== time){
            handleSeek(time);
        }
        if(playBool !== null){
            setPlaying(playBool);
        }
    }, [handleSeek, playedSeconds, setPlaying])

    /**
     * 자동으로 멈출 지점을 설정하고, startOffset으로 이동
     */
    const setScratch = useCallback( (set : boolean, startOffset : number, endOffset : number, loop : boolean) => {
        //autoStop은 played*duration의 형식, seconds
        if(set === true){
            handleSeek(startOffset);
        }

        setAutoStop((prev) => ({
            set : set,
            startOffset : startOffset,
            endOffset : endOffset,
            loop : loop
        }));
        
        if(set === true){
            if(playing === false){
                setPlaying(true);
            }
        }
        else{
            if(playing === true){
                setPlaying(false);
            }
        }
    }, [handleSeek, playing, setPlaying])

    /**
     * 반복 설정
     */
    const loop = () => {
        if(startTime === null || endTime === null){
            return;
        }

        if(autoStop.loop === false){
            handleSeek(startTime);
            setScratch(true, startTime, endTime, true);
        }
        else{
            setScratch(false, 0, 0, false);
        }
    }

    /**
     * 재생 멈춤 및 재생 handle
     */
    const pauseYT = () => {
        if(playing === true){
            //일단 markerTime 처럼 재생
            dispatch( setMarkerTime(playedSeconds) );
            setPlaying(false);
        }
        else{
            setPlaying(true);
        }
    }

    /**
     * 이전 프레임으로 이동
     * 일단 현재 상태로는 play중에는 마커만 변경되서 그냥 두번 누를때 씹힐수 있음
     */
    const prevFrame = useCallback( () => {
        if(playedSeconds - 1/frame < 0){
            return;
        }

        if(markerTime !== null && playing === true){
            dispatch( setMarkerTime(markerTime - 1/frame) );
            gotoTime(markerTime, true);
        }
        else if( selectMarker !== null){
            if( selectMarker === 'startTime' && startTime !== null && endTime !== null && startTime > 0 ){
                let _startTime = floorFrame(startTime-(1/frame), frame);
                let _scratchEnd = Math.abs(endTime - startTime) > 1 ? _startTime + 1 : endTime;

                dispatch(setStartTime( _startTime ));
                gotoTime(_startTime, true);
                setScratch(true, _startTime, floorFrame( _scratchEnd, frame ), false);
            }
            else if( selectMarker === 'endTime' && startTime !== null && endTime !== null && endTime > 0 ){
                let _endTime = floorFrame(endTime-(1/frame), frame);

                dispatch(setEndTime( _endTime ));
                gotoTime(_endTime, false);
                setScratch(true, _endTime, floorFrame( _endTime+(4/frame), frame ), false);
            }
        }
        else{
            if(autoStop.set === false){
                let _curr = floorFrame(playedSeconds, frame);
                let _prev = floorFrame(_curr - 1/frame, frame);

                setScratch(true, _prev, playedSeconds, false);
            }
            else{
                setScratch(true, autoStop.startOffset - 1/frame, autoStop.startOffset, false);
            }
        }
    }, [autoStop.set, autoStop.startOffset, endTime, floorFrame, gotoTime, playedSeconds, playing, selectMarker, setScratch, startTime, frame, markerTime])

    /**
     * prevFrame의 debounce버전
     */
    const debouncedPrev = debounce( prevFrame, DEBOUNCE_TIME_MS);

    /**
     * 다음 프레임으로 이동
     */
    const nextFrame = useCallback( () => {
        if(playedSeconds + 1/frame > duration){
            return;
        }

        if(markerTime !== null && playing === true){
            dispatch( setMarkerTime(markerTime + 1/frame) );
            gotoTime(markerTime, true);
        }
        else if(selectMarker !== null){
            if(selectMarker === 'startTime' && startTime !== null && endTime !== null && endTime < duration ){
                let _startTime = floorFrame(startTime+(1/frame), frame);
                let _scratchEnd = Math.abs(endTime - startTime) > 1 ? _startTime + 1 : endTime;

                dispatch(setStartTime( _startTime ));
                gotoTime( _startTime, true);
                setScratch(true, _startTime, floorFrame( _scratchEnd, frame ), false);
            }
            else if(selectMarker === 'endTime' && startTime !== null && endTime !== null && endTime < duration ){
                let _endTime = floorFrame(endTime+(1/frame), frame);
                
                dispatch(setEndTime( _endTime ));
                gotoTime(_endTime, false);
                setScratch(true, _endTime, floorFrame( _endTime+(4/frame), frame ), false);
            }
        }
        else{
            if( autoStop.set === false){
                let _curr = floorFrame(playedSeconds, frame);
                let _next = floorFrame(_curr + 1/frame, frame);
                let _end = floorFrame(_curr + 2/frame, frame);

                setScratch(true, _next, _end, false);
            }
            else{
                setScratch(true, autoStop.startOffset + 1/frame, autoStop.startOffset + 2/frame, false);
            }
        }
    }, [autoStop.set, autoStop.startOffset, endTime, floorFrame, gotoTime, playedSeconds, playing, selectMarker, setScratch, startTime, frame, duration, markerTime])

    /**
     * nextFrame의 debounce버전
     */
    const debouncedNext = debounce( nextFrame, DEBOUNCE_TIME_MS);

    /**
     * range범위에서 오디오가 앞뒤에 비해 작은 지점을 반환
     * range범위 안에 없으면 현재 시간 반환
     */
    const getPrevAutoMarkerPoint = useCallback( (time : number, range : number) => {
        let rangePointIndex = floorFrame(time, frame)*frame;
        let rangePrevIndex = rangePointIndex - range*frame;
        
        if(filteredData !== null){
            let _r = filteredData.right.filter( (v, index) => ( rangePrevIndex < index && index <= rangePointIndex ) ).reverse();
            
            for( let i = 1; i < _r.length-1; i++ ){
                if( _r[i-1] > _r[i] && _r[i+1] > _r[i] ){
                    return floorFrame(time - i/frame, frame);
                }
            }
        }
        return time;
    }, [filteredData, floorFrame, frame])

    /**
     * range범위에서 오디오가 앞뒤에 비해 작은 지점을 반환
     * range범위 안에 없으면 현재 시간 반환
     */
    const getNextAutoMarkerPoint = useCallback( (time : number, range : number) => {
        let rangePointIndex = floorFrame(time, frame)*frame;
        let rangeNextIndex = rangePointIndex + range*frame;

        if(filteredData !== null){
            let _r = filteredData.right.filter( (arr, index) => ( rangePointIndex <= index && index < rangeNextIndex ) );

            for( let i = 1; i < _r.length-1; i++ ){
                if( _r[i-1] > _r[i] && _r[i+1] > _r[i] ){
                    return floorFrame(time + i/frame, frame);
                }
            }
        }
        
        return time;
    }, [filteredData, floorFrame, frame])

    /**
     * 1초전으로 이동
     */
    const prevSec = useCallback( () => {
        let sec = playedSeconds;

        if(playedSeconds - 1 < 0){
            gotoTime(0, false);
            return;
        }

        if(markerTime !== null && playing === true){
            dispatch( setMarkerTime(markerTime - 1/frame) );
            gotoTime(markerTime, true);
        }
        else if(selectMarker !== null){
            if(selectMarker === 'startTime' && startTime && endTime){
                let autoMarkerPoint = getPrevAutoMarkerPoint( startTime, 1 );
                dispatch(setStartTime(autoMarkerPoint));
                gotoTime(autoMarkerPoint, true);
                setScratch(true, autoMarkerPoint, endTime, false);
            }
            else if(selectMarker === 'endTime' && startTime && endTime){
                let autoMarkerPoint = getPrevAutoMarkerPoint( endTime, 1 );
                dispatch(setEndTime( autoMarkerPoint ));
                gotoTime(startTime, true);
                setScratch(true, startTime, autoMarkerPoint, false);
            }
        }
        else{
            if(autoStop.set === false){
                let _curr = floorFrame(sec, frame);
                let _prev = floorFrame(_curr-1, frame);
                let _end = floorFrame(_prev + (4/frame), frame);

                setScratch(true, _prev, _end, false);
            }
            else{
                gotoTime( floorFrame(autoStop.startOffset-1, frame), false )
            }
        }
    }, [autoStop.set, autoStop.startOffset, endTime, floorFrame, frame, gotoTime, playedSeconds, playing, selectMarker, setScratch, startTime, getPrevAutoMarkerPoint, markerTime])

    /**
     * 1초 후로 이동
     */
    const nextSec = useCallback( () => {
        let sec = playedSeconds;

        if(playedSeconds + 1 > duration){
            gotoTime(duration, false);
            return;
        }

        if(markerTime !== null && playing === true){
            dispatch( setMarkerTime(markerTime + 1/frame) );
            gotoTime(markerTime, true);
        }
        else if(selectMarker !== null){
            if(selectMarker === 'endTime' && startTime && endTime){
                let autoMarkerPoint = getNextAutoMarkerPoint( endTime, 1);
                dispatch(setEndTime( autoMarkerPoint ));
                gotoTime(startTime, true);
                setScratch(true, startTime, autoMarkerPoint, false);
            }
            else if(selectMarker === 'startTime' && startTime && endTime){
                let autoMarkerPoint = getNextAutoMarkerPoint( startTime, 1);
                dispatch(setStartTime( autoMarkerPoint ));
                gotoTime(autoMarkerPoint, true);
                setScratch(true, autoMarkerPoint, endTime, false);
            }
        }
        else{
            if(autoStop.set === false){
                let _curr = floorFrame(sec, frame);
                let _next = floorFrame(_curr+1, frame);
                let _end = floorFrame(_next + (4/frame), frame);

                setScratch(true, _next, _end, false);
            }
            else{
                gotoTime( floorFrame(autoStop.startOffset+1, frame), false )
            }
        }
    }, [autoStop.set, autoStop.startOffset, endTime, floorFrame, frame, gotoTime, playedSeconds, playing, selectMarker, setScratch, startTime, duration, getNextAutoMarkerPoint, markerTime])

    /**
     * marker를 startTime으로 지정
     * 다시 지정시 marker해제
     */
    const selectStartTime = () => {
        if(selectMarker !== 'startTime' && startTime !== null){
            gotoTime(startTime, null);
            dispatch(selectMarkerStart())
        }
        else{
            dispatch(unselectMarker());
        }
    }

    /**
     * marker를 endTime으로 지정
     * 다시 지정시 marker해제
     */
    const selectEndTime = () => {
        if(selectMarker !== 'endTime' && endTime !== null){
            gotoTime(endTime, null);
            dispatch(selectMarkerEnd());
        }
        else{
            dispatch(unselectMarker());
        }
    }

    /**
     * 현재 시간을 startTime으로 설정
     * frame perfect time
     */
    const markStart = () => {
        dispatch( setStartTime( floorFrame( playedSeconds, frame) ) );
    }

    /**
     * 현재 시간을 endTime으로 설정
     * frame perfect time
     */
    const markEnd = () => {
        dispatch( setEndTime( floorFrame( playedSeconds, frame) ) );
    }

    /**
     * marker를 현재 시간으로 설정한 뒤 재생
     * marker는 prev, next의 형태로 이동 가능
     * 멈췄을 경우에는 초기화
     */
    const markerPlay = () => {
        dispatch( unselectMarker() );
        
        if(playing === false){
            //pause
            dispatch( setMarkerTime(playedSeconds) );
            setPlaying(true);
        }
        else{
            if(markerTime !== null){
                gotoTime(markerTime, true);
            }
        }
    }

    /**
     * 현재 endTime을 starTime으로 설정한뒤 재생
     * 다시 사용할 경우, endTime을 설정한 뒤 멈춤
     */
    const nextMarkerPlay = () => {
        if(playing === false){
            if(endTime !== null){
                dispatch(setStartTime( endTime ));
                dispatch(setEndTime(null));
                dispatch(unselectMarker());
                gotoTime(endTime, null);
                setPlaying(true);
            }
            else{
                dispatch(setStartTime( floorFrame( playedSeconds, frame) ));
                dispatch(setEndTime(null));
                dispatch(unselectMarker());
                setPlaying(true);
            }
        }
        else{
            dispatch(setEndTime( floorFrame( playedSeconds, frame) ));
            setPlaying(false);
        }
    }

    /**
     * marker로 설정된 시간으로 이동 후 멈춤
     */
    const markerStop = () => {
        if(markerTime !== null){
            gotoTime(markerTime, false);
        }
        setPlaying(false);
    }

    /**
     * autoStop범위를 넘었는지 체크
     */
    const checkAutoStop = useCallback( ( playedSeconds : number ) => {
        if(autoStop.set === true){
            if(playedSeconds > autoStop.endOffset){
                if(autoStop.loop === false){
                    handleSeek(autoStop.startOffset);
                    setScratch(false, 0, 0, false);
                }
                else{
                    handleSeek(autoStop.startOffset);
                }
            }
        }
    }, [handleSeek, setScratch, autoStop.set, autoStop.startOffset, autoStop.endOffset, autoStop.loop])


    //Effect
    useEffect(()=>{
        checkAutoStop(playedSeconds);
    }, [checkAutoStop, playedSeconds]);

    useEffect( () => {
        if(playing === false){
            dispatch( setMarkerTime(null) );
            setScratch(false, 0, 0, false);
        }
    }, [playing, setScratch])

    useEffect( () => {
        if(endTime !== null){
            if(startTime !== null){
                if(startTime > endTime){
                    dispatch(setEndTime( startTime ));
                    dispatch(setStartTime( endTime ));
                }
            }
        }
    }, [startTime, endTime])

    const keyboard = {
        pauseYT : pauseYT,
        prevSec : prevSec,
        nextSec : nextSec,
        prevFrame : debouncedPrev,
        nextFrame : debouncedNext,
        gotoTime : gotoTime,
        markStart : markStart,
        markEnd : markEnd,
        selectStartTime : selectStartTime,
        selectEndTime : selectEndTime,
        markerPlay : markerPlay,
        markerStop : markerStop,
        loop : loop,
        nextMarkerPlay : nextMarkerPlay
    }

    const videoPlayerHandles = {
        gotoTime : gotoTime,
        setScratch : setScratch,
        keyboard : keyboard,
        autoStop : autoStop
    }

    return { gotoTime, loop, pauseYT, prevFrame : debouncedPrev, nextFrame : debouncedNext, prevSec, nextSec, setScratch, markerPlay, keyboard, autoStop, setAutoStop, selectStartTime, selectEndTime, selectMarker, videoPlayerHandles }
}

export { useVideoPlayHook }
