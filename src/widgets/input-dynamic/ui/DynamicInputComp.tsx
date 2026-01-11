import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

//widgets
import { AutoMultiInput } from 'widgets/input-multi-auto/index';
import { ModalTangoDB } from 'widgets/tango-db-modal/index';

//Redux
import { useAppSelector, useAppDispatch, selectionActions } from 'shared/store';

//lib
import { useAvailable } from '../lib/useAvailable';

//Css@antD
import { Space, Flex, Col, Row } from 'antd';

const { setStyled } = selectionActions;

interface DynamicInputCompProps {
    handleMultiChange : (e : React.ChangeEvent, index : number) => void;
    multiInputData : MultiInput[];
    multiValue : string[];
    concatMultiInput : () => string;
    handleRefetch : () => void; 
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

export const DynamicInputComp = ({ handleMultiChange, multiInputData, multiValue, concatMultiInput, handleRefetch } : DynamicInputCompProps) => {

    //i18n
    const { t } = useTranslation('DynamicInputComp');
    
    //Redux
    const { selection, selectedBun, textOffset } = useAppSelector( (_state) => _state.selection);
    
    const dispatch = useAppDispatch();

    const { isAvailableKatachi } = useAvailable(selection);

    const handleHighlight = () => {
        dispatch( setStyled({ bId : selectedBun, startOffset : textOffset.startOffset, endOffset : textOffset.endOffset, opt : 'highlight' }) );
    }

    return (
        <>
            <Row gutter={[8, 8]}>
                <Col span={8} style={ColStyle}>
                    {t('CONTENTS.YOMI')}
                </Col>
                <Col span={16} style={ColStyleStart}>
                    <Space.Compact size="small">
                        <AutoMultiInput multiInputData={multiInputData} multiValue={multiValue} handleMultiChange={handleMultiChange} handleHighlight={handleHighlight}/>
                    </Space.Compact>
                </Col>
                <Col span={8} style={ColStyle}>
                    {t('CONTENTS.TANGO')}
                </Col>
                <Col span={16} style={ColStyleStart}>
                    {
                        selection.length < 10 &&
                        <>{selection}</>
                    }
                </Col>
                <Flex justify='right' style={ButtonContainerStyle}>
                    {
                        selection !== '' && selection && isAvailableKatachi &&
                        <>
                            <ModalTangoDB 
                                multiInputData={multiInputData} multiValue={multiValue} value={concatMultiInput()} handleRefetch={handleRefetch}
                            />
                        </>
                    }
                </Flex>
            </Row>
        </>
    )
}