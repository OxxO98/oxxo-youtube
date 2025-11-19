import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';

//Context
import { VideoContext } from 'contexts/VideoContext';

//Hook
import { useAxiosGet } from 'hooks/AxiosHook';
import { usePDF } from 'hooks/PDFHook';

//CSS
import { Button, Modal,Select } from 'antd';

import { FilePdfOutlined } from '@ant-design/icons'

const PdfModalComp = () => {
    
    //i18n
    const { t } = useTranslation('PdfModalComp');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const pdfOptions = [
        { value : 'both', label : t('SELECT.BOTH') },
        { value : 'tango', label : t('SELECT.TANGO_ONLY') },
        { value : 'kanji', label : t('SELECT.KANJI_ONLY') }
    ]

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pdfList, setPdfList] = useState<RES_PDF_ALL | null>(null);

    const [pdfOption, setPdfOption] = useState<'kanji' | 'tango' | 'both'>('both');

    const { response, setParams } = useAxiosGet<RES_GET_TANGOCHOU_PDF, REQ_GET_TANGOCHOU_PDF>('/db/tangochou/pdf', true, null)

    //Hook
    const { getPdf } = usePDF();

    //Handle
    const showModal = () => {
        setParams({ videoId : videoId })
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleReviewPdf = () => {
        if( pdfList === null ){ return }

        let doc = getPdf(pdfList, pdfOption);

        if( doc === undefined ){ return }

        window.open(doc.output('bloburl'));
    }

    const handleSavePdf = () => {
        if( pdfList === null ){ return }

        let doc = getPdf(pdfList, pdfOption);

        if( doc === undefined ){ return }

        doc.save("a4.pdf");
    }

    const handlePdfOptionChange = (value : 'kanji' | 'tango' | 'both') => {
        setPdfOption(value);
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            setPdfList(res.data);
        }
    }, [response])


    return(
        <>
            <div style={{ textAlign : 'right', margin : '20px' }}>
                <Button onClick={showModal}>
                    {t('BUTTON.TITLE')}<FilePdfOutlined/>
                </Button>

                <Modal
                    title={t('TITLE')}
                    closable={{ 'aria-label': 'Custom Close Button' }}
                    open={isModalOpen}
                    onCancel={handleCancel}
                    width={'80%'}
                    footer={[
                        <Button onClick={handleSavePdf}>{t('BUTTON.SAVE')}</Button>,
                        <Button type='primary' onClick={handleReviewPdf}>{t('BUTTON.REVIEW')}</Button>
                    ]}
                >
                    <Select
                        defaultValue={'both'}
                        value={pdfOption}
                        style={{ minWidth : 120 }}
                        onChange={handlePdfOptionChange}
                        options={pdfOptions}
                    />
                </Modal>
            </div>
        </>
    )
}

export { PdfModalComp }