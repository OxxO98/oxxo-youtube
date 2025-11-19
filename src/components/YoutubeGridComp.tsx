import React, {useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';

//Hook
import { useAxiosGet, useAxiosPost } from 'hooks/AxiosHook';

//CSS@AntD
import { Card, Row, Col, Button, Modal, Steps, theme, Input, Space, Form, Flex, Image, notification } from "antd";
import { PlusSquareOutlined } from '@ant-design/icons'

interface ModalNewVideoProps {
    refetch : () => void;
}

const YoutubeGridComp = () => {

    //State
    const [videos, setVideos] = useState<RES_GET_VIDEO | null>(null);
    
    const [messageApi, contextHolder] = notification.useNotification();

    //Hook
    const { response, fetch : refetch } = useAxiosGet<RES_GET_VIDEO, REQ_GET_VIDEO>('/db/video', false, null);

    const { response : resIntegrity, fetch  } = useAxiosGet<RES_GET_INTEGRITY, REQ_GET_INTEGRITY>('/db/integrity', true, null);

    const navigate = useNavigate();

    //Handle
    const handleCardClick = (videoId : string) => {
        navigate(`/video/${videoId}`);
    }

    useEffect( () => {
        let res = response;
        if( res !== null ){
            setVideos(res.data);
            fetch();
        }
    }, [response, fetch])

        //무결성
    useEffect( () => {
        let res = resIntegrity;
        if( res !== null ){
            if(res.message === 'done'){
                messageApi['success']({
                    message: '무결성 체크',
                    description: '완료',
                    placement : 'bottomRight'
                });
            }
        }
    }, [resIntegrity, messageApi])

    return(
        <>
            {contextHolder}
            <Flex justify='right' style={{ margin : '8px 0'}}>
                <NewVideoComp refetch={refetch}/>
            </Flex>
            <Row gutter={[16, 16]}>
                {
                    videos && videos.map( (v) => 
                        <Col span={6} xxl={4} xl={6} lg={6} md={8} sm={12} xs={24} key={v.src}>
                            <Card title={v.title} onClick={() => handleCardClick(v.src)}>
                                <Image width="100%" src={`https://i.ytimg.com/vi/${v.src}/hqdefault.jpg`} preview={false}/>
                            </Card>
                        </Col>
                    )
                }
            </Row>
            
        </>
    )
}

const NewVideoComp = ({ refetch } : ModalNewVideoProps ) => {

    //i18n
    const { t } = useTranslation('NewVideoComp');

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);

    const [inputs, setInputs] = useState({
        youtubeSrc : '',
        title : '',
    });

    const steps = [
        {
            title: t('STEPS.0'),
        },
        {
            title: t('STEPS.1'),
        },
    ];

    const items = steps.map((item) => ({ key: item.title, title: item.title }));

    const contentStyle: React.CSSProperties = {
        lineHeight: '120px',
        textAlign: 'center',
        justifyContent : 'center',
        width : '100%',
        color: token.colorTextTertiary,
        backgroundColor: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        border: `1px dashed ${token.colorBorder}`,
        marginTop: 16,
    };

    const isTitle = inputs.title !== '';

    //Hook
    const { response, setParams } = useAxiosPost<null, REQ_POST_VIDEO>('/db/video', true, null);

    //Handle

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setInputs(prevState => ({
            ...prevState,
            [e.target.name] : e.target.value,
        }));
    }

    const postVideo = () => {
        setParams(inputs);
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            setIsModalOpen(false);
            refetch();
        }
    }, [response, refetch])

    useEffect( () => {
        let matched = inputs.youtubeSrc.match(/^https?:\/\/youtu.be\/([a-zA-Z0-9_-]+)/);
        if( matched ){
            setInputs(prevState => ({
                ...prevState,
                youtubeSrc : matched![1]
            }));
        }
        let matchedYoutube = inputs.youtubeSrc.match(/^https?:\/\/www.youtube.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        if( matchedYoutube ){
            setInputs(prevState => ({
                ...prevState,
                youtubeSrc : matchedYoutube![1]
            }));
        }
    }, [inputs.youtubeSrc])

    return(
        <>
            <Button type="primary" onClick={showModal}>
                {t('TITLE')}<PlusSquareOutlined/>
            </Button>

            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[ ]}
            >
                <Steps current={current} items={items} />
                <Flex style={contentStyle} vertical align='center' gap={16}>
                    {current === 0 && (
                        <Space align='baseline'>
                            <Form
                                name="youtubeSrc"
                                labelCol={{span : 8}}
                                wrapperCol={{ span: 16 }}  
                                autoComplete='off'
                            >
                                <Form.Item label={t('LABEL.0')}>
                                    <Input addonBefore="https://youtu.be/" size="middle" placeholder="large size" name='youtubeSrc' onChange={handleInputChange} value={inputs.youtubeSrc}/>
                                </Form.Item>
                            </Form>
                        </Space>
                    )}
                    {current === 1 && (
                        <>
                            <ReactPlayer
                                src={`https://youtu.be/${inputs.youtubeSrc}`}
                                style={{ width: '80%', height: 'auto', aspectRatio: '16/9' }}
                            />
                            <Space align='baseline'>
                                <Form>
                                    <Form.Item label={t('LABEL.1')}>
                                        <Input size="middle" placeholder="large size" name='title' onChange={handleInputChange} value={inputs.title}/>
                                    </Form.Item>
                                </Form>
                            </Space>
                        </>
                    )}
                </Flex>
                <div style={{ marginTop: 24 }}>
                    <Flex justify='flex-end'>
                        {current > 0 && (
                            <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                                {t('BUTTON.PREV')}
                            </Button>
                        )}
                        {current === steps.length - 1 && isTitle && (
                            <Button type="primary" onClick={() => postVideo()}>
                                {t('BUTTON.DONE')}
                            </Button>
                        )}
                        {current < steps.length - 1 && (
                            <Button type="primary" onClick={() => next()} disabled={inputs.youtubeSrc === ''}>
                                {t('BUTTON.NEXT')}
                            </Button>
                        )}
                    </Flex>
                </div>
            </Modal>
        </>
    )
}

export { YoutubeGridComp }