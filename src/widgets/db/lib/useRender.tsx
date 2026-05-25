
import { CSSProperties } from "react";

import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

//Hook
import { useJaText } from 'shared/lib/useJaText';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//ui
import { DBReading } from "../ui/DBReading";

//type
import { DBTangoDataType, DBHukumuDataType, DBVideoDataType, DBTextDataType, HukumuDataType } from '../type'

//CSS@Antd
import { Table, Button, Space } from 'antd';
import type { TableColumnsType } from 'antd';

const DB_TABLE_MARGIN = 8;

function useRender(){
    const { t } = useTranslation('DBPage');

    const navigate = useNavigate();

    const { HiraToKoNFC } = useJaText()

    const getMatchedHukumu = (v : DBTangoDataType) => {
        if( v.match !== undefined ){
            return v.hukumus[v.match.hyoukiIndex][v.match.videoIndex][v.match.bunIndex];
        }

        return v.hukumus[0][0][0];
    };
    
    //Tango
    const tango_all_col : TableColumnsType<DBTangoDataType> = [
        { 
            title : t('TANGO_COL.0.0'), key : 'hyouki', 
            render : (v) => {
                let hukumu = getMatchedHukumu(v);

                return <ComplexText bId={null} data={hukumu.hyouki} ruby={hukumu.yomi} offset={0}/>;
            },
            width : '20%'
        },
        { 
            title : t('TANGO_COL.0.1'), key : 'imi', 
            render : (v) => getMatchedHukumu(v).imi ?? '',
            width : '20%'
        },
        { 
            title : t('TANGO_COL.0.2'), key : 'sum', 
            render : (v) => <Space>{ 
                v.hukumus.map( (hu : db_hukumu_data[][]) => <ComplexText bId={null} data={hu[0][0].hyouki} ruby={hu[0][0].yomi} offset={0}/> )
            }</Space>,
            width : '50%'
        },
        { 
            title : t('TANGO_COL.0.3'), key : 'sum',
            render : (v) => v.hukumus.length.toString(),
            width : '10%'
        }
    ]

    const tango_hyouki_col : TableColumnsType<DBHukumuDataType> = [
        { 
            title : t('TANGO_COL.1.0'), key : 'hyouki', 
            render : (v) => <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>,
            width : '30%'
        },
        { 
            title : t('TANGO_COL.1.1'), dataIndex : 'yomi', key : 'yomi',
            width : '30%'
        },
        { 
            title : t('TANGO_COL.1.2'), key : 'pronc',
            render : (v) => HiraToKoNFC(v.yomi),
            width : '20%'
        },
        { 
            title : t('TANGO_COL.1.3'), key : 'kanji', 
            render : (v) => v.kanjis.map( (k : db_kanji_data ) => k.jaText ).join(', '),
            width : '20%'
        },
    ]

    const tango_video_col : TableColumnsType<DBHukumuDataType> = [
        { 
            title : t('TANGO_COL.2.0'), dataIndex : 'title', key : 'title',
            width : '80%'
        },
        { 
            title : t('TANGO_COL.2.1'), dataIndex : 'length', key : 'sum',
            width : '10%'
        },
        { 
            title : t('TANGO_COL.2.2'), key : 'src',
            render : (v) => <Button type="primary" onClick={ () => navigate(`/video/${v.src}`) }>{t('BUTTON.MOVE_VIDEO')}</Button>,
            width : '10%'
        }
    ]

    const tango_bun_col : TableColumnsType<DBHukumuDataType> = [
        { 
            title : t('TANGO_COL.3.0'), key : 'jaText',
            render : (v) => <div>
                        {v.jaText.substring(0, v.startOffset)}
                        <span className="bold highlight">
                        {v.jaText.substring(v.startOffset, v.endOffset)}
                        </span>
                        {v.jaText.substring(v.endOffset)}
                    </div>,
            width : '30%'
        },
        { 
            title : t('TANGO_COL.3.1'), dataIndex : 'koText', key : 'koText',
            width : '30%'
        },
        {
            title : t('TANGO_COL.3.2'), key : 'reading',
            render : (v) => <DBReading data={v}/>,
            width : '30%'
        },
        { 
            title : t('TANGO_COL.3.3'), key : 'src',
            render : (v) => <Button onClick={ () => navigate(`/video/${v.src}?startTime=${v.startTime}`) }>{t('BUTTON.MOVE_TIMELINE')}</Button>,
            width : '10%'
        }
    ]

    //Text
    const text_all_col : TableColumnsType<DBVideoDataType> = [
        { 
            title : t('TEXT_COL.0.0'), key : 'title',
            render : (v) => v.buns[0].title,
            width : '80%'
        },
        { 
            title : t('TEXT_COL.0.1'), key : 'sum',
            render : (v) => v.buns.length,
            width : '10%'
        },
        { 
            title : t('TEXT_COL.0.2'), key : 'src',
            render : (v) => <Button type="primary" onClick={ () => navigate(`/video/${v.src}`) }>{t('BUTTON.MOVE_VIDEO')}</Button>,
            width : '10%'
        }
    ]

    const text_bun_col : TableColumnsType<DBTextDataType> = [
        { 
            title : t('TEXT_COL.1.0'), key : 'jaText',
            render : (v) => v.match.type === 'jaText' ?
                <div>
                    {v.jaText.substring(0, v.match.start)}
                    <span className="bold highlight">
                    {v.jaText.substring(v.match.start, v.match.end)}
                    </span>
                    {v.jaText.substring(v.match.end)}
                </div>
                :
                v.jaText
            ,
            width : '30%'
        },
        { 
            title : t('TEXT_COL.1.1'), key : 'koText',
            render : (v) => v.match.type === 'koText' ?
                <div>
                    {v.koText.substring(0, v.match.start)}
                    <span className="bold highlight">
                    {v.koText.substring(v.match.start, v.match.end)}
                    </span>
                    {v.koText.substring(v.match.end)}
                </div>
                :
                <div>{v.koText ?? ''}</div>
            ,
            width : '30%'
        },
        {
            title : t('TEXT_COL.1.2'), key : 'reading',
            render : (v) => <DBReading data={v}/>,
            width : '30%'
        },
        { 
            title : t('TEXT_COL.1.3'), key : 'src',
            render : (v) => <Button onClick={ () => navigate(`/video/${v.src}?startTime=${v.startTime}`) }>{t('BUTTON.MOVE_TIMELINE')}</Button>,
            width : '10%'
        }
    ]

    const text_hukumu_col : TableColumnsType<HukumuDataType> = [
        { 
            title : t('TEXT_COL.2.0'), key : 'hyouki', 
            render : (v) => <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>,
        },
        { 
            title : t('TEXT_COL.2.1'), dataIndex : 'yomi', key : 'yomi' 
        },
        { 
            title : t('TEXT_COL.2.2'), key : 'pronc',
            render : (v) => HiraToKoNFC(v.yomi)
        },
    ]

    //Tango
    const tango_all_render = (v : db_hukumu_data[][][], i : number ) => (
        <Table<DBHukumuDataType>
            sticky={true}
            size="small"
            columns={tango_hyouki_col}
            style={{ marginBottom : DB_TABLE_MARGIN }}
            expandable={{ expandedRowRender : ( _, i) => tango_hyouki_render( v, i ) }}
            dataSource={ v.map( (_ : db_hukumu_data[][]) => _[0][0] ).map( (_, i) => { return { ..._, key : i.toString() }})  }    
            pagination={false}
        />
    )

    const tango_hyouki_render = (v : db_hukumu_data[][][], i : number) => (
        <Table<DBHukumuDataType>
            size="small"
            columns={tango_video_col}
            style={{ marginBottom : v.length-1 == i ? 0 : DB_TABLE_MARGIN }}
            expandable={{ expandedRowRender : (_, j) => tango_video_render(v, i, j) }}
            dataSource={ v[i].map( (_ : db_hukumu_data[]) => { return { ..._[0], length : _.length } } ).map( (_, i) => { return { ..._, key : i.toString() }}) }
            pagination={false}
        />
    )

    const tango_video_render = (v : db_hukumu_data[][][], i : number, j : number) => (
        <Table<DBHukumuDataType>
            size="small"
            columns={tango_bun_col}
            style={{ marginBottom : v[i].length-1 == j ? 0 : DB_TABLE_MARGIN }}
            dataSource={ v[i][j].map( (_, i) => { return { ..._, key : i.toString() }}) }
            pagination={false}
        />
    )

    //Text
    const text_all_render = (v : db_text_data[], i : number) => (
        <Table<DBTextDataType>
            sticky={true}
            size="small"
            columns={text_bun_col}
            style={{ marginBottom : DB_TABLE_MARGIN }}
            expandable={{ 
                expandedRowRender : (_, i) => text_hyouki_render(_, v.length-1 == i ? 0 : DB_TABLE_MARGIN), 
                rowExpandable: (record) => record.hukumus.length > 0
            }}
            dataSource={ v.map( (_, i) => { return { ..._, key : i.toString() }}) }
            pagination={false}
        />
    )

    const text_hyouki_render = (v : db_text_data, margin : number) => (
        <Table<HukumuDataType>
            size="small"
            columns={text_hukumu_col}
            style={{ marginBottom : margin }}
            dataSource={ v.hukumus.map( (_ : HukumuData, i) => { return { ..._, key : i.toString() }}) }
            pagination={false}
        />
    )

    return { tango_all_col, tango_all_render, text_all_col, text_all_render }
}

export { useRender }
