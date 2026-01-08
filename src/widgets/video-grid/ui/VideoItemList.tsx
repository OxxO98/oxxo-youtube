import { useNavigate } from "react-router-dom";

//ui
import { ModalEditVideo } from "./ModalEditVideo";

//config
import { GET_IMG_SRC, span } from '../config/video-grid-config'

//CSS@AntD
import { Card, Row, Col, Flex, Image, Tag } from "antd";

interface VideoCardListCompProps {
    list : RES_VIDEO[];
    refetch : () => void;
}

export const VideoCardListComp = ({ list, refetch } : VideoCardListCompProps ) => {

    //Hook
    const navigate = useNavigate();
    
    //Handle
    const handleCardClick = (videoId : string) => {
        navigate(`/video/${videoId}`);
    }

    return(
        <Row gutter={[16, 16]}>
        {
            list.map( (v) => 
                <Col span={span.default} 
                    xxl={span.xxl} 
                    xl={span.xl} 
                    lg={span.lg}  
                    md={span.md} 
                    sm={span.sm}  
                    xs={span.xs}  
                    key={v.src}
                >
                    <Card 
                        title={v.title}
                        extra={
                            <ModalEditVideo data={v} refetch={refetch}/>
                        }
                        style={{ height : '100%'}}
                    >
                        <Image width="100%" src={GET_IMG_SRC(v.src)} preview={false} onClick={() => handleCardClick(v.src)}/>
                        {
                            v.tags !== undefined &&
                            <Flex gap="small" align="center" wrap style={{ margin : '8px 0'}}>
                            {
                                
                                v.tags.map( (t) => <Tag key={t}>{t}</Tag>)
                            }
                            </Flex>
                        }   
                    </Card>
                </Col>
            )
        }
        </Row>
        
    )
}