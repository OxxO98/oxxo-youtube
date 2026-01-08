import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next'

//Context
import { AudioContext } from 'shared/contexts/AudioContext';
import { FilteredDataContext } from 'shared/contexts/FilteredDataContext';
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useTimeStamp } from 'shared/lib/useTimeStamp';

//lib
import { useCanvas } from '../lib/useCanvas';
import { useRange } from '../lib/useRange';

//ui
import { HelpModal } from './HelpModal';

//CSS@antD
import { Slider, Button, Space, Input, Skeleton } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'

//Redux
import { useAppSelector, useAppDispatch, reactPlayerActions } from 'shared/store';
const { setStartTime, setEndTime } = reactPlayerActions;

interface AudioWaveCompProps {
    videoTime : number;
    gotoTime : ( time : number, playBool : boolean | null ) => void;
    autoStop : AutoStop;
    playing : boolean; 
    handlePausePlay : ( playing : boolean ) => void;
}

const AudioWaveComp = ({ videoTime, gotoTime, autoStop, playing, handlePausePlay } : AudioWaveCompProps ) => {
    
    //i18n
    const { t } = useTranslation('AudioWaveComp');

    //Context
    const { frameRate } = useContext(VideoContext);
    const { audioLoaded } = useContext(AudioContext);
    const filteredData = useContext(FilteredDataContext);
    
    //Redux
    const { startTime, endTime, selectMarker, markerTime } = useAppSelector((state) => state.reactPlayer)

    const dispatch = useAppDispatch();

    //Ref
    const mouseDownStartTime = useRef<number | null>(startTime);

    //Hook
    const { floorFrame, timeToFrameStamp } = useTimeStamp();

    //lib
    const { range, setRange } = useRange(filteredData, frameRate, videoTime, playing);
    const { divBox, canvas, canvasWidth, canvasHeight } = useCanvas( frameRate, videoTime, startTime, endTime, selectMarker, markerTime, filteredData, range );

    //Handle
    const zoomIn = () => {
        if(filteredData !== null && range !== null){
        let [start, end] = range;
        let _time = Math.floor(videoTime*frameRate);

        let _start = start + ((_time - start)/2);
        let _end = end - ((end - _time)/2);
        
        let _nextZoom = (end-start)/2;
            if(_nextZoom > frameRate ){
                setRange([ _start, _end ]);
            }
        }
    }

    const zoomOut = () => {
        if(filteredData !== null && range !== null){
            let [start, end] = range;
            let _start = start - ((end - start)/2);
            let _end = end + ((end - start)/2);
            let _nextZoom = (end-start)*2;
            if( _nextZoom < filteredData.length ){
                _end = Math.min( _end, filteredData.length-1 );
                _start = Math.max( _start, 0 );
                setRange([ _start, _end ]);
            }
            else{
                setRange([0, filteredData.length-1])
            }
        }
    }

    const onWheelFunction = (e : React.WheelEvent) => {
        if(!filteredData) return;
        
        if(canvas.current === null){
            return;
        }

        if( range === null ) return;

        let [ _start, _end ] = range;
        let _move = Math.floor( (_end - _start)/16 );

        if(e.shiftKey === false){
            if(e.deltaY > 0){
                zoomOut();
            }
            else{
                zoomIn();
            }
        }
        else{
            if(e.deltaY < 0){
                if( _start-_move >= 0 ){
                    setRange([range[0] - _move, range[1] - _move]);
                }
            }
            else{
                if( _end + _move <= filteredData.length ){
                    setRange([range[0] + _move, range[1] + _move]);
                }
            }
        }
    }

    const onMouseDownFunction = (e : React.MouseEvent) => {
        if(canvas.current === null){
            return;
        }

        if(range === null) return;

        let [ _start, _end ] = range;
        let _zoom = _end - _start;

        let rect = canvas.current.getBoundingClientRect();
        let x = e.clientX - rect.left;

        if(filteredData !== null){
            mouseDownStartTime.current = floorFrame( Number(_start/frameRate) + Number(_zoom/frameRate*x/rect.width), frameRate );
        }
    }

    const onMouseUpFunction = (e : React.MouseEvent) => {
        if(canvas.current === null){
            return;
        }
        
        if(range === null) return;

        let [ _start, _end ] = range;
        let _zoom = _end - _start;

        let rect = canvas.current.getBoundingClientRect();
        let x = e.clientX - rect.left;

        if(filteredData !== null && mouseDownStartTime.current !== null){
            let mouseUpEndTime = Number(_start/frameRate) + Number(_zoom/frameRate*x/rect.width);

            if( Math.abs( mouseUpEndTime - mouseDownStartTime.current ) > 10/frameRate ){
                if( mouseDownStartTime.current < mouseUpEndTime ){
                    dispatch(setStartTime( mouseDownStartTime.current ));
                    dispatch(setEndTime( floorFrame( mouseUpEndTime, frameRate ) ));
                }
                else{
                    dispatch(setStartTime( floorFrame( mouseUpEndTime, frameRate ) ));
                    dispatch(setEndTime( mouseDownStartTime.current ));
                }
            }
        }
    }

    const onDoubleClickFunction = (e : React.MouseEvent) => {
        dispatch(setStartTime( 0 ));
        dispatch(setEndTime( 0 ));
    }

    const seekByAudioWave = (e : React.MouseEvent) => {
        if(canvas.current === null){
            return;
        }
        
        if(range === null) return;

        let [ _start, _end ] = range;
        let _zoom = _end - _start;
        
        let rect = canvas.current.getBoundingClientRect();
        let x = e.clientX - rect.left;

        if(filteredData !== null){
            let seekTime = floorFrame(_start/frameRate + _zoom/frameRate*x/rect.width, frameRate);
            gotoTime(seekTime, null);
        }
    }

    const changeRange = ( value : number[] ) => {
        setRange(value);
        
        if( playing === true){
            handlePausePlay(false);
        }
    }

    return (
        <div ref={divBox}>
        {
            filteredData === null &&
            <>
            {
                audioLoaded === false &&
                <div style={{ width : canvasWidth, height : canvasHeight}}>
                    <Skeleton.Node active={true} style={{ width : canvasWidth, height : canvasHeight}}/>
                </div>
            }
            </>
        }
        {
            filteredData !== null &&
            <div>
                <canvas ref={canvas} id="waveComp" width={canvasWidth} height={canvasHeight}
                    onClick={(e) => seekByAudioWave(e)}
                    onWheel={(e) => onWheelFunction(e)}
                    onMouseDown={(e) => onMouseDownFunction(e)}
                    onMouseUp={(e) => onMouseUpFunction(e)}
                    onDoubleClick={(e) => onDoubleClickFunction(e)}>
                </canvas>
                <div>
                    {
                        range !== null &&
                        <Slider range={{ draggableTrack: true }} defaultValue={[0, filteredData.length-1]} value={range} min={0} max={filteredData.length-1} onChange={changeRange}/>
                    }
                </div>
            </div>
        }
        {
            filteredData !== null &&
            <div>
                <Space>
                    <Button type={ playing ? 'primary' : 'default' }>{t('BUTTON.PLAYING')}</Button>
                    <Button type={ autoStop.set ? 'primary' : 'default' }>{t('BUTTON.SCRATCH')}</Button>
                    <Input value={ timeToFrameStamp(videoTime, frameRate) }/>
                    <Button onClick={zoomIn}><ZoomInOutlined /></Button>
                    <Button onClick={zoomOut}><ZoomOutOutlined /></Button>
                    <HelpModal/>
                </Space>
            </div>
        }
        </div>
    )
}

export { AudioWaveComp };
