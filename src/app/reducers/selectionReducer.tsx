import { createSlice } from '@reduxjs/toolkit'

interface SelctionInitial {
    selection : string;
    hurigana : string;
    offset : OffsetObj | null;
    selectedBun : string;
    textOffset : OffsetObj;
    hukumuData : HukumuData | null;
    styled : StyledObj | null;
    hukumuCheckLoading : boolean;
}

const initialState : SelctionInitial = {
    selection : '',
    hurigana : '',
    offset : null,
    selectedBun : '',
    textOffset : { startOffset : 0, endOffset : 0 },
    hukumuData : null,
    styled : null,
    hukumuCheckLoading : false,
} 

export const selectionSlice = createSlice({
    name : 'selection', 
    initialState,
    reducers : {
        setSelection : (state, action) => {
            state.selection = action.payload;
        },
        setHurigana : (state, action) => {
            state.hurigana = action.payload;
        },
        setOffset : (state, action) => {
            state.offset = action.payload;
        },
        setSelectedBun : (state, action) => {
            state.selectedBun = action.payload;
        },
        setTextOffset : (state, action) => {
            state.textOffset = action.payload;
        },
        setHukumuData : (state, action) => {
            state.hukumuData = action.payload;
        },
        setStyled : (state, action) => {
            state.styled = action.payload;
        },
        clear : (state) => {
            state.selection = '';
            state.hurigana = '';
            state.offset = null;
            state.selectedBun = '';
            state.textOffset = { startOffset : 0, endOffset : 0 };
            state.hukumuData = null;
            state.styled = null;
            state.hukumuCheckLoading = false;
        },
        setHukumuCheckDone : (state) => {
            state.hukumuCheckLoading = false;
        },
        setHukumuChecking : (state) => {
            state.hukumuCheckLoading = true;
        }
    }
})

export const selectionActions = selectionSlice.actions
export default selectionSlice.reducer;