
import { useEffect, useState } from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";

//Hook
import { useKirikae } from 'shared/hooks/useKirikae';
import { useJaText } from 'shared/lib/useJaText';
import { useAxiosGet } from 'shared/hooks/useAxios';

//widgets
import { LayoutComp } from 'widgets/layout/index';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//CSS@Antd
import { Pagination, Table, Empty, Input, Flex, Affix, Button, Space } from 'antd';
import type { TableColumnsType, PaginationProps, GetProps } from 'antd';

type SearchProps = GetProps<typeof Input.Search>;

interface DBTableProps {
    list : db_all;
    pageSize : number;
}

interface db_kanji_data {
    kId : string;
    jaText : string;
}

interface db_hukumu_data {
    title : string;
    src : string;

    ytBId : string;
    jaBId : string;
    jaText : string;
    koBId : string | null;
    koText? : string;
    startTime : number;
    endTime : number;

    startOffset : number;
    endOffset : number;

    hyId : string;
    iId : string | null;
    tId : string;

    hyouki : string;
    yomi : string;
    textData : TextData[];

    imi? : string;

    kanjis : db_kanji_data[];
}

interface db_tango_data {
    tId : string;
    hukumus : db_hukumu_data[][][];
}

type db_all = db_tango_data[];

interface AllDataType extends db_tango_data {
    key : React.Key;
}

interface DataType extends db_hukumu_data {
    key : React.Key;
}

interface VideoExpendedDataType extends db_hukumu_data {
    key : React.Key;
}

interface BunExpendedDataType extends db_hukumu_data {
    key : React.Key;
}

const DBPage = () => {
    const [data, setData] = useState<db_all>([]); 
    const [totalPage, setTotalPage] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState(24);

    const [container, setContainer] = useState<HTMLDivElement | null>(null);
  
    //Hook
    const navigate = useNavigate();

    const { response, fetch, error } = useAxiosGet('/db/all', false, null );

    //Handle
    const onChange = (page : number, pagesize : number) => {
        navigate(`/db/${page}`)
    }
    
    const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
        setPageSize(pageSize);
    };

    useEffect( () => {
        let res = response;
        if( res !== null ){
            console.log(res.data);
            setData(res.data);
            setTotalPage(res.data.length)
        }
    }, [response])
    
    return(
        <>
            <LayoutComp>
                <Flex justify='space-between'>
                    <DBSearch/>
                </Flex>
                <Routes>
                    <Route path='/:page' element={
                        <div ref={setContainer}>
                        {
                            totalPage === null ?
                            <>
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </>
                            :
                            <>
                                <Affix offsetTop={0}>
                                    <Flex justify='center' style={{ backgroundColor : '#000000'}}>
                                        <Pagination align='center' showSizeChanger defaultCurrent={1} pageSize={pageSize} pageSizeOptions={[6, 12, 24]} total={totalPage} onChange={onChange} onShowSizeChange={onShowSizeChange}/>
                                    </Flex>
                                </Affix>
                                <DBTable list={data} pageSize={pageSize}/>
                            </>
                        }
                        </div>
                    }/>
                    <Route path='/search/:page' element={
                        <DBSearchList/>
                    }/>
                </Routes>
            </LayoutComp>
        </>
    )
}

const DBTable = ({ list, pageSize } : DBTableProps) => {
    const { page } = useParams();

    const navigate = useNavigate();

    const { HiraToKoNFC } = useJaText()

    const allColumns : TableColumnsType<AllDataType> = [
        { 
            title : '표기', key : 'hyouki', 
            render : (v) => <ComplexText bId={null} data={v.hukumus[0][0][0].hyouki} ruby={v.hukumus[0][0][0].yomi} offset={0}/>,
        },
        { 
            title : '의미', key : 'imi', 
            render : (v) => v.hukumus[0][0][0].imi ?? '',
        },
        { 
            title : '표기 요약', key : 'sum', 
            render : (v) => <Space>{ 
                v.hukumus.map( (hu : db_hukumu_data[][]) => <ComplexText bId={null} data={hu[0][0].hyouki} ruby={hu[0][0].yomi} offset={0}/> )
            }</Space>,
        },
        { 
            title : '갯수', key : 'sum',
            render : (v) => v.hukumus.length.toString(),
        }
    ]

    const columns : TableColumnsType<DataType> = [
        { 
            title : '표기', key : 'hyouki', 
            render : (v) => <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>,
        },
        { title : '읽기', dataIndex : 'yomi', key : 'yomi' },
        { 
            title : '발음', key : 'pronc',
            render : (v) => HiraToKoNFC(v.yomi)
        },
        { 
            title : '한자', key : 'kanji', 
            render : (v) => v.kanjis.map( (k : db_kanji_data ) => k.jaText ).join(', '),
        },
    ]

    const videoColumns : TableColumnsType<VideoExpendedDataType> = [
        { 
            title : '영상 제목', dataIndex : 'title', key : 'title'
        },
        { 
            title : '갯수', dataIndex : 'length', key : 'sum'
        }
    ]

    const bunColumns : TableColumnsType<BunExpendedDataType> = [
        { 
            title : '원문', key : 'jaText',
            render : (v) => <div>
                        {v.jaText.substring(0, v.startOffset)}
                        <span className="bold highlight">
                        {v.jaText.substring(v.startOffset, v.endOffset)}
                        </span>
                        {v.jaText.substring(v.endOffset)}
                    </div>
        },
        { title : '번역문', dataIndex : 'koText', key : 'koText' },
        { title : '해당 영상으로 이동', key : 'src',
            render : (v) => <Button onClick={ () => navigate(`/video/${v.src}`) }>이돟</Button>
        }
    ]

    const AllRowRender = (v : db_hukumu_data[][][], i : number ) => (
        <Table<DataType>
            size="small"
            columns={columns}
            expandable={{ expandedRowRender : ( _, i) => HyoukiRowRender( v, i ) }}
            dataSource={ v.map( (_ : db_hukumu_data[][]) => _[0][0] ).map( (_, i) => { return { ..._, key : i.toString() }})  }    
        />
    )

    const HyoukiRowRender = (v : db_hukumu_data[][][], i : number) => (
        <Table<VideoExpendedDataType>
            size="small"
            columns={videoColumns}
            expandable={{ expandedRowRender : (_, j) => VideoRowRender(v, i, j) }}
            dataSource={ v[i].map( (_ : db_hukumu_data[]) => { return { ..._[0], length : _.length } } ).map( (_, i) => { return { ..._, key : i.toString() }}) }
        />
    )

    const VideoRowRender = (v : db_hukumu_data[][][], i : number, j : number) => (
        <Table<BunExpendedDataType>
            size="small"
            columns={bunColumns}
            dataSource={ v[i][j].map( (_, i) => { return { ..._, key : i.toString() }}) }
        />
    )

    return(
        <>
            {
                list !== null && 
                <Table<AllDataType>
                    size="small"
                    columns={allColumns}
                    expandable={{ expandedRowRender : ( _, i) => AllRowRender( _.hukumus, i ) }}
                    dataSource={ list.filter( (v, i) => ( (Number(page)-1) * pageSize <= i && i < Number(page) * pageSize )).map( (_, i) => { return { ..._, key : i.toString() }})  }    
                />
            }
        </>
    )
}

const DBSearch = () => {
    
    //State
    const [value, setValue] = useState<string>('');

    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setValue( e.target.value );
    }

    //Hook
    const navigate = useNavigate();
    const { isAllHangul } = useJaText();

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
            navigate(`/db/1`)
        }
        else{
            if( isAllHangul(value) === true ){
                navigate(`/db/search/1?keyword=${kirikae}&imiKeyword=${value}`)
            }
            else{
                navigate(`/db/search/1?keyword=${kirikae}`)
            }
            
        }
    }

    const deleteSearch = () => {
        setValue('');
        navigate(`/db/1`)
    }

    return (
        <Flex align='center' style={{ width : '100%'}}>
            <Input.Search allowClear name="search" value={kirikaeValue ?? ''} onChange={handleKrikae} autoComplete='off' onKeyDown={handleKeyDown} onSearch={onSearch}/>
        </Flex>
    )
}

const DBSearchList = () => {
    //State
    const [list, setList] = useState<db_all>([]);
    const [totalPage, setTotalPage] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState(24);
    
    //Hook
    const navigate = useNavigate();
    const location = useLocation();

    const { response, setParams, fetch, error } = useAxiosGet<any, any>('/db/all', true, null );

    //Handle
    const onChange = (page : number, pagesize : number) => {
        let search = location.search;
        let params = new URLSearchParams(search);
        let keyword = params.get('keyword');
        let imiKeyword = params.get('imiKeyword');

        navigate(`/db/search/${page}?keyword=${keyword}${ imiKeyword !== null ? `&imiKeyword=${imiKeyword}` : ``}`)
    }
    
    const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
        setPageSize(pageSize);
    };

    useEffect( () => {
        let res = response;
        if(res !== null){
            console.log(res.data);
            setList(res.data);
            setTotalPage(res.data.length);
        }
    }, [response])

    useEffect( () => {
        let search = location.search;
        let params = new URLSearchParams(search);
        let keyword = params.get('keyword');
        let imiKeyword = params.get('imiKeyword');

        if( keyword === null ){ return }
        if( imiKeyword === null ){
            setParams({ keyword : keyword });
        }
        else{
            setParams({ keyword : keyword, imiKeyword : imiKeyword });
        }
    }, [location, setParams])

    return(
        <>
            {
                totalPage === null || list.length === 0 ?
                <>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </>
                :
                <>
                    <Affix offsetTop={0}>
                        <Flex justify='center' style={{ backgroundColor : '#000000'}}>     
                            <Pagination align='center' showSizeChanger defaultCurrent={1} pageSize={pageSize} pageSizeOptions={[6, 12, 24]} total={totalPage} onChange={onChange} onShowSizeChange={onShowSizeChange}/>
                        </Flex>
                    </Affix>
                    <DBTable list={list} pageSize={pageSize}/>
                </>
            }
        </>
    )
}

export { DBPage }