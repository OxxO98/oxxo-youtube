import { useContext } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//api
import { usePostTranslate } from '../api/usePostTranslate';
import { useDeleteTranslate } from '../api/useDeleteTranslate';
import { useUpdateTranslate } from '../api/useUpdateTranslate';
 
//CSS@Antd
import { Button, Flex, Tooltip } from 'antd'

interface HonyakuControllerProps {
    ytBId : ytBId;
    translates : RES_GET_TRANSLATE;
    value : string;
    clearEdit : () => void;
    fetch : () => void;
}

export const HonyakuController = ({ ytBId, translates, value, clearEdit, fetch } : HonyakuControllerProps) => {
    
    //i18n
    const { t } = useTranslation('HonyakuController');
        
    //Context
    const { videoId } = useContext(VideoContext);

    const { postHonyaku, loading : loadingInsert } = usePostTranslate( fetch, clearEdit );
    const { deleteHonyaku } = useDeleteTranslate( fetch, clearEdit );
    const { updateHonyaku, loading : loadingUpdate } = useUpdateTranslate( fetch, clearEdit );

    //Hotkeys
    useHotkeys('ctrl+enter', () => {
        if( loadingInsert === true || loadingUpdate === true ){ return }
        if( value === '' ){ return }
        if( translates.koBun !== null && translates.koBun.koText !== value ){
            updateHonyaku(videoId, ytBId, value);
        }
        else{
            postHonyaku(videoId, ytBId, value);
        }
    }, { enableOnFormTags : true } )
    useHotkeys('shift+enter', () => { clearEdit() }, { enableOnFormTags : true } )

    return(
        <>
            <Flex justify='flex-end' align='center' gap={8}>
                {
                    translates.koBun !== null &&
                    <Button type='dashed' onClick={() => { deleteHonyaku(videoId, ytBId, translates) }}>{t('BUTTON.DELETE')}</Button>
                }
                {
                    value !== '' &&
                    <>
                    {
                        translates.koBun !== null && translates.koBun.koText !== value ?
                        <Button onClick={() => { postHonyaku(videoId, ytBId, value) }}>{t('BUTTON.SAVE_NEW')}</Button>
                        :
                        <Tooltip title={t('TOOLTIP.CTRL_ENTER')}>
                            <Button onClick={()=>{ postHonyaku(videoId, ytBId, value) }}>{t('BUTTON.SAVE_NEW')}</Button>
                        </Tooltip>
                    }
                    </>
                }
                {
                    translates.koBun !== null && translates.koBun.koText !== value &&
                    <Tooltip title={t('TOOLTIP.CTRL_ENTER')}>
                        <Button onClick={() => updateHonyaku(videoId, ytBId, value)}>{t('BUTTON.MODIFY')}</Button>
                    </Tooltip>
                }
                <Tooltip title={t('TOOLTIP.SHIFT_ENTER')}>
                    <Button type="primary" onClick={clearEdit}>{t('BUTTON.CANCLE')}</Button>
                </Tooltip>
            </Flex>
        </>
    )
}