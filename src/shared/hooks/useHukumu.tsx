import { useCallback, useEffect } from 'react';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

import { useDebounceEffect } from 'shared/hooks/useDebounceEffect';

//Redux
import { useAppSelector, useAppDispatch, selectionActions } from 'shared/store';
const { setHukumuData, setStyled, setHukumuChecking, setHukumuCheckDone } = selectionActions;

const FETCH_HUKUMU_CHECK_DELAY = 100;

/**
 * 서버에서 해당 selection범위에 hukumu가 있는지 체크하는 함수
 * 여러개가 포함된 경우 맨 처음만 반환
 * 
 * @param deselect useSelection의 해제 함수
 * @returns 
 */
function useHukumu( deselect : () => void ){
    //Context

    //Redux
    const { selectedBun, textOffset } = useAppSelector( (_state) => _state.selection );
    const { refetchLoading } = useAppSelector( (_state) => _state.refetch );

    const dispatch = useAppDispatch(); 

    //Hook
    const { response, setParams } = useAxiosGet<RES_GET_HUKUMU_CHECK, REQ_GET_HUKUMU_CHECK>('/db/hukumu/check', true, null);

    /**
     * hukumu체크 refetch
     */
    const fetchInHR = useCallback( () => {
        if( selectedBun !== null && selectedBun !== undefined && selectedBun !== '' && textOffset.startOffset - textOffset.endOffset !== 0 ){
            setParams({
                startOffset : textOffset.startOffset, endOffset : textOffset.endOffset, 
                jaBId : selectedBun
            });
            dispatch( setHukumuChecking() )
        }
    }, [selectedBun, textOffset.endOffset, textOffset.startOffset, setParams])

    useEffect( () => {
        let res = response;

        dispatch( setHukumuCheckDone() )

        if(res !== null){
            if(res.data.length !== 0){
                dispatch( setHukumuData(res.data[0]) );

                dispatch( setStyled({ 
                    bId : res.data[0].jaBId, 
                    startOffset : res.data[0].startOffset, endOffset : res.data[0].endOffset, 
                    opt : 'highlight' 
                }) );
            }
            else{
                dispatch( setHukumuData(null) );
            }
        }
    }, [response, selectedBun])

    useEffect( () => {
        if( refetchLoading === false ){
            fetchInHR();
        }
    }, [refetchLoading])

    useDebounceEffect( () => {
        if( selectedBun !== null && selectedBun !== undefined && selectedBun !== '' && textOffset.startOffset - textOffset.endOffset !== 0 ){
            setParams({
                startOffset : textOffset.startOffset, endOffset : textOffset.endOffset, 
                jaBId : selectedBun
            });
            dispatch( setHukumuChecking() )
        }
        else{
            deselect();
        }
    }, FETCH_HUKUMU_CHECK_DELAY, [selectedBun, textOffset.startOffset, textOffset.endOffset, setParams]);

    return { fetchInHR }
}

export { useHukumu }