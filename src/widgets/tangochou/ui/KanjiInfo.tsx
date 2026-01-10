import { useEffect, useState, useContext, CSSProperties } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//CSS@antd
import { Row, Col, Button, Card, Flex  } from 'antd'

const infoCompStyle : CSSProperties = {
    textAlign : 'left',
    margin : '20px'
}

export const KanjiInfo = () => {

    const { t } = useTranslation('KanjiInfo');

    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [kanji, setKanji] = useState<KanjiData | null>(null);
    const [list, setList] = useState<KanjiTangoData[] | null>(null);

    const { kId } = useParams();

    //Hook
    const navigate = useNavigate();

    const { response } = useAxiosGet<RES_GET_TANGOCHOU_KANJI_INFO, REQ_GET_TANGOCHOU_KANJI_INFO>('/db/tangochou/kanji/info', false, { videoId : videoId, kId : kId! });

    //Handle
    const handlePrev = () => {
        navigate(-1);
    }

    const handleClose = () => {
        navigate(`/video/${videoId}/tangochou/1`);
    }

    const handleClick = ( i : number) => {
        if( list === null ){ return }

        let tId = list[i].tId;
        if( tId === undefined ){ return } 
        
        navigate(`/video/${videoId}/tangochou/tango/${tId}`);
    }

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            setKanji(res.data.kanji)
            setList(res.data.tangoList);
        }
    }, [response])

    return(
        <>
            <div style={infoCompStyle}>
                <Flex justify='right' gap={8}>
                    <Button onClick={handlePrev}>{t('BUTTON.BACK')}</Button>
                    <Button onClick={handleClose}>{t('BUTTON.CLOSE')}</Button>
                </Flex>
                <div className="largeTango">
                    {kanji?.jaText}
                </div>
                <Row gutter={[16, 16]} style={{ marginTop : '20px', textAlign : 'center'}}>
                {
                    list !== null &&
                    list.map( (v, i) => 
                        <Col span={6} xxl={4} xl={6} lg={8} md={12} sm={24} xs={24} key={v.tId}>
                            <Card  onClick={() => handleClick(i)} style={{ height : '100%' }} styles={{ body : { padding : '24px 8px' } }} hoverable>
                                <ComplexText bId={null} data={v.hyouki} ruby={v.yomi} offset={0}/>
                            </Card>
                        </Col>
                    )
                }
                </Row>
            </div>
        </>
    )
}
