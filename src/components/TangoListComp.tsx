import React, { useEffect, useState, useContext, CSSProperties } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import VirtualList from 'rc-virtual-list';

//Context
import { VideoContext } from 'contexts/VideoContext';

//Component
import { ComplexText } from 'components/Bun';

//Hook
import { useAxiosGet } from 'hooks/AxiosHook';

//CSS@antd
import { List, Card, Button, Empty } from 'antd'

interface TangoListCompProps {
    tangoList : Array<TangoList> | null;
}

interface TangoProps {
    tId : tId;
}

const ListCompStyle : CSSProperties = {
    padding : '16px'
}

const TangoListComp = ({ tangoList } : TangoListCompProps ) => {

    return(
        <>
        {
            tangoList === null ?
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            :
            <>
            {
                tangoList !== null &&
                <List style={ListCompStyle}>
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

const Tango = ({ tId } : TangoProps ) => {

    const { t } = useTranslation('Tango');

    const { videoId } = useContext(VideoContext);

    const [tangoData, setTangoData] = useState<TangoData | null>(null);

    //Hook
    const navigate = useNavigate();

    const {response : resTango } = useAxiosGet<RES_GET_TANGO, REQ_GET_TANGO>('/db/tango', false, { tId : tId });

    useEffect( () => {
        let res = resTango;
        if(res !== null){
            setTangoData(res.data);
        }
    }, [resTango])

    const handleToTango = () => {
        navigate(`/video/${videoId}/tangochou/tango/${tId}`)
    }

    return(
        <>
        {
            tangoData &&
            <Card
                style={{ width : '100%' }}
                actions={[
                    <Button onClick={handleToTango}>{t('BUTTON.MOVE')}</Button>
                ]}
            >
                <Card.Meta
                    title={
                        tangoData.list &&
                        <ComplexText bId={null} data={tangoData.list[0].hyouki} ruby={tangoData.list[0].yomi} offset={0}/>
                    }
                    description={
                        <>
                        {
                            tangoData.imi && tangoData.imi.length !== 0 &&
                            <>{tangoData.imi.join(',')}</>
                        }
                        </>
                    }
                />
            </Card>
        }
        </>
    )
}

export { TangoListComp }