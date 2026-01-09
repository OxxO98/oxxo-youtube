import { useCallback, useState } from 'react';

/**
 * 번역 컴포넌트에서 번역할 문장을 선택하기 위한 Hook
 * HonyakuComp, HonyakuRepresentive 두 컴포넌트 간에 번역되고 있는 문장정보를 공유하는 용도
 * 
 * @returns 
 */
function useSelectEdit(){
    const [edit, setEdit] = useState(false);

    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = useCallback( (selectId : string) => {
        setSelected(selectId);
        setEdit(true);
    }, [])

    const clearEdit = useCallback( () => {
        setSelected(null);
        setEdit(false);
    }, [])

    return { edit, selected, handleSelect, clearEdit };
}


export { useSelectEdit }