import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

//Hook
import { useAxiosPut } from 'shared/hooks/useAxios'
import { useJaText } from 'shared/lib/useJaText';

//entities
import { ComplexText } from 'entities/ComplexText/index'

//Css@antD
import { Button, Modal } from 'antd';

//Redux
import { useAppSelector } from 'shared/store';

interface ModalUpdateHukumuProps {
    handleRefetch : (opt? : string ) => void;
    multiInputData : Array<MultiInput>;
    multiValue : Array<string>;
    newYomi : string;
}

const ModalUpdateHukumu = ({ handleRefetch, multiInputData, multiValue, newYomi } : ModalUpdateHukumuProps ) => {

    const { t } = useTranslation('ModalUpdateHukumu');

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Redux
    const { selectedBun, hukumuData } = useAppSelector( (_state ) => _state.selection );

    //Hook
    const { getHyoukiQuery, getYomiQuery } = useJaText();

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
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
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

export { ModalUpdateHukumu }