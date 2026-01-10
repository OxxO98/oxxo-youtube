import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

//Hooks
import { useAxiosGet } from 'shared/hooks/useAxios';

//entities
import { ComplexText } from 'entities/ComplexText/index'

//Css@antD
import { Button } from 'antd';

interface TangoDBProps {
    data : RES_SEARCH_TANGO;
    handleSubmit : (tId : string | null) => void;
}

export const TangoDB = ({ data, handleSubmit } : TangoDBProps ) => {

    const { t } = useTranslation('TangoDB');

    const [tangoData, setTangoData] = useState<TangoData | null>(null);

    const { response } = useAxiosGet<RES_GET_TANGO, REQ_GET_TANGO>('/db/tango', false, { tId : data.tId });

    useEffect( () => {
        let res = response;
        if(res !== null){
            setTangoData(res.data);
        }
    }, [response])

    return(
        <>
            <div>
            {
                tangoData !== null &&
                <>
                {
                    tangoData.list !== null &&
                    tangoData.list.map( (arr) =>
                        <>
                            <ComplexText bId={null} data={arr.hyouki} ruby={arr.yomi} offset={0}/>　 
                        </> 
                    )
                }
                {
                    tangoData.imi !== null &&
                    tangoData.imi.map( (arr) => 
                        <>
                            <span> : {arr}</span>
                        </> 
                    )
                }
                {
                    tangoData.imi === null &&
                    <span> : {t('CONTENTS.EMPTY')}</span>
                }
                </>
            }
            </div>
            <div>
                <Button onClick={() => { handleSubmit(data.tId) }}>{t('BUTTON.DONE')}</Button>
            </div>
        </>
    )
}