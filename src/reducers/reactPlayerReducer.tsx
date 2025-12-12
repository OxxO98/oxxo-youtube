import { createSlice } from '@reduxjs/toolkit'

interface initialStateInterface {
  startTime : number | null;
  endTime : number | null;
  selectMarker : string | null;
  markerTime : number | null;
}

const initialState : initialStateInterface = {
  startTime : null,
  endTime : null,
  selectMarker : null,
  markerTime : null,
} 

export const reactPlayerSlice = createSlice({
  name : 'reactPlayer', 
  initialState,
  reducers : {
    setStartTime : (state, action) => {
      state.startTime = action.payload
    },
    setEndTime : (state, action) => {
      state.endTime = action.payload
    },
    selectMarkerStart : (state) => {
      state.selectMarker = 'startTime'
    },
    selectMarkerEnd : (state) => {
      state.selectMarker = 'endTime'
    },
    unselectMarker : (state) => {
      state.selectMarker = null
    },
    setMarkerTime : (state, action) => {
      state.markerTime = action.payload;
    },
  }
})

export const reactPlayerActions = reactPlayerSlice.actions
export default reactPlayerSlice.reducer;