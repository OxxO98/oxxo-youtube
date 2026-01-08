import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//ui
import { ImiDromDown } from './ImiDropDown';

//api
import { usePostImi } from '../api/usePostImi';
import { useDeleteImi } from '../api/useDeleteImi';

//CSS@antd
import { Button, Input, Row, Col } from 'antd';

//Redux
import { useAppSelector } from 'shared/store';

const ImiCompStyle = {
    height : '100%', 
    width : '100%', 
    padding : '8px 8px'
}

const ColStyle : React.CSSProperties = {
    height : '32px',
    alignContent : 'center',
    marginBottom : '8px'
}

const ColStyleStart : React.CSSProperties = {
    ...ColStyle,
    justifyContent : 'start',
    textAlign : 'start',
}

const ImiComp = () => {

    //i18n
    const { t } = useTranslation('ImiComp');

    //Redux
    const { hukumuData, selection, selectedBun } = useAppSelector( (_state) => _state.selection);

    //State
    const [value, setValue] = useState<string>('');
    const [imiData, setImiData] = useState<RES_GET_IMI | null>(null)

    //Hook
    const { response, setParams, fetch } = useAxiosGet<RES_GET_IMI, REQ_GET_IMI>('/db/imi', true, null);

    //api
    const clearEdit = () => { setValue(''); setImiData(null) }
    const { postImi } = usePostImi( fetch, clearEdit );
    const { deleteImi } = useDeleteImi( fetch, clearEdit );
    
    //Handle
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null && res.message !== 'empty'){
            setImiData(res.data);
        }
    }, [response])

    useEffect( () => {
        if(hukumuData !== null){
            setParams({ 
                jaBId : selectedBun, 
                startOffset : hukumuData.startOffset,
                endOffset : hukumuData.endOffset
            });
            clearEdit();
        }
    }, [hukumuData, selectedBun, setParams])

    return(
        <>
            <div style={ImiCompStyle}>
            {
                hukumuData !== null ?
                <>
                    <Row gutter={[8, 8]}>
                        <Col span={8} style={ColStyle}>
                            {t('CONTENTS.TANGO')}
                        </Col>
                        <Col span={16} style={{ ...ColStyleStart, paddingLeft : '8px' }}>
                            <ComplexText bId={null} data={hukumuData.hyouki} ruby={hukumuData.yomi} offset={0}/>
                        </Col>
                    </Row>
                    <Row gutter={[8, 8]}>
                        <Col span={8} style={ColStyle}>
                            {t('CONTENTS.IMI')}
                        </Col>
                        <Col flex="auto" style={ColStyleStart}>
                            <Input value={value} onChange={handleChange}/>
                        </Col>
                        <Col push="100px">
                            <Button onClick={ () => postImi(value) }>{t('BUTTON.DONE')}</Button>
                        </Col>
                    </Row>
                    <Row gutter={[8, 8]}>
                        <Col offset={8} flex="auto" style={ColStyle}>
                        {
                            imiData !== null &&
                            <ImiDromDown dropDownImi={imiData.iIds} iId={imiData.iId} fetch={fetch}/>
                        }
                        </Col>
                        {
                            imiData !== null && imiData.iId !== null && 
                            <Col push="100px" style={ColStyleStart}>
                                <Button onClick={ () => deleteImi(imiData.iId) }>{t('BUTTON.DELETE')}</Button>
                            </Col>
                        }
                    </Row>
                </>
                :
                <>
                    <Row gutter={[8, 8]}>
                        <Col span={8} style={ColStyle}>
                            {t('CONTENTS.TANGO')}
                        </Col>
                        <Col span={16} style={ColStyleStart}>
                            {selection}
                        </Col>
                    </Row>
                </>
            }
            </div>
        </>
    )
}

export { ImiComp };
