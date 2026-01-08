import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

//Hook
import { useAxiosDelete } from 'shared/hooks/useAxios'

//entities
import { ComplexText } from 'entities/ComplexText/index'

//Css@antD
import { Button, Modal } from 'antd';

//Redux
import { useAppSelector } from 'shared/store';

interface ModalDeleteHukumuProps {
    handleRefetch : (opt? : string[]) => void;
}

export const ModalDeleteHukumu = ({ handleRefetch } : ModalDeleteHukumuProps ) => {

    const { t } = useTranslation('ModalDeleteHukumu');
    
    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Redux
    const { selectedBun, hukumuData } = useAppSelector( (_state ) => _state.selection );

    //Hook
    const { response, setParams } = useAxiosDelete<null, REQ_DELETE_HUKUMU>('/db/hukumu', true, null);

    const handleOpen = () => {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    const handleDelete = () => {
        if(hukumuData === null){ return }

        setParams({
            jaBId : selectedBun,
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
            hyId : hukumuData.hyId
        })
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            handleRefetch();
            setIsModalOpen(false);
        }
    }, [response, handleRefetch])

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
                    <Button onClick={handleDelete}>
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