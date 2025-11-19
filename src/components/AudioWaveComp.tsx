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

  const [zoom, setZoom] = useState(8); // zoom은 배율 최대 filteredData.length/frameRate보다 작은 2배수
  //MAX_ZOOM을 설정해야할 지도 모름. -> Slider에서 dragTrack이 가능해서 그런데 바꿀 생각있으면 잘 바꿔보기
  //바꾼다면 setRangeCrit, ZoomIn, zoomOut, changeRange 바꾸기.
  const [range, setRange] = useState(0); //offset, zoom이 올라갈 수록 최대 range가 작아짐.

  /*
    zoom은 정수로 1이 가장 작은 줌 == 1초, zoomOut시에 커짐
    range는 오프셋으로 보이는 위치에서 가장 빠른 시간 offset
    
    setRangeCrit : time과 zoom을 기준으로 range설정, time을 기준으로 zoom값으로 구한 max와 min이 기준이 된다. 이 기준이 전체 범위에 넘었을 때 예외 처리
    zoomIn은 zoom값도 변경하지만 return을 통해 다음 zoom값을 반환, zoomOut도 마찬가지
    onWheelfunction에서 zoomOut, In을 통해 다음 zoom값을 가져온뒤, 그 기준으로 setRangeCrit

    zoom 필터 filteredData
    Math.round( range*frameRate ) < index && index <= Math.round( range*frameRate + zoom*frameRate ) + 1
    range*frameRate ~ index ~ (range+zoom) * frameRate의 사이 값
    zoom이 5보다 작은 값일 때, (보이는 화면이 5초 이하) frame그림 표시

    [filteredData, startDraw, zoom, range, videoTime, startTime, endTime, selectMarker, canvasWidth]
    의 값이 변경시 새로 그림

    [zoom, videoTime, setRangeCrit]
    의 값이 변경시 setRangeCrit으로 range재설정
  */

  //Hook
  const { floorFrame, frameTime, timeToFrameStamp, getFrame } = useTimeStamp();

  //Handle
  const setRangeCrit = useCallback( (time : number, zoom : number) => {
    if(!filteredData) return;
    if( playing === false ){ return } 

    if(zoom >= filteredData.length/frameRate){
      setRange(0);
    }
    else{
      let max = time + zoom/2;
      let min = time - zoom/2;

      if( range <= time && time <= range+zoom){
        return;
      }

      if( max > filteredData.length/frameRate ){
        setRange(filteredData.length/frameRate - zoom);
      }
      else if(min < 0){
        setRange(0);
      }
      else{
        setRange(time);
      }
    }
  }, [playing, range, filteredData, frameRate])

  const zoomIn = () => {
    if(filteredData !== null){
      if(zoom > 1){
        if(zoom < 10){
          setZoom(zoom-1);
          return zoom-1;
        }
        else{
          setZoom(zoom/2);
          return zoom/2;
        }
      }
      else{
        setZoom(1);
        return null;
      }
    }
  }

  const zoomOut = () => {
    if(filteredData !== null){
      if(filteredData.length/frameRate > zoom*2){
        if(zoom < 10){
          setZoom(zoom+1);
          return zoom+1;
        }
        else{
          setZoom(zoom*2);
          return zoom*2;
        }
      }
      else{
        return null;
      }
    }
  }

  const onWheelFunction = (e : React.WheelEvent) => {
    if(!filteredData) return;
    
    if(canvas.current === null){
      return;
    }
    
    let rect = canvas.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let seekTimeFrame = floorFrame(range + zoom*x/rect.width, frameRate);

    if(e.shiftKey === false){
      if(e.deltaY > 0){
        let afterZoom = zoomOut();
        if(afterZoom !== undefined && afterZoom !== null){
          setRangeCrit(seekTimeFrame - afterZoom*x/rect.width + afterZoom/2, afterZoom);
        }
      }
      else{
        let afterZoom = zoomIn();
        if(afterZoom !== undefined && afterZoom !== null){
          setRangeCrit(seekTimeFrame - afterZoom*x/rect.width + afterZoom/2, afterZoom);
        }
      }
    }
    else{
      if(e.deltaY > 0){
        if( range-1 >= 0 ){
          setRange(range - 1);
        }
      }
      else{
        if( range + 1 <= filteredData.length/frameRate - zoom ){
          setRange(range + 1);
        }
      }
    }
  }

  const onMouseDownFunction = (e : React.MouseEvent) => {
    if(canvas.current === null){
      return;
    }

    let rect = canvas.current.getBoundingClientRect();
    let x = e.clientX - rect.left;

    if(filteredData !== null){
      mouseDownStartTime.current = floorFrame( Number(range) + Number(zoom*x/rect.width), frameRate );
    }
  }

  const onMouseUpFunction = (e : React.MouseEvent) => {
    if(canvas.current === null){
      return;
    }

    let rect = canvas.current.getBoundingClientRect();
    let x = e.clientX - rect.left;

    if(filteredData !== null && mouseDownStartTime.current !== null){
      let mouseUpEndTime = Number(range) + Number(zoom*x/rect.width);
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
    
    let rect = canvas.current.getBoundingClientRect();
    let x = e.clientX - rect.left;

    if(filteredData !== null){
      let seekTime = floorFrame(range + zoom*x/rect.width, frameRate);
      gotoTime(seekTime, null);
    }
  }

  const changeRange = ( value : number ) => {
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

    const dpr = window.devicePixelRatio || 1;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#000000'; // 캔버스 배경색
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 샘플 1개가 차지할 넓이
    const sampleWidth = waveAreaWidth / (zoom*frameRate);

    //startTime, endTime 그리기
    if(startTime !== null && endTime !== null ){
      //startTime - endTime의 흰배경.
      ctx.moveTo( (startTime-range)*frameRate*sampleWidth, frameArea );
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(
        (startTime-range)*frameRate*sampleWidth, frameArea,
        (endTime-startTime)*frameRate*sampleWidth, canvasHeight
      );
    }
    else{
      if(startTime !== null){
        ctx.moveTo( (startTime-range)*frameRate*sampleWidth, frameArea );
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(
          (startTime-range)*frameRate*sampleWidth, frameArea,
          sampleWidth, canvasHeight
        );
      }
      else if(endTime !== null){
        ctx.moveTo( (endTime-range)*frameRate*sampleWidth, frameArea );
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(
          (endTime-range)*frameRate*sampleWidth, frameArea,
          sampleWidth, canvasHeight
        );
      }
    }

    //zoom된 범위 필터
    const rangeFilteredDataR = filteredData.right.filter( (arr, index) => (
      Math.round( range*frameRate ) < index && index <= Math.round( range*frameRate + zoom*frameRate ) + 1
    ) );
    const rangeFilteredDataL = filteredData.left.filter( (arr, index) => (
      Math.round( range*frameRate ) < index && index <= Math.round( range*frameRate + zoom*frameRate ) + 1
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
    if(zoom < 5){
      let xOffset = 1 - (range - floorFrame(range, frameRate))*frameRate;

      let rangeFrame = frameTime(range, frameRate).frame;
      let zoomLength = Math.floor(zoom*frameRate);
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
    ctx.moveTo( (videoTime-range)*frameRate*sampleWidth, 0 );
    ctx.strokeStyle = '#BF4040';
    ctx.lineTo( (videoTime-range)*frameRate*sampleWidth, canvasHeight );
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();

    //start, end 마커 그리기.
    if(startTime !== null && endTime !== null && endTime > startTime){
      if(selectMarker === 'startTime'){
        ctx.beginPath();
        ctx.moveTo( (startTime-range)*frameRate*sampleWidth, 0 );
        ctx.strokeStyle = 'yellow';
        ctx.lineTo( (startTime-range)*frameRate*sampleWidth, canvasHeight );
        ctx.stroke();
        ctx.closePath();
      }

      if(selectMarker === 'endTime'){
        ctx.beginPath();
        ctx.moveTo( (endTime-range)*frameRate*sampleWidth, 0 );
        ctx.strokeStyle = 'yellow';
        ctx.lineTo( (endTime-range)*frameRate*sampleWidth, canvasHeight );
        ctx.stroke();
        ctx.closePath();
      }
    }

    stopDraw();
  }, [filteredData, canvasWidth, canvasHeight, frameRate, zoom, range, videoTime, startTime, endTime, selectMarker, waveAreaHeight, waveAreaWidth, floorFrame, frameTime, getFrame])

	const stopDraw = () => {
	  cancelAnimationFrame(refId.current);
  }

  useEffect( () => {
    if(filteredData !== null){
      startDraw();
    }
  }, [filteredData, startDraw, zoom, range, videoTime, startTime, endTime, selectMarker, canvasWidth])

  useEffect( () => {
    // videoTime 이 zoom 된 범위 안에 있으면 range변경 없음, 범위 밖이면 range를 videoTime으로 변경
    setRangeCrit(videoTime, zoom);
  }, [zoom, videoTime, setRangeCrit])

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
              zoom < filteredData.length/frameRate &&
              <Slider value={range} min={0} max={ Math.floor(filteredData.length/frameRate - zoom) } tooltip={{ formatter: null }} onChange={changeRange}/>
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
