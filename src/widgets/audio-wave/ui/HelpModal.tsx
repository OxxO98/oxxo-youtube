import { useState } from 'react';
import { useTranslation } from 'react-i18next'

//CSS@antD
import { Button, Modal, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'

const HelpData = [4, 5, 6, 2, 5]

export const HelpModal = () => {

    //i18n
    const { t } = useTranslation('HelpModal');

    const items : CollapseProps['items'] = HelpData.map( (v, i) => {
        return {
            key : (i+1).toString(),
            label : t(`CONTENTS.${i}.TITLE`),
            children : 
                <div key={(i+1).toString()}>
                {
                    Array.from({ length : v }, (_, idx) => idx).map( (ch) => 
                        <div key={ch.toString()}>
                        {t(`CONTENTS.${i}.ITEMS.${ch}`)}
                        </div>
                    )
                }
                </div>
        }
    })

    //State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return(
        <>
            <Button onClick={showModal}>{t('BUTTON.TITLE')}<QuestionCircleOutlined /></Button>

            <Modal
                title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key={'BUTTON.CANCLE'} onClick={handleOk}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
                <Collapse accordion items={items} defaultActiveKey={['1']}/>
            </Modal>
        </>
        
    )
}