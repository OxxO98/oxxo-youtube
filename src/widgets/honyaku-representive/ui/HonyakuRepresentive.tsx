import { useEffect, useContext, RefObject } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//Entities
import { Bun } from 'entities/Bun'
import { KoText } from 'entities/KoText';

//model
import { useYTBun } from '../model/useYTBun';

//CSS@antd
import { Button, Flex, Tooltip } from 'antd'

interface HonyakuRepresentiveProps {
    ytBId : string;
    handleSelect : (bId : string) => void;
    bIdRef : RefObject<BIdRef>;
}

export const HonyakuRepresentive = ({ ytBId, handleSelect, bIdRef } : HonyakuRepresentiveProps ) => {
    
    //i18n
    const { t } = useTranslation('HonyakuRepresentive');
    
    //Context
    const { videoId, translationDirection } = useContext(VideoContext);

    //Hook
    const { response, loading, setParams, fetch } = useAxiosGet<RES_GET_TRANSLATE, REQ_GET_TRANSLATE>('/db/bun/translate', true, null);

    //model
    const { ytBun } = useYTBun(ytBId, response, fetch, bIdRef)

    const handleSelectId = ( ytBun : YTBun | null ) => {
        if( ytBun === null ) return;

        if( translationDirection === 'ja-ko'){
            if( ytBun.jaBId !== null ) handleSelect(ytBun.jaBId);
        }
        else{
            if( ytBun.koBId !== null ) handleSelect(ytBun.koBId);
        }
    }

    //Hotkeys
    useHotkeys('enter', () => handleSelectId(ytBun) )

    useEffect( () => {
        setParams({ videoId : videoId, ytBId : ytBId });
    }, [setParams, videoId, ytBId])

    return(
        <div>
            {
                ytBun !== null ?
                    translationDirection === 'ja-ko' ?
                        <>
                        {
                            ytBun.koBId &&
                            <KoText data={ytBun.koText}/>
                        }
                        </>
                    :
                        <>
                        {
                            ytBun.jaBId &&
                            <div className="jaText" id="activeRange">
                                <Bun key={ytBun.jaBId} bId={ytBun.jaBId} bIdRef={bIdRef} />
                            </div>
                        }
                        </>
                :
                <span>{loading ? "　" : t('MESSAGE.EMPTY')}</span>
            }
            <Flex justify='right'>
                <Tooltip title={t('TOOLTIP.ENTER')}>
                    <Button onClick={() => handleSelectId(ytBun)}>{t('BUTTON.MODIFY')}</Button>
                </Tooltip>
            </Flex>
        </div>
    )
}