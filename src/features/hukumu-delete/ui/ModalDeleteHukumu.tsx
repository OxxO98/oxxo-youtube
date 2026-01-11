import { useState } from 'react';
import { useTranslation } from 'react-i18next';

//entities
import { ComplexText } from 'entities/ComplexText/index'

//Css@antD
import { Button, Modal } from 'antd';

//Redux
import { useAppSelector } from 'shared/store';
import { useDeleteHukumu } from '../api/useDeleteHukumu';

interface ModalDeleteHukumuProps {
    handleRefetch : () => void;
}

export const ModalDeleteHukumu = ({ handleRefetch } : ModalDeleteHukumuProps ) => {

    const { t } = useTranslation('ModalDeleteHukumu');
    
    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Redux
    const { selectedBun, hukumuData } = useAppSelector( (_state ) => _state.selection );
    
    const { handleDelete } = useDeleteHukumu( handleRefetch, setIsModalOpen );

    //Effect
    const handleOpen = () => {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    return(
        <>
            <Button type='dashed' onClick={handleOpen}>
                {t('BUTTON.TITLE')}
            </Button>

            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label' : 'Custom Close Button'}}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button onClick={ () => handleDelete(hukumuData, selectedBun) }>
                        {t('BUTTON.DELETE')}
                    </Button>,
                    <Button onClick={handleCancel}>
                        {t('BUTTON.CANCLE')}
                    </Button>
                ]}
            >
                <ComplexText bId={null} data={hukumuData!.hyouki} ruby={hukumuData!.yomi} offset={0}/>
            </Modal>
        </>
    )
}