
//Hook
import { useRender } from '../lib/useRender';

//type
import { DBTangoDataType, DBVideoDataType } from '../type';

//CSS@Antd
import { Table } from 'antd';

interface DBTableProps {
    list : db_all | db_all_text;
    type? : SearchType;
}

const DB_SCROLL_HEIGHT = 'calc(100vh - 128px - 39px)'

export const DBTable = ({ list, type } : DBTableProps) => {
    
    const { tango_all_col, tango_all_render, text_all_col, text_all_render } = useRender();    

    return(
        <>
            {
                list !== null && 
                <>
                {
                    type !== 'jaText' && type !== 'koText' ?
                        <Table<DBTangoDataType>
                            size="small"
                            scroll={{ y : DB_SCROLL_HEIGHT, scrollToFirstRowOnChange : true }}
                            columns={tango_all_col}
                            pagination={false}
                            expandable={{ expandedRowRender : ( _, i) => tango_all_render( _.hukumus, i ) }}
                            dataSource={ (list as db_all).map( (v, i) => { return { ...v, key : v.tId }})  }    
                        />
                        :
                        <Table<DBVideoDataType>
                            size="small"
                            scroll={{ y : DB_SCROLL_HEIGHT, scrollToFirstRowOnChange : true }}
                            columns={text_all_col}
                            pagination={false}
                            expandable={{ expandedRowRender : ( _, i) => text_all_render( _.buns, i ) }}
                            dataSource={(list as db_all_text).map( (v) => { return { ...v, key : v.src } } )}
                        />
                }
                </>
            }
        </>
    )
}