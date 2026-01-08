
import { useHotkeys } from 'react-hotkeys-hook';

function useHandleKeyboard(
  handleObj : HandleKeyboardObj
){

  useHotkeys('*', (_) => {
    if(_.ctrlKey === true ){ return }
    switch(_.key.toLowerCase()){
      case " ":
        if( handleObj?.pauseYT ){ handleObj.pauseYT() }
        break;
      case "z":
        if( handleObj?.prevSec ){ handleObj?.prevSec() }
        break;
      case "v":
        if( handleObj?.nextSec ){ handleObj?.nextSec() }
        break;
      case "x":
        if( handleObj?.prevFrame ){ handleObj?.prevFrame() }
        break;
      case "c":
        if( handleObj?.nextFrame ){ handleObj?.nextFrame() }
        break;
      case "a":
        if( handleObj?.markStart ){ handleObj?.markStart() }
        break;
      case "f":
        if( handleObj?.markEnd ){ handleObj?.markEnd() }
        break;
      case "s":
        if( handleObj?.selectStartTime ){ handleObj?.selectStartTime() }
        break;
      case "d":
        if( handleObj?.selectEndTime ){ handleObj?.selectEndTime() }
        break;
      case "b":
        if( handleObj?.markerPlay ){ handleObj?.markerPlay() }
        break;
      case "g":
        if( handleObj?.markerStop ){ handleObj?.markerStop() }
        break;
      case 'r' :
        if( handleObj?.loop ){ handleObj?.loop() }
        break;
      case 'n' :
        if( handleObj?.nextMarkerPlay ){ handleObj?.nextMarkerPlay() }
        break;
      default :
        if( handleObj?.custom ){
          let custom = handleObj.custom;
          let customAction = custom.filter( (v) => v.key.toLowerCase() === _.key.toLowerCase() );
          if( customAction.length !== 0 ){ customAction[0].action() }
        }
    }
  }, { preventDefault : true } );

  const handleKeyboard = (e : React.KeyboardEvent) =>{
    switch(e.code){
      case " ":
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
          let customAction = custom.filter( (v) => v.key.toLowerCase() === e.key.toLowerCase() );
          if( customAction.length !== 0 ){ customAction[0].action() }
        }
    }
  }

  return { handleKeyboard }
}

export { useHandleKeyboard}