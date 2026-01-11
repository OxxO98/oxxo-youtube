
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//ui
import { DBTable } from '../ui/DBTable'

//type
import { db_all } from "../type";

//CSS@Antd
import { Pagination, Empty, Flex, Affix } from 'antd';
import type { PaginationProps } from 'antd';

export const DBSearchList = () => {
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