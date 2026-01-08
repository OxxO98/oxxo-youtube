import { CSSProperties } from 'react';
import { useParams } from "react-router-dom";

//ui
import { TangochouRepresentive } from './TangochouRepresentive';

//config
import { span } from '../config/tableGrid';

//CSS@antd
import { Row, Col } from 'antd'

const tableCompStyle : CSSProperties = {
    margin : '20px'
}

interface TangochouTableCompProps {
    list :  RES_TANGOCHOU_LIST;
    pageSize : number;
}

export const TangochouTableComp = ({ list, pageSize } : TangochouTableCompProps ) => {
    const { page } = useParams();
    
    return(
        <>
            <Row gutter={[16, 16]} style={tableCompStyle}>
            {
                page !== undefined && 
                list.filter( (v, i) => ( (Number(page)-1) * pageSize <= i && i < Number(page) * pageSize ))
                .map( (v) =>                 
                    <Col span={6} 
                        xxl={span[pageSize].xxl} 
                        xl={span[pageSize].xl} 
                        lg={span[pageSize].lg} 
                        md={span[pageSize].md} 
                        sm={span[pageSize].sm} 
                        xs={span[pageSize].xs} 
                        key={v.tId}
                    >
                        <TangochouRepresentive tId={v.tId} hyouki={v.hyouki} yomi={v.yomi} imi={v.imi}/>
                    </Col>
                )
            }
            </Row>
        </>
    )

}