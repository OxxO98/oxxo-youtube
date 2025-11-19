import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

//Component
import { ComplexText } from 'components/Bun'

//Hook
import { useAxiosPut, useAxiosDelete } from 'hooks/AxiosHook'
import { useJaText } from 'hooks/JaTextHook';

//Css@antD
import { Button, Modal } from 'antd';


//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';

interface ModalDeleteHukumuProps {
    handleRefetch : (opt? : string[]) => void;
}

interface ModalUpdateHukumuProps {
    handleRefetch : (opt? : string ) => void;
    multiInputData : Array<MultiInput>;
    multiValue : Array<string>;
    newYomi : string;
}

const ModalDeleteHukumu = ({ handleRefetch } : ModalDeleteHukumuProps ) => {

    const { t } = useTranslation('ModalDeleteHukumu');
    
    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Redux
    const { selectedBun, textOffset, hukumuData } = useSelector( (_state : RootState ) => _state.selection );

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
            startOffset : textOffset.startOffset, endOffset : textOffset.endOffset,
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

const ModalUpdateHukumu = ({ handleRefetch, multiInputData, multiValue, newYomi } : ModalUpdateHukumuProps ) => {

    const { t } = useTranslation('ModalUpdateHukumu');

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Redux
    const { selectedBun, textOffset, hukumuData } = useSelector( (_state : RootState ) => _state.selection );

    //Hook
    const { getHyoukiQuery, getYomiQuery } = useJaText();

    //updateYomi
    const {response : res, setParams } = useAxiosPut<null, REQ_PUT_HUKUMU>('/db/hukumu', true, null);

    const handleOpen = () => {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    const handleUpdate = () => {
        if(hukumuData === null){ return }
        
        let _hyouki = getHyoukiQuery(multiInputData);
        let _yomi = getYomiQuery(multiInputData, multiValue);

        setParams({
            jaBId : selectedBun,
            startOffset : textOffset.startOffset, endOffset : textOffset.endOffset,
            hyId : hukumuData.hyId, 
            hyouki : _hyouki, yomi : _yomi,
            hyoukiStr : hukumuData.hyouki, yomiStr : newYomi
        })
    }

    useEffect( () => {
        if(res !== null){
            handleRefetch();
            setIsModalOpen(false);
        }
    }, [res, handleRefetch])

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
                    <Button onClick={handleUpdate}>
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

export { ModalUpdateHukumu, ModalDeleteHukumu }