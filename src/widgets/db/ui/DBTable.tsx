
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

//Hook
import { useJaText } from 'shared/lib/useJaText';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//type
import { db_hukumu_data, db_all, db_tango_data, db_kanji_data } from "../type";

//CSS@Antd
import { Table, Button, Space } from 'antd';
import type { TableColumnsType } from 'antd';

interface DBTableProps {
    list : db_all;
    pageSize : number;
}

interface AllDataType extends db_tango_data {
    key : React.Key;
}

interface DataType extends db_hukumu_data {
    key : React.Key;
}

interface VideoExpendedDataType extends db_hukumu_data {
    key : React.Key;
}

interface BunExpendedDataType extends db_hukumu_data {
    key : React.Key;
}

export const DBTable = ({ list, pageSize } : DBTableProps) => {
    const { t } = useTranslation('DBTable');

    const { page } = useParams();

    const navigate = useNavigate();

    const { HiraToKoNFC } = useJaText()

    const allColumns : TableColumnsType<AllDataType> = [
        { 
            title : t('ALL_COLUMNS.0'), key : 'hyouki', 
            render : (v) => <ComplexText bId={null} data={v.hukumus[0][0][0].hyouki} ruby={v.hukumus[0][0][0].yomi} offset={0}/>,
        },
        { 
            title : t('ALL_COLUMNS.1'), key : 'imi', 
            render : (v) => v.hukumus[0][0][0].imi ?? '',
        },
        { 
            title : t('ALL_COLUMNS.2'), key : 'sum', 
            render : (v) => <Space>{ 
                v.hukumus.map( (hu : db_hukumu_data[][]) => <ComplexText bId={null} data={hu[0][0].hyouki} ruby={hu[0][0].yomi} offset={0}/> )
            }</Space>,
        },
        { 
            title : t('ALL_COLUMNS.3'), key : 'sum',
            render : (v) => v.hukumus.length.toString(),
        }
    ]

    const columns : TableColumnsType<DataType> = [
        { 
            title : t('COLUMNS.0'), key : 'hyouki', 
            render : (v) => <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>,
        },
        { 
            title : t('COLUMNS.1'), dataIndex : 'yomi', key : 'yomi' 
        },
        { 
            title : t('COLUMNS.2'), key : 'pronc',
            render : (v) => HiraToKoNFC(v.yomi)
        },
        { 
            title : t('COLUMNS.3'), key : 'kanji', 
            render : (v) => v.kanjis.map( (k : db_kanji_data ) => k.jaText ).join(', '),
        },
    ]

    const videoColumns : TableColumnsType<VideoExpendedDataType> = [
        { 
            title : t('VIDEO_COLUMNS.0'), dataIndex : 'title', key : 'title'
        },
        { 
            title : t('VIDEO_COLUMNS.1'), dataIndex : 'length', key : 'sum'
        }
    ]

    const bunColumns : TableColumnsType<BunExpendedDataType> = [
        { 
            title : t('BUN_COLUMNS.0'), key : 'jaText',
            render : (v) => <div>
                        {v.jaText.substring(0, v.startOffset)}
                        <span className="bold highlight">
                        {v.jaText.substring(v.startOffset, v.endOffset)}
                        </span>
                        {v.jaText.substring(v.endOffset)}
                    </div>
        },
        { 
            title : t('BUN_COLUMNS.1'), dataIndex : 'koText', key : 'koText' 
        },
        { 
            title : t('BUN_COLUMNS.2'), key : 'src',
            render : (v) => <Button onClick={ () => navigate(`/video/${v.src}`) }>{t('BUTTON.MOVE')}</Button>
        }
    ]

    const AllRowRender = (v : db_hukumu_data[][][], i : number ) => (
        <Table<DataType>
            size="small"
            columns={columns}
            expandable={{ expandedRowRender : ( _, i) => HyoukiRowRender( v, i ) }}
            dataSource={ v.map( (_ : db_hukumu_data[][]) => _[0][0] ).map( (_, i) => { return { ..._, key : i.toString() }})  }    
        />
    )

    const HyoukiRowRender = (v : db_hukumu_data[][][], i : number) => (
        <Table<VideoExpendedDataType>
            size="small"
            columns={videoColumns}
            expandable={{ expandedRowRender : (_, j) => VideoRowRender(v, i, j) }}
            dataSource={ v[i].map( (_ : db_hukumu_data[]) => { return { ..._[0], length : _.length } } ).map( (_, i) => { return { ..._, key : i.toString() }}) }
        />
    )

    const VideoRowRender = (v : db_hukumu_data[][][], i : number, j : number) => (
        <Table<BunExpendedDataType>
            size="small"
            columns={bunColumns}
            dataSource={ v[i][j].map( (_, i) => { return { ..._, key : i.toString() }}) }
        />
    )

    return(
        <>
            {
                list !== null && 
                <Table<AllDataType>
                    size="small"
                    columns={allColumns}
                    expandable={{ expandedRowRender : ( _, i) => AllRowRender( _.hukumus, i ) }}
                    dataSource={ list.filter( (v, i) => ( (Number(page)-1) * pageSize <= i && i < Number(page) * pageSize )).map( (_, i) => { return { ..._, key : i.toString() }})  }    
                />
            }
        </>
    )
}