import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//ui
import { TangochouTableComp } from './TangochouTableComp';

//CSS@antd
import { Pagination, Empty  } from 'antd'
import type { PaginationProps } from 'antd';

export const SearchTangoListComp = () => {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [list, setList] = useState<RES_TANGOCHOU_LIST>([]);
    const [totalPage, setTotalPage] = useState<number | null>(null);
    const [pageSize, setPageSize] = useState(24);

    //Hook
    const navigate = useNavigate();
    const location = useLocation();
    
    const { response, setParams } = useAxiosGet<RES_GET_TANGOCHOU_SEARCH, REQ_GET_TANGOCHOU_SEARCH>('/db/tangochou/search', true, null);

    //Handle
    const onChange = (page : number, pagesize : number) => {
        let search = location.search;
        let params = new URLSearchParams(search);
        let keyword = params.get('keyword');
        let imiKeyword = params.get('imiKeyword');

        navigate(`/video/${videoId}/tangochou/search/${page}?keyword=${keyword}${ imiKeyword !== null ? `&imiKeyword=${imiKeyword}` : ``}`)
    }
    
    const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
        setPageSize(pageSize);
    };

    //Effect
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
        let imiKeyword = params.get('imiKeyword');

        if( keyword === null ){ return }
        if( imiKeyword === null ){
            setParams({ videoId : videoId, keyword : keyword });
        }
        else{
            setParams({ videoId : videoId, keyword : keyword, imiKeyword : imiKeyword });
        }
    }, [location, setParams, videoId])


    return(
        <>
            {
                totalPage === null || list.length === 0 ?
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