import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from 'react-hotkeys-hook';

//hooks
import { useJaText } from 'shared/lib/useJaText';

//entities
import { ComplexText } from 'entities/ComplexText/index'

//ui
import { AccordianTangoDB } from './AccordianTangoDB';

//api
import { usePostNewTango } from '../api/usePostNewTango';
import { useCheckTango } from '../api/useCheckTango';

//lib
import { useSearchedList } from '../lib/useSearchedList';

//Redux
import { useAppSelector } from 'shared/store';

//Css@antD
import { Button, Modal } from 'antd';

interface ModalTangoDBProps {
    multiInputData : MultiInput[];
    multiValue : string[];
    value : string;
    handleRefetch : () => void;
}

export const ModalTangoDB = ({ multiInputData, multiValue, value, handleRefetch } : ModalTangoDBProps ) => {

    const { t } = useTranslation('ModalTangoDB');

    //Redux
    const { selection, selectedBun, textOffset } = useAppSelector( (_state) => _state.selection);

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState<SearchText | null>(null);

    const [searchedList, setSearchedList] = useState<TangoDBSearchedList | null>(null);

    //Hook
    const { isAllNihongo } = useJaText();

    //API
    const { response, checkTango } = useCheckTango();
    const { postNewTango } = usePostNewTango( handleRefetch );

    //lib
    const { getSearchedList } = useSearchedList();
    const sanitizedValue = value.replace(/[\r\n]/g, '');

    //Handle
    const showModal = useCallback(() => {
        setSearchText({ hyouki : selection, yomi : sanitizedValue });
        setIsModalOpen(true);
    }, [selection, sanitizedValue]);

    useHotkeys('ctrl+enter', (e) => {
        e.preventDefault();
        showModal();
    }, { enableOnFormTags : true, enabled : !isModalOpen, preventDefault : true }, [showModal, isModalOpen])

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = (tId : string | null) => {
        if( isAllNihongo(sanitizedValue) === false ){ return }

        postNewTango(multiInputData, multiValue, textOffset, selectedBun, selection, sanitizedValue, tId);
        setIsModalOpen(false);
    }

    //Effect
    useEffect( () => {
        if(searchText !== null){
            checkTango(multiInputData, multiValue, searchText);
            setSearchedList(null);
        }
    }, [searchText, checkTango]);

    useEffect( () => {
        let res = response;
        if(res !== null && searchText !== null){
            let _searchedList = getSearchedList(selection, sanitizedValue, searchText, res.data);

            setSearchedList(_searchedList);
        }
    }, [response, getSearchedList])

    const isKanzen = searchedList?.kanzen !== undefined && searchedList.kanzen.length > 0

    return (
        <>
            <Button disabled={isAllNihongo(sanitizedValue) === false || multiInputData.filter( (v, i) => v.inputBool === true && multiValue[i] === '' ).length > 0 } type='primary' onClick={showModal}>{t('BUTTON.TITLE')}</Button>

            <Modal title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                height={'70vh'}
                styles={{ 
                    content : { height : '80vh' }, body : { minHeight : '90%'}
                }}
                footer={[
                    <Button type={ isKanzen ? "dashed" : "primary"} onClick={() => handleSubmit(null)}>{t('BUTTON.SAVE_NEW')}</Button>,
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
                <ComplexText bId={'tango'} data={selection} ruby={sanitizedValue} offset={0}/>
                <AccordianTangoDB searchedList={searchedList} handleSubmit={handleSubmit}/>
            </Modal>
        </>
    );
}

export default ModalTangoDB;
