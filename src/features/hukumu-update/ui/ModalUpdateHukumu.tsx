import { useState } from 'react';
import { useTranslation } from 'react-i18next';

//entities
import { ComplexText } from 'entities/ComplexText/index'

//Css@antD
import { Button, Modal } from 'antd';

//Redux
import { useAppSelector } from 'shared/store';
import { useUpdateHukumu } from '../api/useUpdateHukumu';

interface ModalUpdateHukumuProps {
    handleRefetch : () => void;
    multiInputData : MultiInput[];
    multiValue : string[];
    newYomi : string;
}

const ModalUpdateHukumu = ({ handleRefetch, multiInputData, multiValue, newYomi } : ModalUpdateHukumuProps ) => {

    const { t } = useTranslation('ModalUpdateHukumu');

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Redux
    const { selectedBun, hukumuData } = useAppSelector( (_state ) => _state.selection );

    const { handleUpdate } = useUpdateHukumu(handleRefetch, setIsModalOpen, multiInputData, multiValue);

    //Handle
    const handleOpen = () => {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    return(
        <>
            <Button onClick={handleOpen}>
                {t('BUTTON.TITLE')}
            </Button>
            
            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Button onClick={ () => handleUpdate(hukumuData, selectedBun, newYomi) }>
                        {t('BUTTON.MODIFY')}
                    </Button>,
                    <Button onClick={handleCancel}>
                        {t('BUTTON.CANCLE')}
                    </Button>
                ]}
            >
                <div>
                    {t('MESSAGE.0.0')}<ComplexText bId={null} data={hukumuData!.hyouki} ruby={hukumuData!.yomi} offset={0}/>{t('MESSAGE.0.1')}<ComplexText bId={null} data={hukumuData!.hyouki} ruby={newYomi} offset={0}/>{t('MESSAGE.0.2')}
                </div>
                <div>
                    {t('MESSAGE.1.0')}{hukumuData!.yomi}
                </div>
                <div>
                    {t('MESSAGE.2.0')}{newYomi}
                </div>                
            </Modal>
        </>
    )
}

export { ModalUpdateHukumu }