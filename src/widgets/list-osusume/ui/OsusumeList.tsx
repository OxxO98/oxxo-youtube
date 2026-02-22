import { CSSProperties } from 'react';

import VirtualList from 'rc-virtual-list';

//ui
import { OsusumeItem } from './OsusumeItem'

//Redux
import { useAppSelector } from 'shared/store';

//CSS@antd
import { Spin, Empty } from 'antd'

interface OsusumeListCompProps {
    osusumeList : OsusumeList[];
    refetchOsusumeList : () => void;
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
                <Spin spinning={hukumuCheckLoading}>
                {
                    osusumeList !== null &&
                    <VirtualList
                        data={osusumeList}
                        itemHeight={200}
                        itemKey="tId"
                    >
                    {
                        (v) => (
                            <div style={ListItemStyle}>
                                <OsusumeItem osusume={v} refetchOsusumeList={refetchOsusumeList} refetchTangoList={refetchTangoList} refetchHandles={refetchHandles}/>
                            </div>
                        )
                    }
                    </VirtualList>
                }
                </Spin>
            </>
        }
        </>
    )
}

export default OsusumeListComp;
