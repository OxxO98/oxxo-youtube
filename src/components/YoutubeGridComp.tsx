import React, {useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';

//Hook
import { useAxiosGet, useAxiosPost, useAxiosPut, useAxiosDelete } from 'hooks/AxiosHook';

//CSS@AntD
import { Card, Row, Col, Button, Modal, Steps, theme, Input, Space, Form, Flex, Image, Select, Tag, notification, Empty, Alert, Divider } from "antd";
import { PlusSquareOutlined, EllipsisOutlined, WarningOutlined } from '@ant-design/icons'
import type { SelectProps, GetProps } from 'antd'

type SearchProps = GetProps<typeof Input.Search>;

interface ModalNewVideoProps {
    refetch : () => void;
}

interface ModalEditVideoProps {
    data : RES_VIDEO;
    refetch : () => void;
}

interface VideoCardListCompProps {
    list : RES_VIDEO[];
    refetch : () => void;
}

interface ModalDeleteVideoProps {
    videoId : string;
    refetch : () => void;
}

const YoutubeGridComp = () => {

    //State
    const [videos, setVideos] = useState<RES_GET_VIDEO | null>(null);
    const [list, setList] = useState<RES_GET_VIDEO_SEARCH | null>(null);
    const [value, setValue] = useState<string>('');
    
    const [messageApi, contextHolder] = notification.useNotification();

    //Hook
    const { response, fetch : refetch } = useAxiosGet<RES_GET_VIDEO, REQ_GET_VIDEO>('/db/video', false, null);
    const { response : resSearch, setParams : setParamsSearch } = useAxiosGet<RES_GET_VIDEO_SEARCH, REQ_GET_VIDEO_SEARCH>('/db/video/search', true, null);

    const { response : resIntegrity, fetch  } = useAxiosGet<RES_GET_INTEGRITY, REQ_GET_INTEGRITY>('/db/integrity', true, null);

    const navigate = useNavigate();
    const location = useLocation();

    //Handle
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setValue( e.target.value );
    }

    const handleKeyDown = (e : React.KeyboardEvent) => {
        if(e.key === 'Enter'){
            submitSearch();
        }
    }

    const onSearch : SearchProps['onSearch'] = (value, _e, info) => {
        if(info?.source === 'input'){ submitSearch(); }
        if(info?.source === 'clear'){ deleteSearch(); }
    }

    const submitSearch = () => {
        if(value === ''){
            deleteSearch();
            return;
        }
        navigate(`/?keyword=${value}`);
    }

    const deleteSearch = () => {
        setValue('');
        navigate(`/`);
        setList(null);
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
    
    useEffect( () => {
        let search = location.search;
        let params = new URLSearchParams(search);
        let keyword = params.get('keyword');

        if(keyword === null){ return }

        setParamsSearch({ keyword : keyword });
    }, [location, setParamsSearch])

    useEffect( () => {
        let res = resSearch;
        if(res !== null){
            setList(res.data)
        }
    }, [resSearch])

    return(
        <>
            {contextHolder}
            <Flex justify='right' style={{ margin : '8px 0'}} gap={16}>
                <NewVideoComp refetch={refetch}/>
                <Flex align='center' style={{ width : '100%'}}>
                    <Input.Search allowClear name="search" value={value} onChange={handleChange} autoComplete='off' onKeyDown={handleKeyDown} onSearch={onSearch}/>
                </Flex>
            </Flex>
            {
                list !== null ?
                    list.length !== 0 ?
                        <VideoCardListComp list={list} refetch={refetch}/>
                    :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                :
                videos !== null ?
                    videos.length !== 0 ?
                        <VideoCardListComp list={videos} refetch={refetch}/>
                    :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }
        </>
    )
}

const VideoCardListComp = ({ list, refetch } : VideoCardListCompProps ) => {

    //Hook
    const navigate = useNavigate();
    
    //Handle
    const handleCardClick = (videoId : string) => {
        navigate(`/video/${videoId}`);
    }

    return(
        <Row gutter={[16, 16]}>
        {
            list.map( (v) => 
                <Col span={6} xxl={4} xl={6} lg={6} md={8} sm={12} xs={24} key={v.src}>
                    <Card 
                        title={v.title}
                        extra={
                            <ModalEditVideo data={v} refetch={refetch}/>
                        }
                        style={{ height : '100%'}}
                    >
                        <Image width="100%" src={`https://i.ytimg.com/vi/${v.src}/hqdefault.jpg`} preview={false} onClick={() => handleCardClick(v.src)}/>
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

const ModalEditVideo = ({ data, refetch } : ModalEditVideoProps ) => {
    
    //i18n
    const { t } = useTranslation('ModalEditVideo');

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [options, ] = useState<SelectProps['options']>([]);
    const [tags, setTags] = useState<string[]>(data.tags ?? []);

    const [input, setInput] = useState<string>(data.title);

    //Hook
    const { response, setParams } = useAxiosPut<null, REQ_PUT_VIDEO>('/db/video', true, null);

    //Handle
    const showModal = () => {
        setIsModalOpen(true);

        setInput(data.title);
        setTags(data.tags ?? []);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    
    const handleSelectChange = (value: string[]) => {
        setTags(value);
    };

    const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }

    const handleSubmit = () => {
        if(input === '') return;

        setParams({ videoId : data.src, newTitle : input, newTagsQuery : tags.join('@') });
    }

    useEffect( () => {
        let res = response
        if( res !== null){
            refetch();
            setIsModalOpen(false);
        }
    }, [response, refetch])

    return (
        <>
            <EllipsisOutlined onClick={showModal}/>
            
            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Button onClick={handleSubmit} type='primary'>{t('BUTTON.MODIFY')}</Button>,
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
                <Input defaultValue={data.title} value={input} onChange={handleInputChange}/>
                <Divider />
                <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="Tags Mode"
                    onChange={handleSelectChange}
                    options={options}
                    defaultValue={data.tags}
                />
                <Divider />
                <Alert message={t('ALERT')} description={
                    <ModalDeleteVideo videoId={data.src} refetch={refetch}/>
                } type="error" showIcon icon={<WarningOutlined />}/>
            </Modal>
        </>
    )
}

const ModalDeleteVideo = ({ videoId, refetch } : ModalDeleteVideoProps ) => {
    
    //i18n
    const { t } = useTranslation('ModalDeleteVideo');

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Hook
    const { response : resDelete, setParams : setParamsDelete } = useAxiosDelete<null, REQ_DELETE_VIDEO>('/db/video', true, null);

    //Handle
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        setParamsDelete({ videoId : videoId });
    }

    useEffect( () => {
        let res = resDelete;
        if( res !== null ){
            refetch();
            setIsModalOpen(false);
        }
    }, [resDelete, refetch])


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

export { YoutubeGridComp }