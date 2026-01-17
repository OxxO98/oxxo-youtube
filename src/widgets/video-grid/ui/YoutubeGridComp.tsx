import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//ui
import { VideoCardListComp } from './VideoItemList';
import { NewVideoComp } from './NewVideo';

//CSS@AntD
import { Input, Flex, notification, Empty } from "antd";
import type {  GetProps } from 'antd'

//Redux
import { useAppDispatch, selectionActions } from 'shared/store';
const { clear } = selectionActions;

type SearchProps = GetProps<typeof Input.Search>;

const YoutubeGridComp = () => {
    const { t } = useTranslation('YoutubeGridComp');

    //State
    const [videos, setVideos] = useState<RES_GET_VIDEO | null>(null);
    const [list, setList] = useState<RES_GET_VIDEO_SEARCH | null>(null);
    const [value, setValue] = useState<string>('');
    
    const [messageApi, contextHolder] = notification.useNotification();

    //Hook
    const { response, fetch : refetch } = useAxiosGet<RES_GET_VIDEO, REQ_GET_VIDEO>('/db/video', false, null);
    const { response : resSearch, setParams : setParamsSearch } = useAxiosGet<RES_GET_VIDEO_SEARCH, REQ_GET_VIDEO_SEARCH>('/db/video/search', true, null);

    const { response : resIntegrity, fetch  } = useAxiosGet<RES_GET_INTEGRITY, REQ_GET_INTEGRITY>('/db/integrity', true, null);

    const navigate = useNavigate();
    const location = useLocation();

    const dispatch = useAppDispatch();

    //Handle
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setValue( e.target.value );
    }

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
        if(value === ''){
            deleteSearch();
            return;
        }
        navigate(`/?keyword=${value}`);
    }

    const deleteSearch = () => {
        setValue('');
        navigate(`/`);
        setList(null);
    }

    //Effect
    useEffect( () => {
        let res = response;
        if( res !== null ){
            setVideos(res.data);
            fetch();
            dispatch( clear() );
        }
    }, [response, fetch])

    useEffect( () => {
        let res = resIntegrity;
        if( res !== null ){
            if(res.message === 'done'){
                messageApi['success']({
                    message: t('MESSAGE'),
                    description: t('DESCRIPTION'),
                    placement : 'bottomRight'
                });
            }
        }
    }, [resIntegrity, messageApi])
    
    useEffect( () => {
        let search = location.search;
        let params = new URLSearchParams(search);
        let keyword = params.get('keyword');

        if(keyword === null){ return }

        setParamsSearch({ keyword : keyword });
    }, [location, setParamsSearch])

    useEffect( () => {
        let res = resSearch;
        if(res !== null){
            setList(res.data)
        }
    }, [resSearch])

    return(
        <>
            {contextHolder}
            <Flex justify='right' style={{ margin : '8px 0'}} gap={16}>
                <NewVideoComp refetch={refetch}/>
                <Flex align='center' style={{ width : '100%'}}>
                    <Input.Search allowClear name="search" value={value} onChange={handleChange} autoComplete='off' onKeyDown={handleKeyDown} onSearch={onSearch}/>
                </Flex>
            </Flex>
            <div style={{ overflow : "scroll", height : "calc(100vh - 96px)"}}>
            {
                list !== null ?
                    list.length !== 0 ?
                        <VideoCardListComp list={list} refetch={refetch}/>
                    :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                :
                videos !== null ?
                    videos.length !== 0 ?
                        <VideoCardListComp list={videos} refetch={refetch}/>
                    :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }
            </div>
        </>
    )
}



export { YoutubeGridComp }