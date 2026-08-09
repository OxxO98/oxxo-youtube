import { useState, useRef, useCallback, useEffect } from 'react';

import { useAppSelector } from 'shared/store'

import { useTimeStamp } from 'shared/lib/useTimeStamp';

const DEFUALT_CANVAS_WIDTH = 700;

const BACKGROUND_COLOR = '#111111'
const START_END_COLOR = '#ffffff';
const WAVE_FORM_COLOR = '#bf4040bb';

const CURRENT_MARKER_COLOR = '#BF4040'
const SELECT_MARKER_COLOR = '#cabd00'

const MARKER_TIME_COLOR = '#BF4040'
const INVERT_MARKER_TIME_COLOR = '#ffffff'

const FRAME_RULER_DARK = '#bf4040bb';
const FRAME_RULER_GRAY = '#AAAAAAbb'
const FRAME_RULER_WHITE = '#ffffffbb'

const TIMELINE_LINE_COLOR = ['#BF4040', '#414CBF', '#41BF65', '#BFA441'];
const TIMELINE_COLOR = TIMELINE_LINE_COLOR.map( (v) => `${v}22`);

type TimelineWithIndex = RES_TIMELINE & {
    i : number
} 

const CANVAS_HEIGHT = 100;
const FRAME_AREA_HEIGHT = 10;

export function useCanvas(
    frameRate : number,
    videoTime : number,
    startTime : number | null, 
    endTime : number | null, 
    selectMarker : string | null, 
    markerTime : number | null,
    filteredData : FilteredData | null,
    range : number[] | null,
){

    //Redux
    const { bunIds } = useAppSelector( (state) => state.timeline ); 
    
    //Ref    
    const divBox = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const refId = useRef<number>(-1);

    //State
    const [canvasWidth, setCanvasWidth] = useState<number>(DEFUALT_CANVAS_WIDTH)

    //Hook
    const { floorFrame, frameTime, getFrame } = useTimeStamp();

    const _clearCanvas = ( ctx : CanvasRenderingContext2D ) => {
        ctx.clearRect(0, 0, canvasWidth, CANVAS_HEIGHT);
        ctx.fillStyle = BACKGROUND_COLOR; // 캔버스 배경색
        ctx.fillRect(0, 0, canvasWidth, CANVAS_HEIGHT);
    }

    const _drawTimeline = ( ctx : CanvasRenderingContext2D, sampleWidth : number, _start : number, timeline : TimelineWithIndex ) => {
        let _startTime = Math.max( (timeline.startTime * frameRate - _start) * sampleWidth, 0);
        let _endTime = Math.min( (timeline.endTime * frameRate - _start) * sampleWidth, canvasWidth );
        
        ctx.fillStyle = TIMELINE_COLOR[timeline.i%TIMELINE_LINE_COLOR.length];
        ctx.fillRect(_startTime, 0, _endTime-_startTime, CANVAS_HEIGHT)
        
        ctx.fillStyle = TIMELINE_LINE_COLOR[timeline.i%TIMELINE_LINE_COLOR.length];
        if( (timeline.startTime * frameRate - _start) * sampleWidth >= 0 ){
            ctx.fillRect(_startTime, 0, sampleWidth, CANVAS_HEIGHT);
        }
        if( (timeline.endTime * frameRate - _start) * sampleWidth <= canvasWidth ){
            ctx.fillRect(_endTime-sampleWidth, 0, sampleWidth, CANVAS_HEIGHT);
        }        
    }

    const _draw_start_end = ( ctx : CanvasRenderingContext2D, _start : number, sampleWidth : number ) => {
        if(startTime !== null && endTime !== null ){
            //startTime - endTime의 흰배경.
            ctx.moveTo( (startTime*frameRate-_start)*sampleWidth, FRAME_AREA_HEIGHT );
            ctx.fillStyle = START_END_COLOR;
            ctx.fillRect(
                (startTime*frameRate-_start)*sampleWidth, FRAME_AREA_HEIGHT,
                (endTime-startTime)*frameRate*sampleWidth, CANVAS_HEIGHT
            );
        }
        else{
            if(startTime !== null){
                ctx.moveTo( (startTime*frameRate-_start)*sampleWidth, FRAME_AREA_HEIGHT );
                ctx.fillStyle = START_END_COLOR;
                ctx.fillRect(
                    (startTime*frameRate-_start)*sampleWidth, FRAME_AREA_HEIGHT,
                    sampleWidth, CANVAS_HEIGHT
                );
            }
            else if(endTime !== null){
                ctx.moveTo( (endTime*frameRate-_start)*sampleWidth, FRAME_AREA_HEIGHT );
                ctx.fillStyle = START_END_COLOR;
                ctx.fillRect(
                    (endTime*frameRate-_start)*sampleWidth, FRAME_AREA_HEIGHT,
                    sampleWidth, CANVAS_HEIGHT
                );
            }
        }
    }

    const _drawFrameArea = ( ctx : CanvasRenderingContext2D, _zoom : number, _start : number, sampleWidth : number, waveAreaWidth : number ) => {
        if( _zoom < 5*frameRate ){
            let xOffset = 1 - (_start/frameRate - floorFrame(_start/frameRate, frameRate))*frameRate;

            let rangeFrame = frameTime(_start/frameRate, frameRate).frame;
            let zoomLength = Math.floor(_zoom);
            let lastFrameX = 0;

            if(xOffset > 0){
                let currFrame = rangeFrame;
                ctx.fillStyle = currFrame%2 === 0 ? FRAME_RULER_WHITE : FRAME_RULER_GRAY;
                if(currFrame % 10 === 0){
                    ctx.fillStyle = FRAME_RULER_DARK;
                }
                ctx.fillRect(
                    0, 0,
                    sampleWidth*xOffset, 10
                );
                lastFrameX = sampleWidth*xOffset;
            }
            for(let i = 1; i < zoomLength; i++){
                let x = lastFrameX;
                let currFrame = getFrame(rangeFrame + i, frameRate);
                ctx.fillStyle = currFrame%2 === 0 ? FRAME_RULER_WHITE : FRAME_RULER_GRAY;
                if(currFrame % 10 === 0){
                    ctx.fillStyle = FRAME_RULER_DARK;
                }
                ctx.fillRect(
                    x, 0,
                    x+sampleWidth, 10
                );
                lastFrameX = x + sampleWidth;
            }
            if(lastFrameX < waveAreaWidth){
                let currFrame = getFrame(rangeFrame + zoomLength, frameRate);
                ctx.fillStyle = currFrame%2 === 0 ? FRAME_RULER_WHITE : FRAME_RULER_GRAY;
                if(currFrame % 10 === 0){
                    ctx.fillStyle = FRAME_RULER_DARK;
                }
                ctx.fillRect(
                    lastFrameX, 0,
                    waveAreaWidth, 10
                );
                lastFrameX = waveAreaWidth;
            }
        }
        else{
            ctx.fillStyle = FRAME_RULER_GRAY;
            ctx.fillRect(
                0, 0,
                canvasWidth, 10
            );
        }
    }

    const _draw_wave_form = ( ctx : CanvasRenderingContext2D, startHeight : number, waveAreaHeight : number, sampleWidth : number, rangeFilteredData : number[] ) => {
        let lastX = 0;
        
        ctx.beginPath();
        ctx.moveTo(0, FRAME_AREA_HEIGHT+startHeight);
        ctx.strokeStyle = WAVE_FORM_COLOR;
        ctx.fillStyle = WAVE_FORM_COLOR;

        rangeFilteredData.forEach( (sample, index) => {
            let x = sampleWidth * index;
            ctx.lineWidth = 1;
            ctx.lineTo(
                x,
                FRAME_AREA_HEIGHT+startHeight - Math.abs(sample * waveAreaHeight)
            );

            lastX = x;
        });
    
        ctx.lineTo(lastX, FRAME_AREA_HEIGHT+startHeight);
        ctx.moveTo(0, FRAME_AREA_HEIGHT+startHeight);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    const _draw_marker = ( ctx : CanvasRenderingContext2D, _start : number, sampleWidth : number, time : number, strokeStyle : string ) => {
        ctx.beginPath();
        ctx.moveTo( (time*frameRate-_start)*sampleWidth, 0 );
        ctx.strokeStyle = strokeStyle;
        ctx.lineTo( (time*frameRate-_start)*sampleWidth, CANVAS_HEIGHT );
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    }
    
    const startDraw = useCallback( () => {
        if(!filteredData) return;

        if(canvas.current === null){
            return;
        }

        const ctx = canvas.current.getContext("2d");

        if(ctx === null){
            return;
        }
        
        if(range === null) return;

        let waveAreaHeight = (CANVAS_HEIGHT - FRAME_AREA_HEIGHT)/2

        let [ _start, _end ] = range;
        let _zoom = _end - _start;

        // const dpr = window.devicePixelRatio || 1;
        let dpr = 1;

        ctx.scale(dpr, dpr);

        _clearCanvas(ctx);

        // 샘플 1개가 차지할 넓이
        const sampleWidth = canvasWidth / (_zoom);

        //timeline그리기
        if( bunIds !== null ){
            const filteredBunIds = bunIds
                .map( (v, i) => { return { ...v, i} })
                .filter( (v) => _start <= v.endTime*frameRate && v.startTime*frameRate <= _end )

            for( let i = 0; i < filteredBunIds.length; i++ ){
                _drawTimeline(ctx, sampleWidth, _start, filteredBunIds[i]);
            }
        }

        //startTime, endTime 그리기
        _draw_start_end(ctx, _start, sampleWidth);

        //zoom된 범위 필터
        const rangeFilteredDataR = filteredData.right.filter( (arr, index) => (
            Math.round( _start ) < index && index <= Math.round( _end) + 1
        ) );
        const rangeFilteredDataL = filteredData.left.filter( (arr, index) => (
            Math.round( _start ) < index && index <= Math.round( _end ) + 1
        ) );

        //오디오 파형 그래프 right
        _draw_wave_form(ctx, waveAreaHeight, waveAreaHeight, sampleWidth, rangeFilteredDataR);

        //오디오 파형 그래프 left
        _draw_wave_form(ctx, waveAreaHeight*2, waveAreaHeight, sampleWidth, rangeFilteredDataL);

        //frame 표시 부분 그리기.
        _drawFrameArea(ctx, _zoom, _start, sampleWidth, canvasWidth);

        //현재 시간 그리기
        _draw_marker(ctx, _start, sampleWidth, videoTime, CURRENT_MARKER_COLOR);

        //start, end 마커 그리기.
        if(startTime !== null && endTime !== null && endTime > startTime){
            if(selectMarker === 'startTime'){
                _draw_marker(ctx, _start, sampleWidth, startTime, SELECT_MARKER_COLOR);
            }

            if(selectMarker === 'endTime'){
                _draw_marker(ctx, _start, sampleWidth, endTime, SELECT_MARKER_COLOR);
            }
        }

        //markerTime
        if( markerTime !== null ){
            _draw_marker(ctx, _start, sampleWidth, markerTime, (startTime && endTime) ? MARKER_TIME_COLOR : INVERT_MARKER_TIME_COLOR );
        }

        stopDraw();
    }, [filteredData, canvasWidth, frameRate, range, videoTime, startTime, endTime, markerTime, selectMarker, floorFrame, frameTime, getFrame, bunIds])

    const stopDraw = () => {
        cancelAnimationFrame(refId.current);
    }
    
    useEffect( () => {
        if(divBox.current !== null){
            const observer = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const { width } = entry.contentRect;
                    setCanvasWidth(width);
                }
            });
        
            observer.observe(divBox.current);

            return () => observer.disconnect();
        }
    }, [])

    useEffect( () => {
        if(filteredData !== null){
            startDraw();
        }
    }, [filteredData, startDraw, range, videoTime, startTime, endTime, selectMarker, canvasWidth])

    return { divBox, canvas, canvasWidth, canvasHeight : CANVAS_HEIGHT };  
}