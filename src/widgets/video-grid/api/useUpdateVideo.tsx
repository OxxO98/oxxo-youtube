import { useEffect } from 'react';

//Hook
import { useAxiosPut } from 'shared/hooks/useAxios';

export function useUpdateVideo(
    refetch : () => void,
    setIsModalOpen : ( isOpen : boolean ) => void
){
    //Hook
    const { response, setParams } = useAxiosPut<null, REQ_PUT_VIDEO>('/db/video', true, null);

    const editVideo = ( data : RES_VIDEO, input : string, tags : string[], disabled : boolean ) => {
        if(input === '') return;

        setParams({ videoId : data.src, newTitle : input, newTagsQuery : tags.join('@'), disabled : Number(disabled) });
    }

    useEffect( () => {
        let res = response
        if( res !== null){
            refetch();
            setIsModalOpen(false);
        }
    }, [response, refetch])

    return { editVideo }
}