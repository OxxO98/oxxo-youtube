import { useAxiosPost } from 'shared/hooks/useAxios';

export const useCommit = () => {
    const { response, setParams } = useAxiosPost<null, REQ_POST_LIST_COMMIT>('/db/list/commit', true, null);
    
    const commit = (selectedBun : string, textOffset : OffsetObj, osusume : OsusumeList ) => {
        setParams( {
            jaBId : selectedBun, startOffset : textOffset.startOffset, endOffset : textOffset.endOffset,
            tId : osusume.tId, hyId : osusume.hyId
        });
    }
    
    return { response, commit };
}

export default useCommit;
