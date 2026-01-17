import { useMemo, CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import VirtualList from 'rc-virtual-list';

//ui
import { TangoDB } from './TangoDB';

//model
import { useSearchedArr } from '../model/useSearchedArr';

//Css@antD
import { Tabs, theme } from 'antd';
import type { TabsProps } from 'antd';
const { useToken } = theme; 

const ListCompStyle : CSSProperties = {
    maxHeight : '60vh',
    overflow : 'scroll'
}


const ListItemStyle : CSSProperties = {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    padding : '8px',    
    margin : '8px 0',
    boxSizing: 'border-box',
}

interface AccordianTangoDBProps {
    searchedList : TangoDBSearchedList | null;
    handleSubmit : (tId : string | null) => void;
}

export const AccordianTangoDB = ({ searchedList, handleSubmit } : AccordianTangoDBProps ) => {

    const { t } = useTranslation('AccordianTangoDB');

    const { getSearchedArr } = useSearchedArr();
    
    const { token } = useToken();

    const items: TabsProps['items'] = useMemo( () => getSearchedArr(searchedList).map( (v, i) => { return {
        key : i.toString(),
        label : v.name,
        children : <div>
            <div>{t('CONTENTS.MESSAGE', {count : v.count})}</div>
            <div style={ListCompStyle}>
                <VirtualList
                    data={v.list}
                    itemHeight={64}
                    itemKey="tId"
                >
                {
                    (data) => (
                        <div style={{
                            ...ListItemStyle,
                            backgroundColor : token.colorBgContainer
                        }}>
                            <TangoDB data={data} handleSubmit={handleSubmit}/>
                        </div>
                    )
                }
                </VirtualList>
            </div>
        </div>
    } }), [searchedList])

    return(
        <Tabs defaultActiveKey="1" items={items}/>
    )
}