import { useContext, useEffect, useState } from 'react';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

interface TangoBunProps {
    ytBId : ytBId;
}

export const TangoBun = ({ ytBId } : TangoBunProps) => {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [ytBun, setYtBun] = useState<YTBun | null>(null);

    //Hook
    const { response } = useAxiosGet<RES_GET_TRANSLATE_REP, REQ_GET_TRANSLATE_REP>('/db/translate/representive', false, { videoId : videoId, ytBId : ytBId } );

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            setYtBun(res.data);
        }
    }, [response])

    return(
        <p>
        {
            ytBun?.koText !== null &&
            <>{ytBun?.koText}</>
        }
        </p>
    )
}