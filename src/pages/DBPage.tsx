
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//widgets
import { LayoutComp } from 'widgets/layout/index';
import { DBTable, DBSearch, DBSearchList } from 'widgets/db/index';

//CSS@Antd
import { Pagination, Flex, Affix, Spin } from 'antd';
import type { PaginationProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const PAGE_SIZE_OPTION = [10, 50, 100];

const DBPage = () => {
    const [data, setData] = useState<db_all>([]); 
    const [totalPage, setTotalPage] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTION[0]);

    const [container, setContainer] = useState<HTMLDivElement | null>(null);
  
    //Hook
    const navigate = useNavigate();
    const location = useLocation();

    const { response, loading, setParams } = useAxiosGet<RES_GET_DB, REQ_GET_DB>('/db/all', true, null);

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
            setData(res.data.db);
            setTotalPage(res.data.pagination.total)
        }
    }, [response])

    useEffect( () => {
        let pathname = location.pathname;
        let page = pathname.match(/\/db\/([0-9]+)/);
        
        if( page === null ){ return }

        setParams({ page : Number(page[1]), limit : pageSize });
    }, [location, setParams])
    
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
                            {
                                loading &&
                                <Spin indicator={<LoadingOutlined spin />} size="large"/>
                            }
                            </>
                            :
                            <>
                                <Affix offsetTop={0}>
                                    <Flex justify='center' style={{ backgroundColor : '#000000'}}>
                                        <Pagination align='center' showSizeChanger defaultCurrent={0} pageSize={pageSize} pageSizeOptions={PAGE_SIZE_OPTION} total={totalPage} onChange={onChange} onShowSizeChange={onShowSizeChange}/>
                                    </Flex>
                                </Affix>
                                {
                                    loading ?
                                        <Spin indicator={<LoadingOutlined spin />} size="large"/>
                                    :
                                        <DBTable list={data}/>
                                }
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

export { DBPage }