import { useCallback, useEffect } from 'react';

//Hook
import { useAxiosGet } from 'hooks/AxiosHook';

import { useDebounceEffect } from 'hooks/OptimizationHook';

//Redux
import { useSelector } from 'react-redux';
import { store, RootState } from 'reducers/store';
import { selectionActions } from 'reducers/selectionReducer';
const { setHukumuData, setStyled, clear } = selectionActions;

const FETCH_HUKUMU_CHECK_DELAY = 300;

function useHukumu(){
    //Context

    //Redux
    const { selectedBun, textOffset } = useSelector( (_state : RootState) => _state.selection );

    //Hook
    const { response, setParams } = useAxiosGet<RES_GET_HUKUMU_CHECK, REQ_GET_HUKUMU_CHECK>('/db/hukumu/check', true, null);

    const fetchInHR = useCallback( () => {
        if(selectedBun !== null && selectedBun !== undefined && selectedBun !== '' ){
            setParams({
                startOffset : textOffset.startOffset, endOffset : textOffset.endOffset, 
                jaBId : selectedBun
            });
        }
    }, [selectedBun, setParams, textOffset.endOffset, textOffset.startOffset])

    useEffect( () => {
        let res = response;

        if(res !== null){
            if(res.data.length !== 0){
                store.dispatch( setHukumuData(res.data[0]) );

                store.dispatch( setStyled({ 
                    bId : selectedBun, 
                    startOffset : res.data[0].startOffset, endOffset : res.data[0].endOffset, 
                    opt : 'highlight' 
                }) );
            }
            else{
                store.dispatch( setHukumuData(null) );
                store.dispatch( setStyled(null) );
            }
        }
        else{
            store.dispatch( setHukumuData(null) );
            store.dispatch( setStyled(null) );
        }
    }, [response, selectedBun])

    useDebounceEffect( () => {
        if(selectedBun !== null && selectedBun !== undefined && selectedBun !== ''){
            if( textOffset.startOffset - textOffset.endOffset !== 0 ){
                setParams({
                    startOffset : textOffset.startOffset, endOffset : textOffset.endOffset, 
                    jaBId : selectedBun
                });
            }
            else{
                store.dispatch( clear() )
            }
        }
        else{
            store.dispatch( clear() )
        }
    }, FETCH_HUKUMU_CHECK_DELAY, [textOffset.startOffset, textOffset.endOffset, setParams, selectedBun]);

    return { fetchInHR }
}

export { useHukumu }