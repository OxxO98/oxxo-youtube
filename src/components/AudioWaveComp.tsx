import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next'

//Context
import { AudioContext } from 'contexts/AudioContext';
import { FilteredDataContext } from 'contexts/FilteredDataContext';
import { VideoContext } from 'contexts/VideoContext';

//Hook
import { useTimeStamp } from 'hooks/VideoPlayHook';

//CSS@antD
import { Slider, Button, Space, Input, Skeleton, Modal, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, QuestionCircleOutlined } from '@ant-design/icons'

//Redux
import { useSelector } from 'react-redux';
import { store, RootState } from 'reducers/store';
import { reactPlayerActions } from 'reducers/reactPlayerReducer';
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
  const { startTime, endTime, selectMarker } = useSelector((state : RootState) => state.reactPlayer)

  //Ref
  const divBox = useRef<HTMLDivElement>(null); //canvas Div Box 크기
  const canvas = useRef<HTMLCanvasElement>(null);
  const refId = useRef<number>(-1);
  const mouseDownStartTime = useRef<number | null>(startTime);

  //State
  const [canvasSize, setCanvasSize] = useState<{width : number, height : number}>({ width : 700, height : 100 });
  const [waveAreaSize, setWaveAreaSize] = useState<{width : number, height : number}>({ width : 700, height : 45 });
  const { width : canvasWidth, height : canvasHeight } = canvasSize;
  const { width : waveAreaWidth, height : waveAreaHeight } = waveAreaSize;
  const frameArea = 10;

  const [range, setRange] = useState<number[] | null>(null); //Index

  //Hook
  const { floorFrame, frameTime, timeToFrameStamp, getFrame } = useTimeStamp();

  //Handle
  const setRangeCrit = useCallback( (time : number) => {
    if(!filteredData) return;
    if( playing === false ){ return } 

    if(range === null) return;

    let [ _start, _end ] = range;
    let _zoom = _end - _start;

    if(_zoom >= filteredData.length){
      setRange([0, filteredData.length]);
    }
    else{
      let _time = Math.floor(time*frameRate);

      if( _start <= _time && _time <= _end ){
        return;
      }

      if( _time + _zoom > filteredData.length-1 ){
        setRange([filteredData.length-1-_zoom, filteredData.length-1]);
      }
      else if( _time - _zoom < 0){
        setRange([0, _zoom]);
      }
      else{
        setRange([_time, _time+_zoom]);
      }
    }
  }, [playing, range, filteredData, frameRate])

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
    let _zoom = _start - _end;

    if(e.shiftKey === false){
      if(e.deltaY > 0){
        zoomOut();
      }
      else{
        zoomIn();
      }
    }
    else{
      if(e.deltaY > 0){
        if( _start-frameRate >= 0 ){
          setRange([range[0] - frameRate, range[1] - frameRate]);
        }
      }
      else{
        if( _end + 1 <= filteredData.length - _zoom ){
          setRange([range[0] + frameRate, range[1] + frameRate]);
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
          store.dispatch(setStartTime( mouseDownStartTime.current ));
          store.dispatch(setEndTime( floorFrame( mouseUpEndTime, frameRate ) ));
        }
        else{
          store.dispatch(setStartTime( floorFrame( mouseUpEndTime, frameRate ) ));
          store.dispatch(setEndTime( mouseDownStartTime.current ));
        }
      }
    }
  }

  const onDoubleClickFunction = (e : React.MouseEvent) => {
    store.dispatch(setStartTime( 0 ));
    store.dispatch(setEndTime( 0 ));
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
    let a = value;
    setRange(a);
    
    if( playing === true){
      handlePausePlay(false);
    }
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

    let [ _start, _end ] = range;
    let _zoom = _end - _start;

    const dpr = window.devicePixelRatio || 1;

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

    stopDraw();
  }, [filteredData, canvasWidth, canvasHeight, frameRate, range, videoTime, startTime, endTime, selectMarker, waveAreaHeight, waveAreaWidth, floorFrame, frameTime, getFrame])

	const stopDraw = () => {
	  cancelAnimationFrame(refId.current);
  }

  useEffect( () => {
    if(filteredData !== null){
      startDraw();
    }
  }, [filteredData, startDraw, range, videoTime, startTime, endTime, selectMarker, canvasWidth])

  useEffect( () => {
    setRangeCrit(videoTime);
  }, [videoTime, setRangeCrit])

  useEffect( () => {
    if(divBox.current !== null){
       const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width } = entry.contentRect;
          setCanvasSize( (prev) => ({ ...prev, width : width }));
          setWaveAreaSize( (prev) => ({ ...prev, width : width }));
        }
      });

      observer.observe(divBox.current);

      return () => observer.disconnect();
    }
  }, [])

  useEffect( () => {
    if(filteredData !== null && range == null){
      setRange([0, filteredData.length-1]) //초기 Range 설정
    }
  }, [filteredData, range])

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
        <>
          <canvas ref={canvas} id="my-house" width={canvasWidth} height={canvasHeight}
            onClick={(e) => seekByAudioWave(e)}
            onWheel={(e) => onWheelFunction(e)}
            onMouseDown={(e) => onMouseDownFunction(e)}
            onMouseUp={(e) => onMouseUpFunction(e)}
            onDoubleClick={(e) => onDoubleClickFunction(e)}></canvas>
          <div>
            {
              range !== null &&
              <Slider range={{ draggableTrack: true }} defaultValue={[0, filteredData.length-1]} value={range} min={0} max={filteredData.length-1} onChange={changeRange}/>
            }
          </div>
        </>
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

const HelpData = [4, 5, 6, 2, 5]

const HelpModal = () => {

  //i18n
  const { t } = useTranslation('HelpModal');

  const items : CollapseProps['items'] = HelpData.map( (v, i) => {
    return {
      key : (i+1).toString(),
      label : t(`CONTENTS.${i}.TITLE`),
      children : 
      <div key={(i+1).toString()}>
        {
          Array.from({ length : v }, (_, idx) => idx).map( (ch) => 
            <div key={ch.toString()}>
              {t(`CONTENTS.${i}.ITEMS.${ch}`)}
            </div>
          )
        }
      </div>
    }
  })

  //State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return(
    <>
      <Button onClick={showModal}>{t('BUTTON.TITLE')}<QuestionCircleOutlined /></Button>

      <Modal
        title={t('TITLE')}
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key={'BUTTON.CANCLE'} onClick={handleOk}>{t('BUTTON.CANCLE')}</Button>
        ]}
      >
        <Collapse accordion items={items} defaultActiveKey={['1']}/>
      </Modal>
    </>
    
  )
}

export { AudioWaveComp };
