import { useState } from 'react';
import { useTranslation } from 'react-i18next';

//api
import { useDeleteVideo } from '../api/useDeleteVideo';

//CSS@AntD
import { Button, Modal } from "antd";

interface ModalDeleteVideoProps {
    videoId : string;
    refetch : () => void;
}

export const ModalDeleteVideo = ({ videoId, refetch } : ModalDeleteVideoProps ) => {
    
    //i18n
    const { t } = useTranslation('ModalDeleteVideo');

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    //api
    const { deleteVideo } = useDeleteVideo( refetch, setIsModalOpen );
    
    //Handle
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        deleteVideo(videoId);
    }

    return (
        <>
            <Button variant="outlined" color="primary" onClick={showModal}>{t('BUTTON.TITLE')}</Button>

            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'50%'}
                footer={[
                    <Button type='primary' onClick={handleDelete}>{t('BUTTON.DELETE')}</Button>,
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
            </Modal>
        </>
    )
}