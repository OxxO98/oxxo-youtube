import { useEffect } from 'react';

import { useAxiosPut } from 'shared/hooks/useAxios'
import { useJaText } from 'shared/lib/useJaText';

export function useUpdateHukumu(
    handleRefetch : (opt? : string ) => void,
    setIsModalOpen : ( isOpen : boolean ) => void,
    multiInputData : MultiInput[],
    multiValue : string[]
){
    const {response, setParams } = useAxiosPut<null, REQ_PUT_HUKUMU>('/db/hukumu', true, null);

    //Hook
    const { getHyoukiQuery, getYomiQuery } = useJaText();

    const handleUpdate = ( hukumuData : HukumuData | null, selectedBun : string, newYomi : string ) => {
        if(hukumuData === null){ return }
        
        let _hyouki = getHyoukiQuery(multiInputData);
        let _yomi = getYomiQuery(multiInputData, multiValue);

        setParams({
            jaBId : selectedBun,
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
            hyId : hukumuData.hyId, 
            hyouki : _hyouki, yomi : _yomi,
            hyoukiStr : hukumuData.hyouki, yomiStr : newYomi
        })
    }

    useEffect( () => {
        if(response !== null){
            handleRefetch();
            setIsModalOpen(false);
        }
    }, [response, handleRefetch])

    return { handleUpdate }
}