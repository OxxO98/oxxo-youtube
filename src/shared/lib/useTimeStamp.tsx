import { useCallback } from 'react';

/**
 * 시간 관련 함수
 * 
 * @returns timeToTS, timeToFrameTime, tsToTime, floorFrame, frameTime, getFrame, timeToFrameStamp, timestampEdit
 */
function useTimeStamp(){

    /**
     * T, Z가 포함된 타임스탬프에서 타임스탬프만 반환
     * OracleDB사용중에 만들어진 함수
     * 
     * @param ts 타임스탬프
     * @deprecated
     * @todo 사용되는 곳이 있지만 무의미해 보임 확인 후 삭제
     */
    const timestampEdit = (ts : string) => {
        let indexT = ts.indexOf('T');
        let indexZ = ts.indexOf('Z');

        let sliceTs = ts.substring(indexT+1, indexZ);

        return sliceTs;
    }

    /**
     * 시간을 타임스탬프 형식으로 변환
     * 
     * @param time 초단위 숫자
     * @example 00:00:00.046
     */
    const timeToTS = (time : number) => {
        let hour = Math.floor(time/3600);
        let min = Math.floor(time/60);
        let sec = Math.floor(time%60);
        let msec = Math.floor(time%1*1000);

        let ts_hour = '00';
        let ts_min = '00';
        let ts_sec = '00';

        if(hour < 10){
            ts_hour = '0'+hour;
        }
        else{
            ts_hour = ''+hour;
        }
        if(min < 10){
            ts_min = '0'+min;
        }
        else if(min >= 60){
            ts_min = ''+min%60;
        }
        else{
            ts_min = ''+min;
        }
        if(sec < 10){
            ts_sec = '0'+sec;
        }
        else{
            ts_sec = ''+sec;
        }

        return ts_hour+':'+ts_min+':'+ts_sec+'.'+String(msec).padStart(3, '0');
    }

    /**
     * @deprecated
     * @todo 삭제 예정 사용되는 곳 없음
     */
    const timeToFrameTime = (time : number, frame : number) => {
        let hour = Math.floor(time/3600);
        let min = Math.floor(time/60);
        let sec = Math.floor(time%60);
        let frameTime = Math.floor( (time%1*1000)/(1000/frame) );

        let ts_hour = '00';
        let ts_min = '00';
        let ts_sec = '00';

        if(hour < 10){
            ts_hour = '0'+hour;
        }
        else{
            ts_hour = ''+hour;
        }
        if(min < 10){
            ts_min = '0'+min;
        }
        else if(min >= 60){
            ts_min = ''+min%60;
        }
        else{
            ts_min = ''+min;
        }
        if(sec < 10){
            ts_sec = '0'+sec;
        }
        else{
            ts_sec = ''+sec;
        }

        return ts_hour+':'+ts_min+':'+ts_sec+'.'+frameTime;
    }

    /**
     * T,Z가 포함된 타임스탬프를 시간으로 변환
     * 오라클DB사용중 만들어진 것
     * 
     * @param ts 
     * @deprecated
     * @todo 삭제 예정 사용되는 곳 없음
     */
    const tsToTime = (ts : string) => {
        let indexT = ts.indexOf('T');
        let indexZ = ts.indexOf('Z');

        let sliceTs = ts.substring(indexT+1, indexZ);
        let indexMsec = sliceTs.indexOf('.');

        let stringMsec = sliceTs.substring(indexMsec+1);
        let stringHMS = sliceTs.substring(0,indexMsec);
        let tsArray = stringHMS.split(':');

        let hour = parseInt(tsArray[0]);
        let min = parseInt(tsArray[1]);
        let sec = parseInt(tsArray[2]);
        let msec = parseInt(stringMsec)/1000;

        return hour*3600 + min*60 + sec + msec;
    }

    /**
     * 프레임 퍼펙트 시간 반환
     * 
     * @param time 초단위 시간
     * @param frame 프레임레이트 
     * @example floorFrame(1.049, 30) : 1.033
     */
    const floorFrame = useCallback( (time : number, frameRate : number) => {
        let sec = Math.floor(time);
        let msec = time - sec;

        let frame = Math.floor( msec / (1/frameRate) );
        //오차 범위 보정
        if( Math.abs( Math.abs( frame*(1/frameRate) - msec ) - (1/frameRate) ) <= 0.00001 ){
            frame = Math.round( msec / (1/frameRate) );
        }

        return sec + frame*(1/frameRate);
    }, [])

    /**
     * 현재 시간을 frameRate에 따라 몇 Frame인지 반환
     */
    const frameTime = useCallback( (time : number, frameRate : number) => {
        let sec = Math.floor(time);
        let msec = time - sec;

        let frame = Math.floor( msec / (1/frameRate) );

        return { sec : sec, frame : frame, frameRate : frameRate }
    }, [])

    /**
     * frame끼리의 사칙연산 후 보정용도로 사용
     * frame이 frameRate를 넘어가거나 0미만일때 원래 값으로 보정
     */
    const getFrame = useCallback( (frame : number, frameRate : number) => {
        let value = frame%frameRate;
        if( value < 0 ){
            value += frameRate;
        }

        return value;
    }, [])

    /**
     * 시간을 프레임형식의 타임스탬프로 변환
     * @param time 
     * @param frameRate 
     * @example 00:00:00.00 ~ 00:00:00.30{frameRate}
     */
    const timeToFrameStamp = (time : number, frameRate : number) => {
        let msec = time - Math.floor(time);
        let frame = Math.floor( msec / (1/frameRate) );

        if( Math.abs( Math.abs( frame*(1/frameRate) - msec ) - (1/frameRate) ) <= 0.00001 ){
            frame = Math.round( msec / (1/frameRate) );
        }

        let hour = Math.floor(time/3600);
        let min = Math.floor(time/60%60);
        let sec = Math.floor(time%60);

        let ts_hour = String(hour).padStart(2, '0');
        let ts_min = String(min).padStart(2, '0');
        let ts_sec = String(sec).padStart(2, '0');
        let ts_frame = String(frame).padStart(2, '0');

        return ts_hour+':'+ts_min+':'+ts_sec+'.'+ ts_frame;
    }

  return { timeToTS, timeToFrameTime, tsToTime, floorFrame, frameTime, getFrame, timeToFrameStamp, timestampEdit }
}

export { useTimeStamp}