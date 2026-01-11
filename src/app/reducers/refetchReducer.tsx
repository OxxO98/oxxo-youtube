import { createSlice } from '@reduxjs/toolkit'

interface RefetchInitial {
    refetchLoading : boolean
}

const initialState : RefetchInitial = {
    refetchLoading : false
}

export const refetchSlice = createSlice({
    name : 'refetch',
    initialState,
    reducers : {
        setRefetchDone : (state) => {
            state.refetchLoading = false
        },
        setRefetchChecking : (state) => {
            state.refetchLoading = true;
        }
    }
})

export const refetchActions = refetchSlice.actions;
export default refetchSlice.reducer;