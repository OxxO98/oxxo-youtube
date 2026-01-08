import { useEffect } from 'react';

//Hook
import { useAxiosDelete } from 'shared/hooks/useAxios';

export function useDeleteVideo(
    refetch : () => void,
    setIsModalOpen : ( isOpen : boolean ) => void
){
    const { response, setParams } = useAxiosDelete<null, REQ_DELETE_VIDEO>('/db/video', true, null);

    const deleteVideo = (videoId : string) => {
        setParams({ videoId : videoId });
    }

    useEffect( () => {
        let res = response;
        if( res !== null ){
            refetch();
            setIsModalOpen(false);
        }
    }, [response, refetch])

    return { deleteVideo }
}