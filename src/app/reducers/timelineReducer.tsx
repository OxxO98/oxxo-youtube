import { createSlice } from '@reduxjs/toolkit'

interface TimelineInitial {
    bunIds : RES_GET_TIMELINE | null,
    currentBunId : number,
}

const initialState : TimelineInitial = {
    bunIds : null,
    currentBunId : 0,
}

export const timelineSlice = createSlice({
    name : 'timeline',
    initialState,
    reducers : {
        setBunIds : (state, action) => {
            state.bunIds = action.payload;
        },
        setCurrentBunId : (state, action) => {
            state.currentBunId = action.payload;
        },
        setCurrentBunIdNext : (state) => {
            state.currentBunId++;
        },
        setCurrentBunIdPrev : (state) => {
            state.currentBunId--;
        },
        clear : (state) => {
            state.bunIds = null;
            state.currentBunId = 0;
        }
    }
})

export const timelineActions = timelineSlice.actions;
export default timelineSlice.reducer;