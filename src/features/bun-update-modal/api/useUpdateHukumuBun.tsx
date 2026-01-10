import { useEffect } from 'react';

import { useAxiosPut } from 'shared/hooks/useAxios';

import { useJaText } from 'shared/lib/useJaText';
import { useHuri } from 'shared/lib/useHuri';

export function useUpdateHukumuBun(
    ytb : RES_TIMELINE,
    setIsModalOpen : ( isOpen : boolean ) => void,
    refetchHandles : RefetchHandles,
    refetchTimeline : () => void,
    cancelEdit : () => void,
){
    const { response, setParams } = useAxiosPut<null, REQ_PUT_HUKUMU_BUN>('/db/hukumu/bun', true, null );

    const { convertObjKey, getHyoukiQuery, getYomiQuery } = useJaText()
    const { complexArr } = useHuri();


    const modifyBun = (
        modifiedList : tracedHukumu[] | null,
        deletedList : tracedHukumu[] | null,
        hukumuData : HukumuData[] | null,
        newJaText : string
    ) => {
        if( newJaText === '' ){ return }
        if( modifiedList === null || deletedList === null || hukumuData === null ){ 
            return;
        }

        let _modifiedList = modifiedList
            .map( (v) => {
                let textData = complexArr(v.find!.str, v.yomi, 0);
                let multiInputData = textData.map( (t) => {
                    return {
                        data : t.data,
                        inputBool : !(t.ruby === null || t.ruby === undefined)
                    }
                })
                let multiValue = textData.map( (t) => {
                    return t.ruby ?? ''
                })

                return {
                    ...v,
                    find : {
                        ...v.find,
                        hyouki : getHyoukiQuery(multiInputData),
                        yomi : getYomiQuery(multiInputData, multiValue)
                    }
                }
            });

        let modifiedObj = convertObjKey(_modifiedList);
        let deletedObj = convertObjKey(deletedList);

        setParams({ jaBId : ytb.jaBId, jaText : newJaText, modifiedObj : modifiedObj, deletedObj : deletedObj })
    }

    useEffect( () => {
        if( response !== null ){
            refetchHandles.refetch(ytb.jaBId)
            refetchTimeline();
            cancelEdit();
            setIsModalOpen(false);
        }
    }, [response, refetchTimeline, cancelEdit, refetchHandles, ytb.jaBId])

    return { modifyBun }
}