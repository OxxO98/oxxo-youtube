import { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//api
import { useMoveTo } from '../api/useMoveTo';

//CSS@antd
import { Card, Button } from 'antd';

interface TangoProps {
    tId : tId;
}

const Tango = ({ tId } : TangoProps ) => {
    //i18n
    const { t } = useTranslation('Tango');

    const [tangoData, setTangoData] = useState<TangoData | null>(null);

    //Context
    const { videoId } = useContext(VideoContext);

    //Hook
    const { response } = useAxiosGet<RES_GET_TANGO, REQ_GET_TANGO>('/db/tango', false, { tId : tId });
    const { handleToTango } = useMoveTo();

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            setTangoData(res.data);
        }
    }, [response])

    return(
        <>
        {
            tangoData &&
            <Card
                style={{ width : '100%' }}
                actions={[
                    <Button onClick={() => handleToTango(tId, videoId)}>{t('BUTTON.MOVE')}</Button>
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

export { Tango }