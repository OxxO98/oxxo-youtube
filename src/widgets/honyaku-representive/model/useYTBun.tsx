import { useEffect, useState, RefObject } from 'react';

export function useYTBun( 
    ytBId : string,
    response : ApiResponse<RES_GET_TRANSLATE> | null,
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
                setYtBun({
                    ytBId : ytBId,
                    jaBId : res.data.jaBun?.jaBId ?? null,
                    jaText : res.data.jaBun?.jaText ?? '',
                    koBId : res.data.koBun?.koBId ?? null,
                    koText : res.data.koBun?.koText ?? ''
                });
        
                if( bIdRef !== null && res.data !== null && res.data.jaBun !== null ){
                    bIdRef.current['bId'+res.data.jaBun.jaBId] = {
                        ...bIdRef.current['bId'+res.data.jaBun.jaBId],
                        fetchTL : fetch,
                        koText : res.data.koBun?.koText ?? ''
                    };
                }
            }
        }
    }, [response, bIdRef, fetch])

    return { ytBun }
}