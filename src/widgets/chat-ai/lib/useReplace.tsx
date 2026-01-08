import { useCallback, RefObject, useEffect } from 'react';

export function useReplace(
    hukumuData : HukumuData | null, 
    selectedBun : string, 
    value : string,
    setValue : React.Dispatch<React.SetStateAction<string>>,
    bIdRef : RefObject<BIdRef>
){
    const replaceTango = useCallback( () => {
        if( hukumuData !== null ){
            setValue( (prev) => (
                prev.replaceAll('/단어/', `「${hukumuData.hyouki}」`)
            ) );
        }
    }, [hukumuData])

    const replaceBun = useCallback( () => {
        if( bIdRef !== null && bIdRef.current['bId'+selectedBun] !== undefined ){
            let jaText = bIdRef.current['bId'+selectedBun].jaText;
            setValue( (prev) => ( 
                prev.replaceAll('/문장/', `「${jaText}」`) 
            ) );

            let koText = bIdRef.current['bId'+selectedBun].koText;
            if(koText !== undefined ){
                setValue( (prev) => ( 
                    prev.replaceAll('/번역/', `"${koText}"`) 
                ) );
            }
        }
    }, [bIdRef, selectedBun])

    useEffect( () => {
        replaceTango();
        replaceBun();
    }, [value, replaceTango, replaceBun])

    return { replaceTango, replaceBun };
}