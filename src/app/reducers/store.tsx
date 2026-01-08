import { configureStore } from '@reduxjs/toolkit'

import reactPlayerReducer from './reactPlayerReducer'
import selectionReducer from './selectionReducer'
import timelineReducer from './timelineReducer'

export const store = configureStore({
  reducer: {
    reactPlayer: reactPlayerReducer,
    selection : selectionReducer,
    timeline : timelineReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch