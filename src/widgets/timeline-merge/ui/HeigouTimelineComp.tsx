import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//api
import { useMerge } from '../api/useMerge';

//CSS@antD
import { Button, Flex, Modal, Card, Tooltip } from 'antd';
import { MergeCellsOutlined } from '@ant-design/icons'
import { VideoContext } from 'shared/contexts/VideoContext';

interface HeigouTimelineCompProps {
    bunIds : RES_TIMELINE[] | null;
    ytb : RES_TIMELINE;
    refetchTimeline : () => void;
    refetchHandles : RefetchHandles;
    cancelEdit : () => void;
}

export const HeigouTimelineComp = ({ bunIds, ytb, refetchTimeline, refetchHandles, cancelEdit } : HeigouTimelineCompProps ) => {

    //i18n
    const { t } = useTranslation('HeigouTimelineComp');

    //Context
    const { videoId } = useContext(VideoContext);

    //Hook
    const { heigouBun } = useMerge( videoId, bunIds, refetchTimeline, refetchHandles, cancelEdit );

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleOk = () => {
        heigouBun( ytb );
        setIsModalOpen(false);
    };

    //HotKeys
    let _index = bunIds !== null ? bunIds.findIndex( (v) => v.ytBId === ytb.ytBId ) : null;

    let _isOk = _index !== null && bunIds !== null && _index !== bunIds.length-1;
    
    useHotkeys('ctrl+e', () => showModal(), { enableOnFormTags : true, enabled : !isModalOpen, preventDefault : true }, [isModalOpen] )
    
    const ref = useHotkeys<HTMLDivElement>('ctrl+enter', () => handleOk(), { enableOnFormTags : true, enabled : isModalOpen && _isOk }, [isModalOpen, _isOk] )
    useHotkeys('shift+enter', () => handleCancel(), { enableOnFormTags : true, enabled : isModalOpen }, [isModalOpen] )

    return(
        <>
            <Tooltip title={t('TOOLTIP.HEIGOU')}>
                <Button onClick={showModal}>{t('BUTTON.TITLE')}<MergeCellsOutlined /></Button>
            </Tooltip>
            
            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Tooltip title={t('TOOLTIP.CTRL_ENTER')}>
                        <Button type='primary' disabled={!_isOk} onClick={handleOk}>{t('BUTTON.DONE')}</Button>
                    </Tooltip>,
                    <Tooltip title={t('TOOLTIP.SHIFT_ENTER')}>
                        <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                    </Tooltip>
                ]}
                panelRef={ref}
                destroyOnHidden={true}
            >
                <div>{t('CONTENTS.0')}</div>
                <Flex gap={16}>
                {
                    _index !== null && bunIds !== null && _index !== bunIds.length-1 &&
                    <>
                        <Card>
                            <div>{bunIds[_index].jaText}</div> 
                            <div>{bunIds[_index].koText}</div>
                        </Card>
                        <Card>
                            <div>{bunIds[_index+1].jaText}</div>
                            <div>{bunIds[_index+1].koText}</div>
                        </Card>
                    </>
                }
                </Flex>
            </Modal>
        </>
    )
}