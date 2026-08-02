import React, { CSSProperties, useContext } from 'react';
import { useTranslation } from 'react-i18next'

//entities
import { Bun } from 'entities/Bun/index';
import { KoText } from 'entities/KoText/index';

//CSS@antd
import { Button, Flex, Tooltip } from 'antd';
import { ConsoleSqlOutlined, FormOutlined, PlayCircleOutlined } from '@ant-design/icons'

//Redux
import { useAppDispatch, reactPlayerActions } from 'shared/store';
import { VideoContext } from 'shared/contexts/VideoContext';
const { setStartTime, setEndTime } = reactPlayerActions;

interface TimeLineBunProps {
  jaBId : string | null;
  ytBId : string;
  jaText? : string;
  koText? : string;
  startTimestamp : string;
  endTimestamp : string;
  startTime : number;
  endTime : number;
  state : ReactPlayerState;
  setInputText : (value : string) => void;
  selectEditYtBId : (ytbId : string) => void; 
  setScratch : (set : boolean, startOffset : number, endOffset : number, loop : boolean) => void;
  gotoTime : ( time : number, playBool : boolean | null ) => void;
  bIdRef : React.RefObject<ObjStringKey<RefetchObj>>;
  getActive? : (bId : string) => boolean;
  setActive? : (bId : string) => void;
}

const TimelineBun = ({ jaBId, ytBId, jaText, koText, startTimestamp, endTimestamp, startTime, endTime, state, setInputText, selectEditYtBId, setScratch, gotoTime, bIdRef, ...props} : TimeLineBunProps ) => {

    //i18n
    const { t } = useTranslation('TimelineBun');

    //context
    const { translationDirection } = useContext(VideoContext);

    const dispatch = useAppDispatch();

    const modifyEditInput = () => {
        dispatch( setStartTime(startTime) );
        dispatch( setEndTime(endTime) );
        if( translationDirection === 'ja-ko' ){
            setInputText(jaText ?? '');
        }
        else{
            setInputText(koText ?? '');
        }
        selectEditYtBId(ytBId);
        if( startTime > state.playedSeconds || state.playedSeconds > endTime ){
            gotoTime(startTime, false);
        }
        else{
            gotoTime(state.playedSeconds, false);
        }
        
    }

    const onTimelineClick = () => {
        dispatch( setStartTime(startTime) );
        dispatch( setEndTime(endTime) );
        setScratch(true, startTime, endTime, false);
    }
    
    return(
        <Flex justify="space-between">
            {
                translationDirection === 'ja-ko' ?
                    jaBId !== null &&
                    <>
                    {
                        props?.getActive ?
                            props.getActive(jaBId) ?
                                <div id="activeRange">
                                    <Bun key={jaBId} bId={jaBId} bIdRef={bIdRef}/>
                                </div>
                            :
                                <div onMouseDown={() => props.setActive !== undefined ? props.setActive(jaBId) : undefined }>
                                    <Bun key={jaBId} bId={jaBId} bIdRef={bIdRef}/>
                                </div>
                        :
                        <Bun key={jaBId} bId={jaBId} bIdRef={bIdRef}/>
                    }
                    </>
                :
                <KoText data={koText}/>
            }
            <Flex gap={8}>
                <Tooltip title={t('TOOLTIP.ENTER')}>
                    <Button onClick={modifyEditInput}>{t('BUTTON.MODIFY')}<FormOutlined /></Button>
                </Tooltip>
                <Button type="primary" onClick={onTimelineClick}>{t('BUTTON.MOVE')}<PlayCircleOutlined /></Button>
            </Flex>
        </Flex>
    )
}

export { TimelineBun }