import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

//ui
import { ModalDeleteVideo } from './ModalDeleteVideo';

//api
import { useUpdateVideo } from '../api/useUpdateVideo';

//CSS@AntD
import { Button, Modal, Input, Select, Alert, Divider } from "antd";
import { EllipsisOutlined, WarningOutlined } from '@ant-design/icons'
import type { SelectProps } from 'antd'

interface ModalEditVideoProps {
    data : RES_VIDEO;
    refetch : () => void;
}

export const ModalEditVideo = ({ data, refetch } : ModalEditVideoProps ) => {
    
    //i18n
    const { t } = useTranslation('ModalEditVideo');

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [options, ] = useState<SelectProps['options']>([]);
    const [tags, setTags] = useState<string[]>(data.tags ?? []);

    const [input, setInput] = useState<string>(data.title);

    //api
    const { editVideo } = useUpdateVideo(refetch, setIsModalOpen);
    
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
        editVideo(data, input, tags);
    }

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