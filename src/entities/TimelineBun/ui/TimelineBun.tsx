import React from 'react';
import { useTranslation } from 'react-i18next'

//entities
import { Bun } from 'entities/Bun/index';

//CSS@antd
import { Button, Flex, Tooltip } from 'antd';
import { FormOutlined, PlayCircleOutlined } from '@ant-design/icons'

//Redux
import { useAppDispatch, reactPlayerActions } from 'shared/store';
const { setStartTime, setEndTime } = reactPlayerActions;

interface TimeLineBunProps {
  bId : string;
  ytbId : string;
  jaText : string;
  startTimestamp : string;
  endTimestamp : string;
  startTime : number;
  endTime : number;
  setInputText : (value : string) => void;
  selectEditYtBId : (ytbId : string) => void; 
  setScratch : (set : boolean, startOffset : number, endOffset : number, loop : boolean) => void;
  gotoTime : ( time : number, playBool : boolean | null ) => void;
  bIdRef : React.RefObject<ObjStringKey<RefetchObj>>;
  getActive? : (bId : string) => boolean;
  setActive? : (bId : string) => void;
}

const TimelineBun = ({ bId, ytbId, jaText, startTimestamp, endTimestamp, startTime, endTime, setInputText, selectEditYtBId, setScratch, gotoTime, bIdRef, ...props} : TimeLineBunProps ) => {

    //i18n
    const { t } = useTranslation('TimelineBun');

    const dispatch = useAppDispatch();

    const modifyEditInput = () => {
        dispatch( setStartTime(startTime) );
        dispatch( setEndTime(endTime) );
        setInputText(jaText);
        selectEditYtBId(ytbId);
        gotoTime(startTime, false);
    }

    const onTimelineClick = () => {
        dispatch( setStartTime(startTime) );
        dispatch( setEndTime(endTime) );
        setScratch(true, startTime, endTime, false);
    }
    
    return(
        <Flex justify="space-between" style={{ width : "100%" }}>
            {
                props?.getActive ?
                    props.getActive(bId) ?
                        <div id="activeRange">
                            <Bun key={bId} bId={bId} bIdRef={bIdRef}/>
                        </div>
                    :
                        <div onMouseDown={() => props.setActive !== undefined ? props.setActive(bId) : undefined }>
                            <Bun key={bId} bId={bId} bIdRef={bIdRef}/>
                        </div>
                :
                <div>
                    <Bun key={bId} bId={bId} bIdRef={bIdRef}/>
                </div>
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