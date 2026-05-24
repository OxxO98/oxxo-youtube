import { useState, useEffect } from "react";

//Hook
import { useJaText } from 'shared/lib/useJaText';
import { useAxiosGet } from 'shared/hooks/useAxios';

interface DBReadingProps {
    data : db_hukumu_data | db_text_data
}

export const DBReading = ({ data } : DBReadingProps ) => {
    const [reading, setReading] = useState(data.reading);

    const { convertKoReading } = useJaText();

    const { response } = useAxiosGet<RES_GET_DB_READING, REQ_GET_DB_READING>('/db/reading', false, { jaText : data.jaText });

    useEffect( () => {
        let res = response;
        if( res !== null ){
            let hurigana = data.jaTextData.map( (td : TextData) => td.ruby ?? '　' ).join('').trim()

            let _reading = hurigana !== '' ? convertKoReading(res.data, hurigana, data.jaText) : '';
            
            setReading(_reading);
        }
    }, [response])

    return(
        <div>{reading}</div>
    )
}