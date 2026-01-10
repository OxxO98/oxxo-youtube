import { CSSProperties } from 'react';

import VirtualList from 'rc-virtual-list';

//ui
import { Tango } from './TangoItem';

//Redux
import { useAppSelector } from 'shared/store';

//CSS@antd
import { List, Empty } from 'antd'

interface TangoListCompProps {
    tangoList : TangoList[] | null;
}

const ListCompStyle : CSSProperties = {
    padding : '16px'
}

export const TangoListComp = ({ tangoList } : TangoListCompProps ) => {

    //Redux
    const { hukumuCheckLoading } = useAppSelector((state) => state.selection);

    return(
        <>
        {
            tangoList === null ?
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            :
            <>
            {
                tangoList !== null &&
                <List style={ListCompStyle} loading={hukumuCheckLoading}>
                    <VirtualList
                        data={tangoList}
                        itemHeight={47}
                        itemKey="tId"
                    >
                    {
                        (tango) => (
                            <List.Item>
                                <Tango tId={tango.tId}/>
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

export default TangoListComp