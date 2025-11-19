import React from 'react';

//Components
import ReactPlayer from 'react-player';

import { AudioWaveComp } from './AudioWaveComp';


interface VideoCompProps {
    playerRef : React.RefObject<HTMLVideoElement | null>;
    setPlayerRef : ( player : HTMLVideoElement ) => void;
    state : ReactPlayerState;
    playerHandles : PlayerHandles;
    videoPlayerHandles : VideoPlayerHandles;
}

const VideoComp = ({ playerRef, setPlayerRef, state, playerHandles, videoPlayerHandles } : VideoCompProps ) => {   

    //State
    const { handlePausePlay, handlePlay, handlePause, handleDurationChange } = playerHandles;

    const {
        src,
        pip,
        playing,
        volume,
        muted,
        playedSeconds,
    } = state;

    //Hook
    const { gotoTime, autoStop } = videoPlayerHandles;

    return (
        <div>
            <ReactPlayer
                ref={setPlayerRef}
                style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
                src={src}
                pip={pip}
                playing={playing}
                onPlay={handlePlay}
                onPause={handlePause}
                onDurationChange={handleDurationChange}
                controls={false}
                loop={true}
                volume={volume}
                muted={muted}
                playsInline={true}
            />
            {
                playerRef.current &&
                <AudioWaveComp videoTime={playedSeconds} gotoTime={gotoTime} autoStop={autoStop} playing={playing} handlePausePlay={handlePausePlay}/>
            }
        </div>
    )
}

export { VideoComp }