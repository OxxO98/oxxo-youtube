import { useEffect, useState, CSSProperties, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

//widgets
import { AutoMultiInput } from 'widgets/input-multi-auto/index';
import { DynamicInputComp } from 'widgets/input-dynamic/index';

//features
import { ModalDeleteHukumu } from 'features/hukumu-delete/index'
import { ModalUpdateHukumu } from 'features/hukumu-update/index'

//Hook
import { useMultiInput, useMultiKirikae } from 'shared/hooks/useKirikae'

//Css@antD
import { Button, Flex, Col, Row } from 'antd';

//Redux
import { useAppSelector, useAppDispatch, selectionActions } from 'shared/store';
import { useGetYomi } from '../api/getYomi';
const { setStyled } = selectionActions;

//Props
interface TangoCompProps {
    refetchHandles : RefetchHandles;
    refetchTangoList : () => void;
}

const TangoCompStyle = {
    height : '100%', 
    width : '100%', 
    padding : '8px 8px'
}

const ColStyle : CSSProperties = {
    height : '32px',
    alignContent : 'center',
}

const ColStyleStart : CSSProperties = {
    ...ColStyle,
    justifyContent : 'start',
    textAlign : 'start',
}

const ButtonContainerStyle : CSSProperties = {
    width : '100%',
    margin : '0 16px'
}

const TangoComp = ({ refetchHandles, refetchTangoList } : TangoCompProps ) => {
    
    //i18n
    const { t } = useTranslation('TangoComp');

    //State
    const [edit, setEdit] = useState(false);

    //Redux
    const { selection, selectedBun, hukumuData, hukumuCheckLoading } = useAppSelector( (_state) => _state.selection);

    const dispatch = useAppDispatch();

    //Hook
    const { refetch } = refetchHandles;

    const { multiValue, multiInputData, handleChange : handleMultiChange } = useMultiInput(selection);

    const { kirikaeValue, concatMultiInput, handleChange : handleMultiKirikae } = useMultiKirikae(selection, multiValue, handleMultiChange);

    const { multiValue : editMultiValue, multiInputData : editMultiInputData, handleChange : handleEditChange } = useMultiInput(hukumuData?.hyouki ?? null, hukumuData?.yomi, edit);

    const { kirikaeValue : editKirikaeValue, concatMultiInput : concatEditMultiInput, handleChange : handleEditMultiKirikae } = useMultiKirikae(hukumuData?.hyouki ?? null, editMultiValue, handleEditChange);

    const { kirikaeValueAuto } = useGetYomi(selection, hukumuData?.yomi, hukumuCheckLoading, kirikaeValue); //임시 방편
    
    //Handle
    const handleRefetch = useCallback( () => {
        refetch(selectedBun);
        refetchTangoList();
        dispatch( setStyled(null) );
        setEdit(false);
    }, [refetch, selectedBun, refetchTangoList])

    useEffect( () => {
        setEdit(false);
    }, [hukumuData])
    
    return(
        <>
        {
            hukumuData !== null
            ?
            <div style={TangoCompStyle}>
                <Row gutter={[8, 8]}>
                    {
                        edit === false || hukumuCheckLoading === true ?
                        <>
                            <Col span={8} style={ColStyle}>
                                {t('CONTENTS.YOMI')}
                            </Col>
                            <Col span={16} style={ColStyleStart}>
                                {hukumuData.yomi}
                            </Col>
                        </>
                        :
                        <>
                            <Col span={8} style={ColStyle}>
                                {t('CONTENTS.YOMI')}
                            </Col>
                            <Col span={16} style={ColStyleStart}>
                                <AutoMultiInput multiInputData={editMultiInputData} multiValue={editKirikaeValue} handleMultiChange={handleEditMultiKirikae}/>
                            </Col>
                        </>
                    }
                    <Col span={8} style={ColStyle}>
                        {t('CONTENTS.TANGO')}
                    </Col>
                    <Col span={16} style={ColStyleStart}>
                        {hukumuData.hyouki}
                    </Col>
                    {
                        edit ?
                        <Flex justify='right' style={ButtonContainerStyle} gap={8}>
                            <ModalDeleteHukumu handleRefetch={handleRefetch}/>
                            {
                                concatEditMultiInput() !== hukumuData.yomi &&
                                <ModalUpdateHukumu handleRefetch={handleRefetch} multiInputData={editMultiInputData} multiValue={editKirikaeValue} newYomi={concatEditMultiInput()}/>
                            }
                            <Button type="primary" onClick={() => setEdit(false)}>{t('BUTTON.CANCLE')}</Button>
                        </Flex>
                        :
                        <Flex justify='right' style={ButtonContainerStyle} gap={8}>
                            <Button onClick={() => setEdit(true)}>{t('BUTTON.MODIFY')}</Button>
                        </Flex>
                    }
                </Row>
            </div>
            :
            <div style={TangoCompStyle}>
                <DynamicInputComp
                    handleMultiChange={handleMultiKirikae}
                    multiInputData={multiInputData} multiValue={kirikaeValueAuto} concatMultiInput={concatMultiInput}
                    handleRefetch={handleRefetch}
                />
            </div>
        }
        </>

    )
}

export { TangoComp };
