import { createSlice } from '@reduxjs/toolkit'

interface TimelineInitial {
    bunIds : RES_TIMELINE[] | null,
    currentBunId : number,
    refetchKey : number,
    timelineLoading : boolean,
}

const initialState : TimelineInitial = {
    bunIds : null,
    currentBunId : 0,
    refetchKey : 0,
    timelineLoading : true,
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
        requestTimelineRefetch : (state) => {
            state.refetchKey += 1;
        },
        setLoading : (state, action) => {
            state.timelineLoading = action.payload;
        },
        clear : (state) => {
            state.bunIds = null;
            state.currentBunId = 0;
            state.refetchKey = 0;
        }
    }
})

export const timelineActions = timelineSlice.actions;
export default timelineSlice.reducer;