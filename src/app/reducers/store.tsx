import { configureStore } from '@reduxjs/toolkit'

import reactPlayerReducer from './reactPlayerReducer'
import selectionReducer from './selectionReducer'
import timelineReducer from './timelineReducer'
import refetchReducer from './refetchReducer'

export const store = configureStore({
  reducer: {
    reactPlayer: reactPlayerReducer,
    selection : selectionReducer,
    timeline : timelineReducer,
    refetch : refetchReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch