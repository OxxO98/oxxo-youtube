import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';


//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//config
import { GET_IMG_SRC, span } from '../config/prompt-modal-grid-config'

//CSS@AntD
import { Button, Modal, Flex, Row, Col, Card, Image, Tag } from 'antd'

interface SelectPromptModalProps {
    setPrompt : ( prompt : string ) => void;
}

export const SelectPromptModal = ({ setPrompt } : SelectPromptModalProps) => {
    const { t } = useTranslation('SelectPromptModal');

    //State
    const [videos, setVideos] = useState<RES_GET_VIDEO | null>(null);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    //Hook
    const { response } = useAxiosGet<RES_GET_VIDEO, REQ_GET_VIDEO>('/db/video', false, { opt_disabled : 'false' });
    const { response : resPrompt, loading, setParams } = useAxiosGet<RES_GET_PROMPT, REQ_GET_PROMPT>('/db/auto/prompt', true, null);

    //Handle
    const showModal = () => {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    }

    const handleCardClick = (videoId : string) => {
        setParams({ videoId : videoId });
        setIsModalOpen(false);
    }
    
    //Effect
    useEffect( () => {
        let res = response;
        if( res !== null ){
            setVideos(res.data);
        }
    }, [response])

    useEffect( () => {
        let res = resPrompt;
        if( res !== null ){
            setPrompt(res.data);
        } 
    }, [resPrompt])

    return (
        <>
            <Button type="primary"
                onClick={showModal}
                iconPlacement='end'
                loading={loading}
            >
                {t('BUTTON.TITLE')}
            </Button>
                
            <Modal
                title={t('TITLE')}
                closable={true}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                maskClosable={true}
                footer={[
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
                {
                    videos !== null &&
                    <Row gutter={[16, 16]}
                        style={{ maxHeight : '70vh', overflow : 'scroll' }}
                    >
                    {
                        videos.map( (v) => 
                            <Col span={span.default} 
                                xxl={span.xxl} 
                                xl={span.xl} 
                                lg={span.lg}  
                                md={span.md} 
                                sm={span.sm}  
                                xs={span.xs}  
                                key={v.src}
                            >
                                <Card 
                                    title={v.title}
                                    style={{ height : '100%'}}
                                >
                                    <Image width="100%" src={GET_IMG_SRC(v.src)} preview={false} onClick={() => handleCardClick(v.src)}/>
                                    {
                                        v.tags !== undefined &&
                                        <Flex gap="small" align="center" wrap style={{ margin : '8px 0'}}>
                                        {
                                            
                                            v.tags.map( (t) => <Tag key={t}>{t}</Tag>)
                                        }
                                        </Flex>
                                    }   
                                </Card>
                            </Col>
                        )
                    }
                    </Row>

                }
            </Modal>
        </>
    )
}