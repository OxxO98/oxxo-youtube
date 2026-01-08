import { useMemo, CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import VirtualList from 'rc-virtual-list';

//ui
import { TangoDB } from './TangoDB';

//Css@antD
import { Tabs, List } from 'antd';
import type { TabsProps } from 'antd';
import { useSearchedArr } from '../model/useSearchedArr';

const ListCompStyle : CSSProperties = {
    padding : '16px',
    maxHeight : '60vh',
    overflow : 'scroll'
}

interface AccordianTangoDBProps {
    searchedList : TangoDBSearchedList | null;
    handleSubmit : (tId : string | null) => void;
}

export const AccordianTangoDB = ({ searchedList, handleSubmit } : AccordianTangoDBProps ) => {

    const { t } = useTranslation('AccordianTangoDB');

    const { getSearchedArr } = useSearchedArr();
    
    const items: TabsProps['items'] = useMemo( () => getSearchedArr(searchedList).map( (v, i) => { return {
        key : i.toString(),
        label : v.name,
        children : <div>
            <div>{t('CONTENTS.MESSAGE', {count : v.count})}</div>
            <List style={ListCompStyle}>
                <VirtualList
                    data={v.list}
                    itemHeight={47}
                    itemKey="tId"
                >
                {
                    (data) => (
                        <List.Item>
                            <TangoDB data={data} handleSubmit={handleSubmit}/>
                        </List.Item>
                    )
                }
                </VirtualList>
            </List>
        </div>
    } }), [searchedList])

    return(
        <Tabs defaultActiveKey="1" items={items}/>
    )
}