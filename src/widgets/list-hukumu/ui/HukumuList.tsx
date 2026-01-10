import { useEffect, CSSProperties } from 'react';
import VirtualList from 'rc-virtual-list';

//api
import useCommit from '../api/useCommit';

//ui
import HukumuItem from './HukumuItem';

//CSS@antd
import { List, Skeleton } from 'antd'

interface HukumuListCompProps {
    hukumuList : HukumuList[];
    refetchHukumuList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

const ListCompStyle : CSSProperties = {
    padding : '16px'
}

const HukumuListComp = ({ hukumuList, refetchHukumuList, refetchTangoList, refetchHandles } : HukumuListCompProps ) => {

    //Hook
    const { refetch } = refetchHandles;

    //api
    const { response, loading, commit } = useCommit();

    useEffect( () => {
        let res = response;
        if(res !== null){
            if( res.data !== undefined ){
                refetch(res.data.jaBId); //수정 한다면 response에서 refetch의 jaBID를 반환
            }
            refetchHukumuList();
            refetchTangoList();
        }
    }, [response, refetchHukumuList, refetchTangoList]);

    return(
        <Skeleton loading={loading} title={false} active>
        {
            hukumuList !== null &&
            <List style={ListCompStyle}>
                <VirtualList
                    data={hukumuList}
                    itemHeight={47}
                    itemKey="jaBId"
                >
                {
                    (hukumu) => (
                        <List.Item>
                            <HukumuItem hukumu={hukumu} commitOne={commit}/>
                        </List.Item>
                    )
                }
                </VirtualList>
            </List>
        }
        </Skeleton>
    )
}

export { HukumuListComp }