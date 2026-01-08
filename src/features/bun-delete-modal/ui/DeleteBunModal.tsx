import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook';

//Hook
import { useAxiosDelete, useAxiosGet } from 'shared/hooks/useAxios';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//CSS@antD
import { Button, Flex, Modal, Card } from 'antd';
import { VideoContext } from 'shared/contexts/VideoContext';

interface DeleteBunModalCompProps {
    ytb : RES_TIMELINE;
    refetchTimeline : () => void;
    cancelEdit : () => void;
}

export const DeleteBunModalComp = ({ ytb, refetchTimeline, cancelEdit } : DeleteBunModalCompProps ) => {

    //i18n
    const { t } = useTranslation('DeleteBunModalComp');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hukumuData, setHukumuData] = useState<Array<HukumuData> | null>(null);

    //Hook
    const { response, setParams } = useAxiosGet<RES_GET_HUKUMU, REQ_GET_HUKUMU>('/db/hukumu', true, null);

    const { response : resDelete, setParams : setParamsDelete } = useAxiosDelete<null, REQ_DELETE_HUKUMU_BUN>('/db/hukumu/bun', true, null);

    //Handle
    const showModal = () => {
        setParams({ jaBId : ytb.jaBId });
        setIsModalOpen(true);
    };

    const handleOk = () => {
        deleteBun();
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const deleteBun = () => {
        setParamsDelete({ videoId : videoId, ytBId : ytb.ytBId, jaBId : ytb.jaBId })
    }

    //HotKeys
    useHotkeys('shift+enter', () => handleCancel(), { enableOnFormTags : true, enabled : isModalOpen }, [isModalOpen] )

    //Effect
    useEffect( () => {
        let res = response;
        if( res !== null ){
            setHukumuData(res.data);
        }
    }, [response])

    useEffect( () => {
        let res = resDelete;
        if(res !== null){
            refetchTimeline();
            cancelEdit();
        }
    }, [resDelete, refetchTimeline, cancelEdit])


    return(
        <>
            <Button onClick={showModal}>{t('BUTTON.TITLE')}</Button>
            
            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>,
                    <Button type="primary" onClick={handleOk}>{t('BUTTON.DONE')}</Button>
                ]}
            >
                <div>{t('CONTENTS.0')}</div>
                <Flex gap={16}>
                {
                    hukumuData !== null &&
                    hukumuData.map( (v) => 
                        <Card>
                            <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>
                        </Card>
                    )
                }
                </Flex>
            </Modal>
        </>
    )
}