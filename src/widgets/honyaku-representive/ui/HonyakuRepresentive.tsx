import { useEffect, useContext, RefObject } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//model
import { useYTBun } from '../model/useYTBun';

//CSS@antd
import { Button, Flex, Tooltip } from 'antd'

interface HonyakuRepresentiveProps {
    ytBId : ytBId;
    handleSelect : (jaBId : jaBId) => void;
    bIdRef : RefObject<BIdRef>;
}

export const HonyakuRepresentive = ({ ytBId, handleSelect, bIdRef } : HonyakuRepresentiveProps ) => {
    
    //i18n
    const { t } = useTranslation('HonyakuRepresentive');
    
    //Context
    const { videoId } = useContext(VideoContext);

    //Hook
    const { response, loading, setParams, fetch } = useAxiosGet<RES_GET_TRANSLATE_REP, REQ_GET_TRANSLATE_REP>('/db/translate/representive', true, null);
    
    //model
    const { ytBun } = useYTBun(response, fetch, bIdRef)

    //Hotkeys
    useHotkeys('enter', () => handleSelect(ytBun?.jaBId!) )

    useEffect( () => {
        setParams({ videoId : videoId, ytBId : ytBId });
    }, [setParams, videoId, ytBId])

    return(
        <div>
            {
                ytBun !== null ?
                <span>{ytBun.koText}</span>
                :
                <span>{loading ? "　" : t('MESSAGE.EMPTY')}</span>
            }
            <Flex justify='right'>
                <Tooltip title={t('TOOLTIP.ENTER')}>
                    <Button onClick={() => handleSelect(ytBun?.jaBId!)}>{t('BUTTON.MODIFY')}</Button>
                </Tooltip>
            </Flex>
        </div>
    )
}