import { useEffect } from 'react'

//Hooks
import { useAxiosPost } from 'shared/hooks/useAxios';
import { useJaText } from 'shared/lib/useJaText';

export const usePostNewTango = (
    handleRefetch : () => void
) => {
    const { getHyoukiQuery, getYomiQuery } = useJaText();

    const { response, setParams : setParamsNewTango } = useAxiosPost<null, REQ_POST_HUKUMU>('/db/hukumu', true, null);

    const postNewTango = (multiInputData : MultiInput[], multiValue : string[], textOffset : OffsetObj, selectedBun : string, hyouki : string, yomi : string, tId : string | null) => {
        let _hyouki = getHyoukiQuery(multiInputData);
        let _yomi = getYomiQuery(multiInputData, multiValue);

        if(tId === null){
            setParamsNewTango({
                jaBId : selectedBun, 
                startOffset : textOffset.startOffset, endOffset : textOffset.endOffset,
                hyoukiStr : hyouki, yomiStr : yomi,
                hyouki : _hyouki, yomi : _yomi
            })
        }
        else{
            setParamsNewTango({
                jaBId : selectedBun, 
                startOffset : textOffset.startOffset, endOffset : textOffset.endOffset,
                hyoukiStr : hyouki, yomiStr : yomi,
                hyouki : _hyouki, yomi : _yomi, tId : tId
            });
        }
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            handleRefetch();
        }
    }, [response, handleRefetch])

    return { postNewTango }
}