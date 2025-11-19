import React, { useEffect, useState, useContext, CSSProperties } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

//Context
import { VideoContext } from 'contexts/VideoContext';

//Component
import { ComplexText, KanjiText } from 'components/Bun';
import { PdfModalComp } from 'components/PdfModalComp';

//Hook
import { useAxiosGet } from 'hooks/AxiosHook';

import { useKirikae } from 'hooks/KirikaeHook';

//CSS@antd
import { Pagination, Row, Col, Button, Card, Tabs, Input, Flex, Typography, Empty  } from 'antd'
import type { GetProps, PaginationProps } from 'antd';

const { Text } = Typography;

type SearchProps = GetProps<typeof Input.Search>;

interface TangochouTableCompProps {
    list :  RES_TANGOCHOU_LIST;
    pageSize : number;
}

interface TangochouRepresentiveProps {
    tId : tId;
    hyouki : string;
    yomi : string;
}

interface TangoBunListProps {
    tId : tId; 
    hyId : hyId;
    hyouki : string; 
    yomi : string;
}

interface TangoBunProps {
    ytBId : ytBId;
}

const tableCompStyle : CSSProperties = {
    margin : '20px'
}

const infoCompStyle : CSSProperties = {
    textAlign : 'left',
    margin : '20px'
}

const TangochouComp = () => {

    //Context
    const { videoId } = useContext(VideoContext);
    
    //State
    const [totalPage, setTotalPage] = useState<number | null>(null);
    const [list, setList] = useState<RES_TANGOCHOU_LIST>([]);
    const [pageSize, setPageSize] = useState(24);

    //Hook
    const navigate = useNavigate();

    const { response } = useAxiosGet<RES_GET_TANGOCHOU, REQ_GET_TANGOCHOU>('/db/tangochou', false, { videoId : videoId } ); //해당 video의 단어 불러오기

    //Handle
    const onChange = (page : number, pagesize : number) => {
        navigate(`/video/${videoId}/tangochou/${page}`)
    }
    
    const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
        setPageSize(pageSize);
    };

    useEffect( () => {
        let res = response
        if(res !== null){
            setList(res.data);
            setTotalPage(res.data.length);
        }
    }, [response]);

    return(
        <>
            <Flex justify='space-between'>
                <PdfModalComp/>
                <SearchTangoComp/>
            </Flex>
            <Routes>
                <Route path='/:page' element={
                    <>
                    {
                        totalPage === null ?
                        <>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </>
                        :
                        <>
                            <Pagination align='center' showSizeChanger defaultCurrent={1} pageSize={pageSize} pageSizeOptions={[6, 12, 24]} total={totalPage} onChange={onChange} onShowSizeChange={onShowSizeChange}/>
                            <TangochouTableComp list={list} pageSize={pageSize}/>
                        </>
                    }
                    </>
                }/>
                <Route path='/search/:page' element={
                    <SearchTangoListComp/>
                }/>
                <Route path='/tango/:tId' element={
                    <TangoInfo/>
                }/>
                <Route path='/kanji/:kId' element={
                    <KanjiInfo/>
                }/>
            </Routes>
        </>
    )
}

const TangochouTableComp = ({ list, pageSize } : TangochouTableCompProps ) => {
    const { page } = useParams();

    const span : ObjKey = {
        6 : {
            xxl : 12,
            xl : 12,
            lg : 24,
            md : 24,
            sm : 24,
            xs : 24
        },
        12 : {
            xxl : 8,
            xl : 8,
            lg : 12,
            md : 12,
            sm : 24,
            xs : 24
        },
        24 : {
            xxl : 4,
            xl : 6,
            lg : 8,
            md : 12,
            sm : 24,
            xs : 24
        }
    }

    return(
        <>
            <Row gutter={[16, 16]} style={tableCompStyle}>
            {
                page !== undefined && 
                list.filter( (v, i) => ( (Number(page)-1) * pageSize <= i && i < Number(page) * pageSize ))
                .map( (v) =>                 
                    <Col span={6} xxl={span[pageSize].xxl} xl={span[pageSize].xl} lg={8} md={12} sm={24} xs={24} key={v.tId}>
                        <TangochouRepresentive tId={v.tId} hyouki={v.hyouki} yomi={v.yomi}/>
                    </Col>
                )
            }
            </Row>
        </>
    )

}

const TangochouRepresentive = ({ tId, hyouki, yomi } : TangochouRepresentiveProps ) => {

    const { t } = useTranslation('TangochouRepresentive');

    //Context
    const { videoId } = useContext(VideoContext);

    //Hook
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/video/${videoId}/tangochou/tango/${tId}`);
    }

    return(
        <>
            <Card actions={[
                <Button onClick={handleClick}>{t('BUTTON.MOVE')}</Button>
            ]}>
                <div key={tId}>
                    <Text ellipsis={ { tooltip: hyouki } }>
                        <ComplexText bId={null} data={hyouki} ruby={yomi} offset={0} key={tId}/>
                    </Text>
                </div>
            </Card>
        </>
    );
}

const TangoInfo = () => {
    
    const { t } = useTranslation('TangoInfo');

    //Context
    const { videoId } = useContext(VideoContext);

    const { tId } = useParams();

    //Hook
    const navigate = useNavigate();

    //State
    const [tangoBunList, setTangoBunList] = useState<Array<TangoBunListData>>([]);
    const [kanjiList, setKanjiList] = useState<Array<KanjiData>>();

    const [defaultData, setDefaultData] = useState<TangoBunListData | null>(null);

    const { response, setParams } = useAxiosGet<RES_GET_TANGOCHOU_TANGO_INFO, REQ_GET_TANGOCHOU_TANGO_INFO>('/db/tangochou/tango/info', false, { videoId : videoId, tId : tId! });

    //Handle
    const handlePrev = () => {
        navigate(-1);
    }

    const handleClose = () => {
        navigate(`/video/${videoId}/tangochou/1`);
    }

    const handleClickKanji = (kanji : string) => {
        if(kanjiList !== undefined){
            let kId = kanjiList.filter( (v) => v.jaText === kanji)[0]?.kId;
            if(kId === undefined){ return }

            navigate(`/video/${videoId}/tangochou/kanji/${kId}`);
        }
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            let tangoList = res.data.tangoList;
            let kanjiList = res.data.kanjiList;
            
            setDefaultData(tangoList[0]);
            setTangoBunList(tangoList);
            setKanjiList(kanjiList);
        }
    }, [response]);

    useEffect( () => {
        if(tId !== undefined){
            setParams({ videoId : videoId, tId : tId});
        }
    }, [tId, setParams, videoId]);

    return(
        <>
            {
                tId !== undefined && defaultData !== null &&
                <>
                    <div style={infoCompStyle}>
                        <Flex justify='right' gap={8}>
                            <Button onClick={handlePrev}>{t('BUTTON.BACK')}</Button>
                            <Button onClick={handleClose}>{t('BUTTON.CLOSE')}</Button>
                        </Flex>
                            <KanjiText hyouki={defaultData.hyouki} yomi={defaultData.yomi} onClick={handleClickKanji}/>
                            <div>
                            <Tabs defaultActiveKey="1" items={
                                tangoBunList.map( (v, i) => {
                                    return {
                                        key : i.toString(),
                                        label : `${v.hyouki} (${v.yomi})`,
                                        children : <TangoBunList tId={tId} hyId={v.hyId} hyouki={v.hyouki} yomi={v.yomi}/>
                                    }
                                })
                            }/>
                        </div>
                    </div>
                </>
            }
        </>
    );
}

const TangoBunList = ({ tId, hyId, hyouki, yomi } : TangoBunListProps )=> {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [list, setList] = useState<Array<TangoBunData>>();

    //Hook
    const {response, setParams} = useAxiosGet<RES_GET_TANGOCHOU_TANGO_LIST, REQ_GET_TANGOCHOU_TANGO_LIST>('/db/tangochou/tango/list', false, { videoId : videoId, hyId : hyId } );

    useEffect( () => {
        let res = response;
        if(res !== null){
            setList(res.data);
        }
    }, [response]);

    useEffect( () => {
        if(hyId !== null){
            setParams({ videoId : videoId, hyId : hyId })
        }
    }, [hyId, setParams, videoId])

    return(
        <>
            {
                list !== undefined &&
                list.map( (v, i) => 
                    <div key={`B${v.jaBId}_T${v.tId}_${i}`}>
                        <p>
                            {v.jaText.substring(0, v.startOffset)}
                        <span className="bold highlight">
                            {v.jaText.substring(v.startOffset, v.endOffset)}
                        </span>
                            {v.jaText.substring(v.endOffset)}
                        </p>
                        <TangoBun ytBId={v.ytBId}/>
                    </div>
                )
            }
        </>
    )
}

const TangoBun = ({ ytBId } : TangoBunProps) => {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [ytBun, setYtBun] = useState<YTBun | null>(null);

    //Hook
    const { response : res } = useAxiosGet<RES_GET_TRANSLATE_REP, REQ_GET_TRANSLATE_REP>('/db/translate/representive', false, { videoId : videoId, ytBId : ytBId } );

    useEffect( () => {
        if(res !== null){
            setYtBun(res.data);
        }
    }, [res])

    return(
        <p>
        {
            ytBun?.koText !== null &&
            <>{ytBun?.koText}</>
        }
        </p>
    )
}

const KanjiInfo = () => {

    const { t } = useTranslation('KanjiInfo');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [kanji, setKanji] = useState<KanjiData | null>(null);
    const [list, setList] = useState<Array<KanjiTangoData> | null>(null);

    const { kId } = useParams();

    //Hook
    const navigate = useNavigate();

    const { response } = useAxiosGet<RES_GET_TANGOCHOU_KANJI_INFO, REQ_GET_TANGOCHOU_KANJI_INFO>('/db/tangochou/kanji/info', false, { videoId : videoId, kId : kId! });

    //Handle
    const handlePrev = () => {
        navigate(-1);
    }

    const handleClose = () => {
        navigate(`/video/${videoId}/tangochou/1`);
    }

    const handleClick = ( i : number) => {
        if( list === null ){ return }

        let tId = list[i].tId;
        if( tId === undefined ){ return } 
        
        navigate(`/video/${videoId}/tangochou/tango/${tId}`);
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            setKanji(res.data.kanji)
            setList(res.data.tangoList);
        }
    }, [response])

    return(
        <>
            <div style={infoCompStyle}>
                <Flex justify='right' gap={8}>
                    <Button onClick={handlePrev}>{t('BUTTON.BACK')}</Button>
                    <Button onClick={handleClose}>{t('BUTTON.CLOSE')}</Button>
                </Flex>
                <div className="largeTango">
                    {kanji?.jaText}
                </div>
                <Row gutter={[16, 16]} style={{ marginTop : '20px'}}>
                {
                    list !== null &&
                    list.map( (v, i) => 
                        <Col span={6} xxl={4} xl={6} lg={8} md={12} sm={24} xs={24} key={v.tId}>
                            <Card actions={[
                                <Button onClick={() => handleClick(i)}>{t('BUTTON.MOVE')}</Button>
                            ]}>
                                <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>
                            </Card>
                        </Col>
                    )
                }
                </Row>
            </div>
        </>
    )
}

const SearchTangoComp = () => {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [value, setValue] = useState<string>('');

    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setValue( e.target.value ); //이건 debounce하면 입력이 불가능해짐.
    }

    //Hook
    const navigate = useNavigate();

    const { kirikaeValue, handleChange : handleKrikae, kirikae } = useKirikae(value, handleChange);

    //Handle
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
        if( kirikae === null ){ return }

        if( kirikae === '' ){
            navigate(`/video/${videoId}/tangochou/1`)
        }
        else{
            navigate(`/video/${videoId}/tangochou/search/1?keyword=${kirikae}`)
        }
    }

    const deleteSearch = () => {
        setValue('');
        navigate(`/video/${videoId}/tangochou/1`)
    }

    return (
        
        <Flex align='center' style={{ width : '100%'}}>
            <Input.Search allowClear name="search" value={kirikaeValue ?? ''} onChange={handleKrikae} autoComplete='off' onKeyDown={handleKeyDown} onSearch={onSearch}/>
        </Flex>
    )
}

const SearchTangoListComp = () => {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [list, setList] = useState<RES_TANGOCHOU_LIST>([]);
    const [totalPage, setTotalPage] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState(24);


    //Hook
    const navigate = useNavigate();
    const location = useLocation();
    
    const { response , setParams } = useAxiosGet<RES_GET_TANGOCHOU_SEARCH, REQ_GET_TANGOCHOU_SEARCH>('/db/tangochou/search', true, null);

    //Handle
    const onChange = (page : number, pagesize : number) => {
        let search = location.search;
        let params = new URLSearchParams(search);
        let keyword = params.get('keyword');

        navigate(`/video/${videoId}/tangochou/search/${page}?keyword=${keyword}`)
    }
    
    const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
        setPageSize(pageSize);
    };

    useEffect( () => {
        let res = response;
        if(res !== null){
            setList(res.data);
            setTotalPage(res.data.length);
        }
    }, [response])

    useEffect( () => {
        let search = location.search;
        let params = new URLSearchParams(search);
        let keyword = params.get('keyword');

        if(keyword === null){ return }

        setParams({ videoId : videoId, keyword : keyword });
    }, [location, setParams, videoId])


    return(
        <>
            {
                totalPage === null ?
                <>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </>
                :
                <>
                    <Pagination align='center' showSizeChanger defaultCurrent={1} pageSize={pageSize} pageSizeOptions={[6, 12, 24]} total={totalPage} onChange={onChange} onShowSizeChange={onShowSizeChange}/>
                    <TangochouTableComp list={list} pageSize={pageSize}/>
                </>
            }
        </>
    )
}

export { TangochouComp };
