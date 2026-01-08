import { useState, useRef, useCallback, useEffect } from 'react';

import { useTimeStamp } from 'shared/lib/useTimeStamp';

const DEFUALT_CANVAS_WIDTH = 700;

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

    //Ref    
    const divBox = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const refId = useRef<number>(-1);

    //State
    const [canvasWidth, setCanvasWidth] = useState<number>(DEFUALT_CANVAS_WIDTH)
    const canvasHeight = 100;
    const frameArea = 10;

    //Hook
    const { floorFrame, frameTime, getFrame } = useTimeStamp();
    
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

        let waveAreaWidth = canvasWidth;
        let waveAreaHeight = (canvasHeight - 10)/2

        let [ _start, _end ] = range;
        let _zoom = _end - _start;

        // const dpr = window.devicePixelRatio || 1;
        let dpr = 1;

        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#000000'; // 캔버스 배경색
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 샘플 1개가 차지할 넓이
        const sampleWidth = waveAreaWidth / (_zoom);

        //startTime, endTime 그리기
        if(startTime !== null && endTime !== null ){
            //startTime - endTime의 흰배경.
            ctx.moveTo( (startTime*frameRate-_start)*sampleWidth, frameArea );
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(
                (startTime*frameRate-_start)*sampleWidth, frameArea,
                (endTime-startTime)*frameRate*sampleWidth, canvasHeight
            );
        }
        else{
            if(startTime !== null){
                ctx.moveTo( (startTime*frameRate-_start)*sampleWidth, frameArea );
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(
                    (startTime*frameRate-_start)*sampleWidth, frameArea,
                    sampleWidth, canvasHeight
                );
            }
            else if(endTime !== null){
                ctx.moveTo( (endTime*frameRate-_start)*sampleWidth, frameArea );
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(
                    (endTime*frameRate-_start)*sampleWidth, frameArea,
                    sampleWidth, canvasHeight
                );
            }
        }

        //zoom된 범위 필터
        const rangeFilteredDataR = filteredData.right.filter( (arr, index) => (
            Math.round( _start ) < index && index <= Math.round( _end) + 1
        ) );
        const rangeFilteredDataL = filteredData.left.filter( (arr, index) => (
            Math.round( _start ) < index && index <= Math.round( _end ) + 1
        ) );

        let lastXR = 0; // x축 좌표

        let lastXL = 0; //Left 데이터.
        //오디오 파형 그래프 right
        ctx.beginPath();
        ctx.moveTo(0, 10+waveAreaHeight);
        ctx.strokeStyle = '#BF4040';
        ctx.fillStyle = '#BF4040'

        rangeFilteredDataR.forEach( (sample, index) => {
            let x = sampleWidth * index;
            ctx.lineWidth = 1;
            ctx.lineTo(
                x,
                canvasHeight - Math.abs(sample * waveAreaHeight) - waveAreaHeight
            );

            lastXR = x;
        });
    
        ctx.lineTo(lastXR, frameArea+waveAreaHeight);
        ctx.moveTo(0, frameArea+waveAreaHeight);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        //오디오 파형 그래프 left
        ctx.beginPath();
        ctx.moveTo(lastXL, canvasHeight);
        ctx.strokeStyle = '#BF4040';
        ctx.fillStyle = '#BF4040';

        rangeFilteredDataL.forEach( (sample, index) => {
            let x = sampleWidth * index;
            ctx.lineWidth = 1;
            ctx.lineTo(
                x,
                canvasHeight - Math.abs(sample * waveAreaHeight)
            );

            lastXL = x;
        });

        ctx.lineTo(lastXL, canvasHeight);
        ctx.moveTo(0, canvasHeight);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        //frame 표시 부분 그리기.
        if( _zoom < 5*frameRate ){
            let xOffset = 1 - (_start/frameRate - floorFrame(_start/frameRate, frameRate))*frameRate;

            let rangeFrame = frameTime(_start/frameRate, frameRate).frame;
            let zoomLength = Math.floor(_zoom);
            let lastFrameX = 0;

            if(xOffset > 0){
                let currFrame = rangeFrame;
                ctx.fillStyle = currFrame%2 === 0 ? '#FFFFFF' : '#AAAAAA';
                if(currFrame % 10 === 0){
                    ctx.fillStyle = '#666666';
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
                ctx.fillStyle = currFrame%2 === 0 ? '#FFFFFF' : '#AAAAAA';
                if(currFrame % 10 === 0){
                    ctx.fillStyle = '#666666';
                }
                ctx.fillRect(
                    x, 0,
                    x+sampleWidth, 10
                );
                lastFrameX = x + sampleWidth;
            }
            if(lastFrameX < waveAreaWidth){
                let currFrame = getFrame(rangeFrame + zoomLength, frameRate);
                ctx.fillStyle = currFrame%2 === 0 ? '#FFFFFF' : '#AAAAAA';
                if(currFrame % 10 === 0){
                    ctx.fillStyle = '#666666';
                }
                ctx.fillRect(
                    lastFrameX, 0,
                    waveAreaWidth, 10
                );
                lastFrameX = waveAreaWidth;
            }
        }
        else{
            ctx.fillStyle = '#AAAAAA';
            ctx.fillRect(
                0, 0,
                canvasWidth, 10
            );
        }

        //현재 시간 그리기
        ctx.beginPath();
        ctx.moveTo( (videoTime*frameRate-_start)*sampleWidth, 0 );
        ctx.strokeStyle = '#BF4040';
        ctx.lineTo( (videoTime*frameRate-_start)*sampleWidth, canvasHeight );
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();

        //start, end 마커 그리기.
        if(startTime !== null && endTime !== null && endTime > startTime){
            if(selectMarker === 'startTime'){
                ctx.beginPath();
                ctx.moveTo( (startTime*frameRate-_start)*sampleWidth, 0 );
                ctx.strokeStyle = 'yellow';
                ctx.lineTo( (startTime*frameRate-_start)*sampleWidth, canvasHeight );
                ctx.stroke();
                ctx.closePath();
            }

            if(selectMarker === 'endTime'){
                ctx.beginPath();
                ctx.moveTo( (endTime*frameRate-_start)*sampleWidth, 0 );
                ctx.strokeStyle = 'yellow';
                ctx.lineTo( (endTime*frameRate-_start)*sampleWidth, canvasHeight );
                ctx.stroke();
                ctx.closePath();
            }
        }

        //markerTime
        if( markerTime !== null ){
            ctx.beginPath();
            ctx.moveTo( (markerTime*frameRate-_start)*sampleWidth, 0 );
            ctx.strokeStyle = (startTime && endTime) ? '#BF4040' : '#ffffff';
            ctx.lineTo( (markerTime*frameRate-_start)*sampleWidth, canvasHeight );
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
        }

        stopDraw();
    }, [filteredData, canvasWidth, frameRate, range, videoTime, startTime, endTime, markerTime, selectMarker, floorFrame, frameTime, getFrame])

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

    return { divBox, canvas, canvasWidth, canvasHeight };  
}