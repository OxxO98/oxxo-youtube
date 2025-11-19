import React from 'react';
import { useTranslation } from 'react-i18next'

import Bun from 'components/Bun';

//CSS@antd
import { Button, Flex } from 'antd';
import { FormOutlined, PlayCircleOutlined } from '@ant-design/icons'

//Redux
import { store } from 'reducers/store';
import { reactPlayerActions } from 'reducers/reactPlayerReducer';
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

    const modifyEditInput = () => {
        store.dispatch( setStartTime(startTime) );
        store.dispatch( setEndTime(endTime) );
        setInputText(jaText);
        selectEditYtBId(ytbId);
        gotoTime(startTime, false);
    }

    const onTimelineClick = () => {
        store.dispatch( setStartTime(startTime) );
        store.dispatch( setEndTime(endTime) );
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
                <Button onClick={modifyEditInput}>{t('BUTTON.MODIFY')}<FormOutlined /></Button>
                <Button type="primary" onClick={onTimelineClick}>{t('BUTTON.MOVE')}<PlayCircleOutlined /></Button>
            </Flex>
        </Flex>
    )
}

export { TimelineBun }