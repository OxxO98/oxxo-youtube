import { useEffect, CSSProperties } from 'react';
import VirtualList from 'rc-virtual-list';

//api
import useCommit from '../api/useCommit';

//ui
import HukumuItem from './HukumuItem';

//Redux
import { useAppSelector } from 'shared/store';

//CSS@antd
import { Spin } from 'antd'

interface HukumuListCompProps {
    hukumuList : HukumuList[];
    refetchHukumuList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

const ListItemStyle : CSSProperties = {
    height: 200,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    margin : '8px 0',
    boxSizing: 'border-box',
}

const HukumuListComp = ({ hukumuList, refetchHukumuList, refetchTangoList, refetchHandles } : HukumuListCompProps ) => {

    //Redux
    const { hukumuCheckLoading } = useAppSelector((state) => state.selection);

    //Hook
    const { refetch } = refetchHandles;

    //api
    const { response, commit } = useCommit();

    useEffect( () => {
        let res = response;
        if(res !== null){
            if( res.data !== undefined ){
                refetch(res.data.jaBId);
            }
            refetchHukumuList();
            refetchTangoList();
        }
    }, [response, refetchHukumuList, refetchTangoList]);

    return(
        <Spin spinning={hukumuCheckLoading}>
        {
            hukumuList !== null &&
            <VirtualList
                data={hukumuList}
                itemHeight={200}
                itemKey="jaBId"
            >
            {
                (hukumu) => (
                    <div style={ListItemStyle}>
                        <HukumuItem hukumu={hukumu} commitOne={commit}/>
                    </div>
                )
            }
            </VirtualList>
        }
        </Spin>
    )
}

export { HukumuListComp }