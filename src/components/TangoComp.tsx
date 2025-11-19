import React, { useEffect, useState, useContext, CSSProperties, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

//Context
import { UnicodeContext } from 'contexts/UnicodeContext'

//Component
import { ComplexText } from 'components/Bun'
import { ModalUpdateHukumu, ModalDeleteHukumu } from 'components/TangoModalComp'

//Hook
import { useAxiosGet, useAxiosPost } from 'hooks/AxiosHook';
import { useJaText } from 'hooks/JaTextHook';
import { useMultiInput, useMultiKirikae } from 'hooks/KirikaeHook'
import { useHuri } from 'hooks/HuriHook'

//Css@antD
import { Button, Input, Space, Modal, Tabs, Flex, Col, Row } from 'antd';
import type { TabsProps } from 'antd';

//Redux
import { useSelector } from 'react-redux';
import { store, RootState } from 'reducers/store';
import { selectionActions } from 'reducers/selectionReducer';
const { setStyled } = selectionActions;

//Props
interface TangoCompProps {
    refetchHandles : RefetchHandles;
    refetchTangoList : () => void;
}

interface DynamicInputCompProps {
    handleMultiChange : (e : React.ChangeEvent, index : number) => void;
    multiInputData : Array<MultiInput>;
    multiValue : Array<string>;
    concatMultiInput : () => string;
    handleRefetch : (opt? : string[]) => void; 
}

interface AutoMultiInputProps {
    multiInputData : Array<MultiInput>;
    multiValue : Array<string>;
    handleMultiChange : (e : React.ChangeEvent, index : number) => void;
    handleHighlight? : () => void;
}

interface AutoLengthInputProps {
    children : React.ReactElement<HTMLInputElement>;
}

interface ModalTangoDBProps {
    multiInputData : Array<MultiInput>;
    multiValue : Array<string>;
    value : string;
    handleRefetch : (opt? : string[]) => void;
}

interface AccordianTangoDBProps {
    searchedList : TangoDBSearchedList | null;
    handleSubmit : (tId : string | null) => void;
}

interface TangoDBProps {
    data : RES_SEARCH_TANGO;
    handleSubmit : (tId : string | null) => void;
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
    const { selection, selectedBun, hukumuData } = useSelector( (_state : RootState) => _state.selection);

    //Hook
    const { refetch, refetchAll } = refetchHandles;

    const { multiValue, multiInputData, handleChange : handleMultiChange } = useMultiInput(selection);

    const { kirikaeValue, concatMultiInput, handleChange : handleMultiKirikae } = useMultiKirikae(selection, multiValue, handleMultiChange);

    const { multiValue : editMultiValue, multiInputData : editMultiInputData, handleChange : handleEditChange } = useMultiInput(selection, hukumuData?.yomi, edit);

    const { kirikaeValue : editKirikaeValue, concatMultiInput : concatEditMultiInput, handleChange : handleEditMultiKirikae } = useMultiKirikae(selection, editMultiValue, handleEditChange);

    //Handle
    const handleRefetch = useCallback( (...props : any[]) => {
        if( props[0] !== null && props[0] === 'all'){
            refetchAll();
        }
        else{
            refetch(selectedBun);
        }
        refetchTangoList();
        store.dispatch( setStyled(null) );
        setEdit(false);
    }, [refetchAll, refetch, selectedBun, refetchTangoList])

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
                        edit === false ?
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
                                <ModalUpdateHukumu handleRefetch={handleRefetch} multiInputData={multiInputData} multiValue={editKirikaeValue} newYomi={concatEditMultiInput()}/>
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
                    multiInputData={multiInputData} multiValue={kirikaeValue} concatMultiInput={concatMultiInput}
                    handleRefetch={handleRefetch}
                />
            </div>
        }
        </>

    )
}

const DynamicInputComp = ({ handleMultiChange, multiInputData, multiValue, concatMultiInput, handleRefetch } : DynamicInputCompProps) => {

    //i18n
    const { t } = useTranslation('DynamicInputComp');
    
    //Redux
    const { selection, selectedBun, textOffset } = useSelector( (_state : RootState) => _state.selection);

    const { checkKatachi } = useJaText();

    const handleHighlight = () => {
        store.dispatch( setStyled({ bId : selectedBun, startOffset : textOffset.startOffset, endOffset : textOffset.endOffset, opt : 'highlight' }) );
    }

    const isAvailabeKatachi = checkKatachi(selection) === 'kanji' || checkKatachi(selection) === 'okuri';

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
                        selection !== '' && selection && isAvailabeKatachi &&
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

const AutoMultiInput = ({ multiInputData, multiValue, handleMultiChange, ...props } : AutoMultiInputProps ) => {

    return (
        <>
            {
                multiInputData.map( (v, index, arr) => {
                    if(v['inputBool'] === true){
                        return(
                            <AutoLengthInput key={'id'+index}>
                                <Input className="input dynamic" key={'id'+index} value={multiValue[index]} onChange={(e) => handleMultiChange(e, index)} onFocus={props?.handleHighlight} autoComplete='off'/>
                            </AutoLengthInput>
                        )
                    }
                    else{
                        return (
                            <span className="inputNasi" key={'id'+index} style={{ margin : index === 0 ? '0 4px 0 0' : '0 4px'}}>
                                {
                                    arr.length !== 1 ?
                                        v['data']
                                        :
                                        ''
                                }
                            </span>
                        )
                    }
                })
            }
        </>
    )
}

const AutoLengthInput = ({ children } : AutoLengthInputProps) => {
    const length = children?.props?.value !== undefined ? children?.props.value.length : 0;
    const inputWithProps = React.cloneElement( children, {
        className : `input dynamic-${length}`
    })

    return(
        <>
            {inputWithProps}
        </>
    )
}

const ModalTangoDB = ({ multiInputData, multiValue, value, handleRefetch } : ModalTangoDBProps) => {

    const { t } = useTranslation('ModalTangoDB');

    //Context
    const hiraganaRegex = useContext<UnicodeContext>(UnicodeContext).hiragana;

    //Redux
    const { selection, selectedBun, textOffset } = useSelector( (_state : RootState) => _state.selection);

    //State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState<SearchText | null>(null);

    const [searchedList, setSearchedList] = useState<TangoDBSearchedList | null>(null);

    //Hook
    const { isOnajiOkuri, getHyoukiQuery, getYomiQuery } = useJaText();
    const { getOkuri } = useHuri();

    const { response, setParams } = useAxiosGet<RES_GET_TANGO_CHECK, REQ_GET_TANGO_CHECK>('/db/tango/check', true, null);

    const { response : resNewTango, setParams : setParamsNewTango } = useAxiosPost<null, REQ_POST_HUKUMU>('/db/hukumu', true, null);

    //Handle
    const postNewTango = (hyouki : string, yomi : string, tId : string | null) => {
        let _hyouki = getHyoukiQuery(multiInputData);
        let _yomi = getYomiQuery(multiInputData, multiValue);

        if(tId === null){
            setParamsNewTango({
                jaBId : selectedBun, 
                startOffset : textOffset.startOffset, endOffset : textOffset.endOffset,
                hyoukiStr : hyouki, yomiStr : yomi,
                hyouki : _hyouki, yomi : _yomi
            })
        }
        else{
            setParamsNewTango({
                jaBId : selectedBun, 
                startOffset : textOffset.startOffset, endOffset : textOffset.endOffset,
                hyoukiStr : hyouki, yomiStr : yomi,
                hyouki : _hyouki, yomi : _yomi, tId : tId
            });
        }
    }

    const showModal = () => {
        setSearchText({hyouki : selection, yomi : value});
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    };


    const handleSubmit = (tId : string | null) => {
        postNewTango(selection, value, tId);
        setIsModalOpen(false);
    }

    const getSearchedList = useCallback( ( data : Array<RES_SEARCH_TANGO> ) => {
        if(data !== null && searchText !== null){
            let kanzenSame : RES_SEARCH_TANGO[] = []; //표기 읽기 완전 일치
            let orSame : RES_SEARCH_TANGO[] = []; //표기 or 읽기 완전 일치
            let prefix : RES_SEARCH_TANGO[] = []; //전방일치 (표기)
            let suffix : RES_SEARCH_TANGO[] = []; //후방일치 (표기)
            let okuriHyouki : RES_SEARCH_TANGO[] = []; //오쿠리가나 표기 방식 다름
            let theOther : RES_SEARCH_TANGO[] = []; //그 외

            let okuri = getOkuri( searchText.hyouki );
            let text = okuri.hyouki; //검색어

            for(let key in data){
                let cpr = data[key];

                // %text, text% 결국 둘중 하나인 상태. INSTR이 1이아니면 그 이상, 또는 0(불일치)인데,
                // 만약 검색어에 오쿠리가나가 있어서 후방 일치라 해도 tango와는 %text%형식으로 일치된 상태일 수도 있음.
                // tango는 본래 단어, 검색어text는 따로 알아내야 하는 상태.
                if( okuri.matched === false ){
                    //검색 텍스트가 okuri가 없을 때,
                    if( selection === cpr.hyouki ){
                        //표기 완전 일치
                        if( value === cpr.yomi ){
                        //읽기 완전 일치
                            kanzenSame.push(cpr);
                        }
                        else{
                            orSame.push(cpr);
                        }
                    }
                    else{
                        if( cpr.hyOffset > 1){
                            prefix.push(cpr);
                        }
                        else if(cpr.hyOffset === 1){
                            suffix.push(cpr);
                        }
                        else{
                            //표기 불일치, 읽기는 일부 일치
                            if( value === cpr.yomi ){
                                if( isOnajiOkuri( selection, value, cpr.hyouki ) ){
                                    okuriHyouki.push(cpr);
                                }
                                else{
                                    orSame.push(cpr);
                                }
                            }
                            else{
                                theOther.push(cpr);
                            }
                        }
                    }
                }
                else{
                    //검색 텍스트가 okuri가 있을 떄,
                    if( selection === cpr.hyouki ){
                        //표기 완전 일치
                        if( value === cpr.yomi ){
                        //읽기 완전 일치
                            kanzenSame.push(cpr);
                        }
                        else{
                            orSame.push(cpr);
                        }
                    }
                    else{
                        // text === cpr['DATA'] 비교할 필요가 있는가.
                        if( cpr.hyOffset> 1){
                            //%text%의 결과 일 수도.
                            if( cpr.hyouki.substring(cpr.hyOffset + text.length) !== '' ){
                                //뒤에 %에 문자가 있을 떄
                                if( cpr.hyouki.substring(cpr.hyOffset + text.length).match( hiraganaRegex ) === null ){
                                    //%에 한자가 들어간 경우
                                    theOther.push(cpr);
                                }
                                else{
                                    //히라가나인 경우 일단 prefix
                                    if( isOnajiOkuri( selection, value, cpr.hyouki ) ){
                                        okuriHyouki.push(cpr);
                                    }
                                    else{
                                        prefix.push(cpr);
                                    }
                                }
                            }
                            else{
                                if( cpr.hyouki.substring(0, cpr.hyOffset).match( hiraganaRegex ) === null ){
                                    //%에 한자가 들어간 경우
                                    theOther.push(cpr);
                                }
                                else{
                                    prefix.push(cpr);
                                }
                            }
                        }
                        else if(cpr.hyOffset === 1){
                            //text%의 결과.
                            if( cpr.hyouki.substring(text.length).match( hiraganaRegex ) === null ){
                                //%에 한자가 들어간 경우
                                theOther.push(cpr);
                            }
                            else{
                                suffix.push(cpr);
                            }
                        }
                        else{
                            //표기 불일치, 읽기는 일부 일치
                            if( value === cpr.yomi ){
                                if( isOnajiOkuri( selection, value, cpr.hyouki ) ){
                                    okuriHyouki.push(cpr);
                                }
                                else{
                                    orSame.push(cpr);
                                }
                            }
                            else{
                                theOther.push(cpr);
                            }
                        }
                    }
                }

            }

            return {
                kanzen : kanzenSame,
                orSame : orSame,
                prefix : prefix,
                suffix : suffix,
                okuri : okuriHyouki,
                theOther : theOther
            }
        }
        else{
            return null;
        }
    }, [getOkuri, hiraganaRegex, isOnajiOkuri, searchText, selection, value])

    useEffect( () => {
        if(searchText !== null){
            let okuri = getOkuri( searchText.hyouki );
            if( okuri.matched ){
                //오쿠리가나가 있을 때.
                setParams({
                    hyouki : okuri.hyouki,
                    yomi : searchText.yomi
                });
                setSearchedList(null);
            }
            else{
                //오쿠리가나 없을 때.
                setParams({
                    hyouki : searchText.hyouki,
                    yomi : searchText.yomi
                });
                setSearchedList(null);
            }
        }
    }, [searchText, getOkuri, setParams]);

    useEffect( () => {
        let res = response;
        if(res !== null){
            let _searchedList = getSearchedList(res.data);

            setSearchedList(_searchedList);
        }
    }, [response, getSearchedList])

    useEffect( () => {
        let res = resNewTango;
        if(res !== null){
            handleRefetch();
        }
    }, [resNewTango, handleRefetch])

    return (
        <>
            <Button onClick={showModal}>{t('BUTTON.TITLE')}</Button>

            <Modal title={t('TITLE')}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                width={'80%'}
                footer={[
                    <Button onClick={() => handleSubmit(null)}>{t('BUTTON.SAVE_NEW')}</Button>,
                    <Button onClick={handleCancel}>{t('BUTTON.CANCLE')}</Button>
                ]}
            >
                <ComplexText bId={null} data={selection} ruby={value} offset={0}/>
                <AccordianTangoDB searchedList={searchedList} handleSubmit={handleSubmit}/>
            </Modal>
        </>
    );
}

const AccordianTangoDB = ({ searchedList, handleSubmit } : AccordianTangoDBProps ) => {

    const { t } = useTranslation('AccordianTangoDB');

    const getSearchedArr = (obj : TangoDBSearchedList | null) => {
        if(obj !== null){
            let retArr = [];

            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.0'), list : obj.kanzen, count : obj.kanzen.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.1'), list : obj.orSame, count : obj.orSame.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.2'), list : obj.prefix, count : obj.prefix.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.3'), list : obj.suffix, count : obj.suffix.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.4'), list : obj.okuri, count : obj.okuri.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.5'), list : obj.theOther, count : obj.theOther.length
            });

            return retArr.filter( (arr) => arr.count > 0);
        }
        else{
            return [];
        }
    }
    
    const items: TabsProps['items'] = getSearchedArr(searchedList).map( (v, i) => { return {
        key : i.toString(),
        label : v.name,
        children : <>
            <div>{t('CONTENTS.MESSAGE', {count : v.count})}</div>
            {v.list.map( (arr : RES_SEARCH_TANGO) =>
                <TangoDB data={arr} handleSubmit={handleSubmit}/>
            )}
        </>
    } })

    return(
        <Tabs defaultActiveKey="1" items={items}/>
    )
}

const TangoDB = ({ data, handleSubmit } : TangoDBProps ) => {

    const { t } = useTranslation('TangoDB');

    const [tangoData, setTangoData] = useState<TangoData | null>(null);

    const { response } = useAxiosGet<RES_GET_TANGO, REQ_GET_TANGO>('/db/tango', false, { tId : data.tId });

    useEffect( () => {
        let res = response;
        if(res !== null){
            setTangoData(res.data);
        }
    }, [response])

    return(
        <>
            <div>
            {
                tangoData !== null &&
                <>
                {
                    tangoData.list !== null &&
                    tangoData.list.map( (arr) =>
                        <>
                            <ComplexText bId={null} data={arr.hyouki} ruby={arr.yomi} offset={0}/>
                        </> 
                    )
                }
                {
                    tangoData.imi !== null &&
                    tangoData.imi.map( (arr) => 
                        <>
                            <span>{arr}</span>
                        </> 
                    )
                }
                {
                    tangoData.imi === null &&
                    <span>{t('CONTENTS.EMPTY')}</span>
                }
                </>
            }
            </div>
            <div>
                <Button onClick={() => { handleSubmit(data.tId) }}>{t('BUTTON.DONE')}</Button>
            </div>
        </>
    )
}

export { TangoComp };
