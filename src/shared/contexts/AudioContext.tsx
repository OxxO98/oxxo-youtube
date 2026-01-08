import { createContext } from 'react'

export const AudioContext = createContext<AudioDataContext>({
    audioData : null,
    audioLoaded : false,
    audioError : false,
})
