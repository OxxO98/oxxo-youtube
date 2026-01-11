
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//widgets
import { LayoutComp } from 'widgets/layout/index';
import { DBTable, DBSearch, DBSearchList } from 'widgets/db/index';
import type { db_all } from 'widgets/db/type';

//CSS@Antd
import { Pagination, Empty, Flex, Affix } from 'antd';
import type { PaginationProps } from 'antd';

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

export { DBPage }