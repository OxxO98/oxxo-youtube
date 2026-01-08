import { useEffect, useState, useContext } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//widgets
import { PdfModalComp } from 'widgets/pdf-modal/index';

//ui
import { SearchTangoComp } from './SearchTangoComp';
import { TangochouTableComp } from './TangochouTableComp';
import { SearchTangoListComp } from './SearchTangoListComp';
import { TangoInfo } from './TangoInfo';
import { KanjiInfo } from './KanjiInfo';

//CSS@antd
import { Pagination, Flex, Empty  } from 'antd'
import type { PaginationProps } from 'antd';

const TangochouComp = () => {

    //Context
    const { videoId } = useContext(VideoContext);
    
    //State
    const [totalPage, setTotalPage] = useState<number | null>(null);
    const [list, setList] = useState<RES_TANGOCHOU_LIST>([]);
    const [pageSize, setPageSize] = useState(24);

    //Hook
    const navigate = useNavigate();

    const { response } = useAxiosGet<RES_GET_TANGOCHOU, REQ_GET_TANGOCHOU>('/db/tangochou', false, { videoId : videoId } );

    //Handle
    const onChange = (page : number, pagesize : number) => {
        navigate(`/video/${videoId}/tangochou/${page}`)
    }
    
    const onShowSizeChange: PaginationProps['onShowSizeChange'] = (current, pageSize) => {
        setPageSize(pageSize);
    };

    //Effect
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

export { TangochouComp };
