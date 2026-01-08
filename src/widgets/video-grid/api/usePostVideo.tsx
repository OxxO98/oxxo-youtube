import { useEffect } from 'react';

//Hook
import { useAxiosPost } from 'shared/hooks/useAxios';

export function usePostVideo(
    refetch : () => void,
    setIsModalOpen : ( isOpen : boolean ) => void,
    resetEdit : () => void
){
    const { response, setParams } = useAxiosPost<null, REQ_POST_VIDEO>('/db/video', true, null);

    const postVideo = ( inputs : { youtubeSrc : string, title : string } ) => {
        if( inputs.title === '' || inputs.title === null || inputs.title === undefined ){ return }
        if( inputs.youtubeSrc === '' || inputs.youtubeSrc === null || inputs.youtubeSrc === undefined ){ return }

        setParams(inputs);
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            setIsModalOpen(false);
            refetch();
            resetEdit();
        }
    }, [response, refetch])

    return { postVideo }
}