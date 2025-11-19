import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

//Component
import { ComplexText } from 'components/Bun';

//Hook
import { useAxiosGet, useAxiosPost, useAxiosPut, useAxiosDelete } from 'hooks/AxiosHook';

//CSS@antd
import { Button, Select, Input, Row, Col } from 'antd';

//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';

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

interface ImiDromDownProps {
    hukumuData : HukumuData | null;
    selectedBun : string;
    dropDownImi : imiData[] | null;
    iId : string | null;
    fetch : () => void;
}

const ImiComp = () => {

    //i18n
    const { t } = useTranslation('ImiComp');

    //Redux
    const { hukumuData, selection, selectedBun } = useSelector( (_state : RootState) => _state.selection);

    //State
    const [value, setValue] = useState<string>('');
    const [imiData, setImiData] = useState<RES_GET_IMI | null>(null)

    const { response, setParams, fetch } = useAxiosGet<RES_GET_IMI, REQ_GET_IMI>('/db/imi', true, null);

    const { response : resPostImi, setParams : setParamsPostImi } = useAxiosPost<null, REQ_POST_IMI>('/db/imi', true, null);
    const { response : resDeleteImi, setParams : setParamsDelete } = useAxiosDelete<null, REQ_DELETE_IMI>('/db/imi', true, null);

    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    const postImi = () => {
        if( !hukumuData ){ return } 

        setParamsPostImi({
            jaBId : selectedBun,
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
            tId : hukumuData.tId, value : value
        })
    }

    const deleteImi = ( _iId : string ) => {
        if( !hukumuData ){ return } 

        setParamsDelete({
            jaBId : selectedBun,
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
            iId : _iId
        })
    }

    useEffect( () => {
        let res = response;
        if(res !== null && res.message !== 'empty'){
            setImiData(res.data);
        }
    }, [response])

    useEffect( () => {
        if( resPostImi !== null || resDeleteImi !== null ){
            fetch();
            setValue('');
            setImiData(null)
        }
    }, [resPostImi, resDeleteImi, fetch])

    useEffect( () => {
        if(hukumuData !== null){
            setParams({ 
                jaBId : selectedBun, 
                startOffset : hukumuData.startOffset,
                endOffset : hukumuData.endOffset
            });
            setValue('');
            setImiData(null)
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
                            <Button onClick={postImi}>{t('BUTTON.DONE')}</Button>
                        </Col>
                    </Row>
                    <Row gutter={[8, 8]}>
                        <Col offset={8} flex="auto" style={ColStyle}>
                        {
                            imiData !== null &&
                            <ImiDromDown hukumuData={hukumuData} selectedBun={selectedBun} dropDownImi={imiData.iIds} iId={imiData.iId} fetch={fetch}/>
                        }
                        </Col>
                        {
                            imiData !== null && imiData.iId !== null && 
                            <Col push="100px" style={ColStyleStart}>
                                <Button onClick={() => deleteImi(imiData.iId)}>{t('BUTTON.DELETE')}</Button>
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

const ImiDromDown = ({ hukumuData, selectedBun, dropDownImi, iId, fetch } : ImiDromDownProps ) => {

    const { response : resSetImiHukumu, setParams : setParamsIH } = useAxiosPut<null, REQ_PUT_IMI>('/db/imi', true, null);
    
    const setIIdHukumu = ( value : string ) => {
        if( !hukumuData ){ return } 

        setParamsIH({
            jaBId : selectedBun,
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
            iId : value
        })
    }

    useEffect( () => {
        if( resSetImiHukumu !== null ){
            fetch();
        }
    }, [resSetImiHukumu, fetch])

    return(
        <>
        {
            dropDownImi !== null &&
            <Select
                defaultValue={iId}
                style={{ width: '100%' }}
                onChange={setIIdHukumu}
                options={
                    dropDownImi?.map( ( v : imiData ) => {
                        return { value : v.iId, label : v.koText }
                    })
                }
            />
        }
        </>
    )
}

export { ImiComp };
