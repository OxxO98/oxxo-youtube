import { CSSProperties } from 'react';

import VirtualList from 'rc-virtual-list';

//widget
import { TangoAutoModal } from 'widgets/tango-auto-modal/index';

//ui
import { Tango } from './TangoItem';

//Redux
import { useAppSelector } from 'shared/store';

//CSS@antd
import { Spin } from 'antd'

interface TangoListCompProps {
    tangoList : TangoList[] | null;
    refetchTangoList : () => void;
}

const ListItemStyle : CSSProperties = {
    height: 160,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',             
    margin : '8px 0',
    boxSizing: 'border-box',
}

export const TangoListComp = ({ tangoList, refetchTangoList } : TangoListCompProps ) => {

    //Redux
    const { hukumuCheckLoading } = useAppSelector((state) => state.selection);

    return(
        <>
        {
            ( tangoList === null || tangoList.length == 0 ) ?
            <TangoAutoModal refetchTangoList={refetchTangoList}/>
            :
            <>
                <Spin spinning={hukumuCheckLoading}>
                {
                    tangoList !== null &&
                    <VirtualList
                        data={tangoList}
                        itemHeight={200}
                        itemKey="tId"
                    >
                    {
                        (tango) => (
                            <div style={ListItemStyle}>
                                <Tango tangoData={tango}/>
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

export default TangoListComp