
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//ui
import { DBTable } from '../ui/DBTable'

//CSS@Antd
import { Pagination, Empty, Flex, Affix, Spin } from 'antd';
import type { PaginationProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const PAGE_SIZE_OPTION = [10, 50, 100];

export const DBSearchList = () => {
    //State
    const [list, setList] = useState<db_all | db_all_text>([]);
    const [totalPage, setTotalPage] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0]);
    const [searchType, setSearchType] = useState<SearchType>('auto');
    
    //Hook
    const navigate = useNavigate();
    const location = useLocation();

    const { response, loading, setParams } = useAxiosGet<RES_GET_SEARCH_DB, REQ_GET_SEARCH_DB>('/db/search', true, null );

    //Handle
    const onChange = (page : number, pagesize : number) => {
        let search = location.search;
        let params = new URLSearchParams(search);
        let type = params.get('type');
        let keyword = params.get('keyword');
        
        navigate(`/db/search/${page}?type=${type}&keyword=${keyword}`)
    }
    
    const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
        setPageSize(pageSize);
    };

    useEffect( () => {
        let res = response;
        if(res !== null){
            setList(res.data.db);
            setTotalPage(res.data.pagination.total);
            setSearchType(res.data.type);
        }
    }, [response])

    useEffect( () => {
        let pathname = location.pathname;
        let page = pathname.match(/\/db\/search\/([0-9]+)/);

        let search = location.search;
        let params = new URLSearchParams(search);
        let type = params.get('type');
        let keyword = params.get('keyword');

        if( keyword === null || page === null || type == null ){ return }
        setParams({ type : type, keyword : keyword, page : Number(page[1]), limit : pageSize })
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
                            <Pagination align='center' showSizeChanger defaultCurrent={1} pageSize={pageSize} pageSizeOptions={PAGE_SIZE_OPTION} total={totalPage} onChange={onChange} onShowSizeChange={onShowSizeChange}/>
                        </Flex>
                    </Affix>
                    {
                        loading ?
                            <Spin indicator={<LoadingOutlined spin />} size="large"/>
                        :
                            <DBTable list={list} type={searchType}/>
                    }
                </>
            }
        </>
    )
}