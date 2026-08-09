
import { useHotkeys } from 'react-hotkeys-hook';

/**
 * 키보드 함수
 * 
 * @param handleObj 동영상 재생 관련 함수 집합체, custom에 key, action을 객체로 넣어서 실행 가능
 * @returns 
 */
function useHandleKeyboard(
    handleObj : HandleKeyboardObj
){

    useHotkeys('*', (_) => {
        if(_.ctrlKey === true ){ return }
        switch(_.code){
            case "Space":
                if( handleObj?.pauseYT ){ handleObj.pauseYT() }
                break;
            case "KeyZ":
                if( handleObj?.prevSec ){ handleObj?.prevSec() }
                break;
            case "KeyV":
                if( handleObj?.nextSec ){ handleObj?.nextSec() }
                break;
            case "KeyX":
                if( handleObj?.prevFrame ){ handleObj?.prevFrame() }
                break;
            case "KeyC":
                if( handleObj?.nextFrame ){ handleObj?.nextFrame() }
                break;
            case "KeyA":
                if( handleObj?.markStart ){ handleObj?.markStart() }
                break;
            case "KeyF":
                if( handleObj?.markEnd ){ handleObj?.markEnd() }
                break;
            case "KeyS":
                if( handleObj?.selectStartTime ){ handleObj?.selectStartTime() }
                break;
            case "KeyD":
                if( handleObj?.selectEndTime ){ handleObj?.selectEndTime() }
                break;
            case "KeyB":
                if( handleObj?.markerPlay ){ handleObj?.markerPlay() }
                break;
            case "KeyG":
                if( handleObj?.markerStop ){ handleObj?.markerStop() }
                break;
            case 'KeyR' :
                if( handleObj?.loop ){ handleObj?.loop() }
                break;
            case 'KeyN' :
                if( handleObj?.nextMarkerPlay ){ handleObj?.nextMarkerPlay() }
                break;
            default :
                if( handleObj?.custom ){
                    let custom = handleObj.custom;
                    let customAction = custom.filter( (v) => v.code === _.code );
                    if( customAction.length !== 0 ){ customAction[0].action() }
                }
        }
    }, { preventDefault : true, useKey: false } );
    
    /**
     * useHotkeys를 사용하지 않는 방식
     * input태그 안에서만 사용함
     * 
     * @param e KeyboardEvent
     */
    const handleKeyboard = (e : React.KeyboardEvent) =>{
        switch(e.code){
            case "Space":
                if( handleObj?.pauseYT ){ handleObj.pauseYT() }
                break;
            case "KeyZ":
                if( handleObj?.prevSec ){ handleObj?.prevSec() }
                break;
            case "KeyV":
                if( handleObj?.nextSec ){ handleObj?.nextSec() }
                break;
            case "KeyX":
                if( handleObj?.prevFrame ){ handleObj?.prevFrame() }
                break;
            case "KeyC":
                if( handleObj?.nextFrame ){ handleObj?.nextFrame() }
                break;
            case "KeyA":
                if( handleObj?.markStart ){ handleObj?.markStart() }
                break;
            case "KeyF":
                if( handleObj?.markEnd ){ handleObj?.markEnd() }
                break;
            case "KeyS":
                if( handleObj?.selectStartTime ){ handleObj?.selectStartTime() }
                break;
            case "KeyD":
                if( handleObj?.selectEndTime ){ handleObj?.selectEndTime() }
                break;
            case "KeyB":
                if( handleObj?.markerPlay ){ handleObj?.markerPlay() }
                break;
            case "KeyG":
                if( handleObj?.markerStop ){ handleObj?.markerStop() }
                break;
            case 'KeyR' :
                if( handleObj?.loop ){ handleObj?.loop() }
                break;
            case 'KeyN' :
                if( handleObj?.nextMarkerPlay ){ handleObj?.nextMarkerPlay() }
                break;
            default :
                if( handleObj?.custom ){
                    let custom = handleObj.custom;
                    let customAction = custom.filter( (v) => v.code === e.code );
                    if( customAction.length !== 0 ){ customAction[0].action() }
                }
        }
    }

    return { handleKeyboard }
}

export { useHandleKeyboard}