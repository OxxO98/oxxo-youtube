import { useEffect } from 'react';

import { useAxiosDelete } from 'shared/hooks/useAxios';

export function useDeleteHukumu(
    handleRefetch : (opt? : string[]) => void,
    setIsModalOpen : ( isOpen : boolean ) => void
){
    const { response, setParams } = useAxiosDelete<null, REQ_DELETE_HUKUMU>('/db/hukumu', true, null);

    const handleDelete = (hukumuData : HukumuData | null, selectedBun : string) => {
        if(hukumuData === null){ return }

        setParams({
            jaBId : selectedBun,
            startOffset : hukumuData.startOffset, endOffset : hukumuData.endOffset,
            hyId : hukumuData.hyId
        })
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            handleRefetch();
            setIsModalOpen(false);
        }
    }, [response, handleRefetch])

    return { handleDelete }
}