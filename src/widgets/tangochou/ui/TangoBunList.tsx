import { useContext, useEffect, useState } from 'react';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//ui
import { TangoBun } from './TangoBun';

interface TangoBunListProps {
    hyId : hyId;
}

export const TangoBunList = ({ hyId } : TangoBunListProps )=> {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [list, setList] = useState<Array<TangoBunData>>();

    //Hook
    const { response, setParams } = useAxiosGet<RES_GET_TANGOCHOU_TANGO_LIST, REQ_GET_TANGOCHOU_TANGO_LIST>('/db/tangochou/tango/list', false, { videoId : videoId, hyId : hyId } );

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            setList(res.data);
        }
    }, [response]);

    useEffect( () => {
        if(hyId !== null){
            setParams({ videoId : videoId, hyId : hyId })
        }
    }, [hyId, setParams, videoId])

    return(
        <>
            {
                list !== undefined &&
                list.map( (v, i) => 
                    <div key={`B${v.jaBId}_T${v.tId}_${i}`}>
                        <p>
                            {v.jaText.substring(0, v.startOffset)}
                        <span className="bold highlight">
                            {v.jaText.substring(v.startOffset, v.endOffset)}
                        </span>
                            {v.jaText.substring(v.endOffset)}
                        </p>
                        <TangoBun ytBId={v.ytBId}/>
                    </div>
                )
            }
        </>
    )
}
