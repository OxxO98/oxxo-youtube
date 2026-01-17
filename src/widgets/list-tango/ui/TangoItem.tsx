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
    tangoData : TangoList;
}

const Tango = ({ tangoData } : TangoProps ) => {
    //i18n
    const { t } = useTranslation('Tango');

    //Context
    const { videoId } = useContext(VideoContext);

    //Hook
    const { handleToTango } = useMoveTo();

    return(
        <>
        {
            tangoData &&
            <Card
                style={{ width : '100%' }}
                actions={[
                    <Button onClick={() => handleToTango(tangoData.tId, videoId)}>{t('BUTTON.MOVE')}</Button>
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