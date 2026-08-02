import { useContext } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//features
import { DeleteBunModalComp } from 'features/bun-delete-modal/index'
import { UpdateBunJaTextModalComp } from 'features/bun-update-modal/index';

import { usePostTranslate } from 'features/ko-post-button/index';
import { useDeleteTranslate } from 'features/ko-delete-button/index';
import { useUpdateTranslate } from 'features/ko-update-button/index';

import { usePostJaText } from '../api/usePostJaText';
 
//CSS@Antd
import { Button, Flex, Tooltip } from 'antd'

interface HonyakuControllerProps {
    ytBId : string;
    translates : RES_GET_TRANSLATE;
    value : string;
    clearEdit : () => void;
    fetch : () => void;
}

interface SaveNewControllerProps {
    translates : RES_GET_TRANSLATE; 
    value : string;
    postHonyaku : (videoId : string, ytBId : string, value : string) => void;
    postJaText : (videoId : string, ytBId : string, value : string) => void;
    ytBId : string;
}

interface DeleteControllerProps {
    translates : RES_GET_TRANSLATE;
    deleteHonyaku : (videoId : string, ytBId : string, koBId : string | null) => void;
    ytBId : string;
}

interface UpdateControllerProps {
    translates : RES_GET_TRANSLATE;
    value : string;
    updateHonyaku : (videoId : string, ytBId : string, value : string) => void;
    ytBId : string;
}

export const HonyakuController = ({ ytBId, translates, value, clearEdit, fetch } : HonyakuControllerProps) => {
    
    //i18n
    const { t } = useTranslation('HonyakuController');

    //Context
    const { videoId, translationDirection } = useContext(VideoContext);

    const { postJaText } = usePostJaText( fetch, clearEdit );
    
    const { postHonyaku, loading : loadingInsert } = usePostTranslate( fetch, clearEdit );
    const { deleteHonyaku } = useDeleteTranslate( fetch, clearEdit );
    const { updateHonyaku, loading : loadingUpdate } = useUpdateTranslate( fetch, clearEdit );

    //Hotkeys
    useHotkeys('ctrl+enter', () => {
        if( loadingInsert === true || loadingUpdate === true ){ return }
        if( value === '' ){ return }
        if( translationDirection === 'ja-ko' ){
            if( translates.koBun !== null && translates.koBun.koText !== value ){
                updateHonyaku(videoId, ytBId, value);
            }
            else{
                postHonyaku(videoId, ytBId, value);
            }
        }
        else{
            if( !(translates.jaBun !== null && translates.jaBun.jaText !== value) ){
                postJaText(videoId, ytBId, value)
            }
        }
    }, { enableOnFormTags : true } )
    useHotkeys('shift+enter', () => { clearEdit() }, { enableOnFormTags : true } )

    return(
        <>
            <Flex justify='flex-end' align='center' gap={8}>
                <DeleteController translates={translates} deleteHonyaku={deleteHonyaku} ytBId={ytBId}/>
                {
                    value !== '' &&
                    <SaveNewController translates={translates} value={value} postHonyaku={postHonyaku} postJaText={postJaText} ytBId={ytBId}/>
                }
                <UpdateController translates={translates} value={value} updateHonyaku={updateHonyaku} ytBId={ytBId}/>
                <Tooltip title={t('TOOLTIP.SHIFT_ENTER')}>
                    <Button type="primary" onClick={clearEdit}>{t('BUTTON.CANCLE')}</Button>
                </Tooltip>
            </Flex>
        </>
    )
}

const SaveNewController = ({ translates, value, postHonyaku, postJaText, ytBId } : SaveNewControllerProps ) => {
    //i18n
    const { t } = useTranslation('HonyakuController');

    //Context
    const { videoId, translationDirection } = useContext(VideoContext);

    return (
        <>
        {
            translationDirection === 'ja-ko' ?
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
            :
                <>
                {
                    translates.jaBun !== null && translates.jaBun.jaText !== value ?
                        <Button onClick={() => { postJaText(videoId, ytBId, value) }}>{t('BUTTON.SAVE_NEW')}</Button>
                    :
                        <Tooltip title={t('TOOLTIP.CTRL_ENTER')}>
                            <Button onClick={() => { postJaText(videoId, ytBId, value) }}>{t('BUTTON.SAVE_NEW')}</Button>
                        </Tooltip>
                }
                </>
        }
        </>
    )
}

const DeleteController = ({ translates, deleteHonyaku, ytBId } : DeleteControllerProps ) => {
    //i18n
    const { t } = useTranslation('HonyakuController');
        
    //Context
    const { videoId, translationDirection } = useContext(VideoContext);

    return(
        <>
        {
            translationDirection === 'ja-ko' ?
                translates.koBun !== null &&
                <Button type='dashed' onClick={() => { deleteHonyaku(videoId, ytBId, translates.koBun?.koBId ?? null ) }}>{t('BUTTON.DELETE')}</Button>
            :
                translates.jaBun !== null &&
                <DeleteBunModalComp ytBId={ytBId}/>
        }
        </>
    )
}

const UpdateController = ({ translates, value, updateHonyaku, ytBId } : UpdateControllerProps ) => {
    //i18n
    const { t } = useTranslation('HonyakuController');
        
    //Context
    const { videoId, translationDirection } = useContext(VideoContext);

    return(
        <>
        {
            translationDirection === 'ja-ko' ?
                translates.koBun !== null && translates.koBun.koText !== value && 
                <Tooltip title={t('TOOLTIP.CTRL_ENTER')}>
                    <Button onClick={() => updateHonyaku(videoId, ytBId, value)}>{t('BUTTON.MODIFY')}</Button>
                </Tooltip>
            :
                translates.jaBun !== null && translates.jaBun.jaText !== value &&
                <UpdateBunJaTextModalComp jaBId={translates.jaBun.jaBId} jaText={translates.jaBun.jaText} defaultValue={value}/>
        }
        </>
    )
}