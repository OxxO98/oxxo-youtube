import { useAxiosPost } from 'shared/hooks/useAxios';

export const useCommit = () => {
    const { response, loading, setParams } = useAxiosPost<RES_POST_LIST_HUKUMU, REQ_POST_LIST_COMMIT>('/db/list/commit', true, null);

    //Handle
    const commit = ( hukumu : HukumuList, hukumuData : HukumuData | null ) => {
        if( hukumuData === null){ return }

        setParams({
            jaBId : hukumu.jaBId, startOffset : hukumu.startOffset, endOffset : hukumu.endOffset,
            tId : hukumuData.tId, hyId : hukumuData.hyId
        });
    }
    return { response, loading, commit };
}

export default useCommit;
