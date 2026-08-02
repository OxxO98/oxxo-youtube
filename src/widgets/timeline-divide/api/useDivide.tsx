import { useEffect } from 'react';

//Hook
import { useAxiosPut } from 'shared/hooks/useAxios';

//Redux
import { useAppDispatch, timelineActions } from 'shared/store';
const { requestTimelineRefetch } = timelineActions;

type inputs = { jaText : string, koText : string }

export function useDivide(
    videoId : string,
    refetchHandles : RefetchHandles,
    cancelEdit : () => void
){
    const dispatch = useAppDispatch();

    const { response, setParams } = useAxiosPut<null, REQ_PUT_BUNKATSU>('/db/bun/bunkatsu', true, null);

    //Handle
    const bunkatsuBun = (
        inputs : inputs,
        ytb : RES_TIMELINE,
        critTime : number,
    ) => {
        let _splitedJaText = inputs.jaText.split('/');
        let _splitedKoText = inputs.koText.split('/');
        
        if( _splitedJaText.join('') !== ytb.jaText || _splitedJaText.length !== 2 ){ return }
        if( ( ytb.koBId !== null && _splitedKoText.join('') !== ytb.koText ) || _splitedKoText.length !== 2 ){ return }

        let _critJaText = _splitedJaText[0].length;
        let _critKoText = _splitedKoText[0].length;

        setParams({ videoId : videoId, ytBId : ytb.ytBId, critTime : critTime, critJaText : _critJaText, critKoText : _critKoText  });
    }

    
    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            dispatch( requestTimelineRefetch() );

            refetchHandles.refetchAll();
            cancelEdit();
        }
    }, [response, refetchHandles, cancelEdit])

    return { bunkatsuBun }
}