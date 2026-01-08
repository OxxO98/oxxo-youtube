import { useEffect, useState, RefObject } from 'react';

export function useYTBun( 
    response : ApiResponse<RES_GET_TRANSLATE_REP> | null,
    fetch : () => Promise<void>,
    bIdRef : RefObject<BIdRef>
){

    //State
    const [ytBun, setYtBun] = useState<YTBun | null>(null);

    useEffect( () => {
        let res = response;
        if(res !== null){
            if( res.message === 'empty'){
                setYtBun(null);
            }
            else{
                setYtBun(res.data);
        
                if( bIdRef !== null && res.data !== null){
                    bIdRef.current['bId'+res.data.jaBId] = {
                        ...bIdRef.current['bId'+res.data.jaBId],
                        fetchTL : fetch,
                        koText : res.data.koText
                    };
                }
            }
        }
    }, [response, bIdRef, fetch])

    return { ytBun }
}