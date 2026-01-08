import { CSSProperties } from 'react';

import VirtualList from 'rc-virtual-list';

//ui
import { OsusumeItem } from './OsusumeItem'

//Redux
import { useAppSelector } from 'shared/store';

//CSS@antd
import { List, Empty } from 'antd'

interface OsusumeListCompProps {
    osusumeList : Array<OsusumeList>;
    refetchOsusumeList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

const ListCompStyle : CSSProperties = {
    padding : '16px'
}

export const OsusumeListComp = ({ osusumeList, refetchOsusumeList, refetchTangoList, refetchHandles } : OsusumeListCompProps ) => {

    //Redux
    const { hukumuCheckLoading } = useAppSelector((state) => state.selection);

    return(
        <>
        {
            osusumeList === null ?
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            :
            <>
            {
                osusumeList !== null &&
                <List style={ListCompStyle} loading={hukumuCheckLoading}>
                    <VirtualList
                        data={osusumeList}
                        itemHeight={47}
                        itemKey="tId"
                    >
                    {
                        (v) => (
                            <List.Item>
                                <OsusumeItem osusume={v} refetchOsusumeList={refetchOsusumeList} refetchTangoList={refetchTangoList} refetchHandles={refetchHandles}/>
                            </List.Item>
                        )
                    }
                    </VirtualList>
                </List>
            }
            </>
        }
        </>
    )
}

export default OsusumeListComp;
