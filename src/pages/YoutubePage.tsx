import { Routes, Route, useParams } from "react-router-dom";

//widgets
import { LayoutCompYoutube } from 'widgets/layout-youtube/index';

import { VideoComp } from 'widgets/video/index';
import { TimelineComp } from 'widgets/timeline/index';
import { TimelineCarouselComp } from 'widgets/timeline-carousel/index';
import { TimelineCarouselHonyakuComp } from 'widgets/timeline-carousel-honyaku/index';
import { DictionaryComp } from 'widgets/dictionary/index';
import { ImiComp } from 'widgets/imi/index';
import { TangoComp } from 'widgets/tango/index';

import { CompoundListComp } from 'widgets/list-compound/index';

import { TangochouComp } from 'widgets/tangochou/index';

import { AiComp } from 'widgets/chat-ai/index';

//Hook
import { useAudioDecode } from 'shared/hooks/useAudioDecode';
import { useReactPlayerHook } from 'shared/hooks/useReactPlayer';

import { useHandleSelection } from 'shared/hooks/useHandleSelection'
import { useHukumu } from 'shared/hooks/useHukumu'
import { useBunRefetch } from 'shared/hooks/useBunRefetch'

import { useHukumuList } from 'shared/hooks/useHukumuList';
import { useOsusumeList } from 'shared/hooks/useOsusumeList';
import { useTangoList } from 'shared/hooks/useTangoList';

import { useVideoPlayHook } from 'shared/hooks/useVideoPlay';

import { useTimeline } from 'shared/hooks/useTimeline';

//Redux
import { useAppDispatch, reactPlayerActions, timelineActions, selectionActions } from "shared/store";

//Context
import { AudioContext } from 'shared/contexts/AudioContext';
import { VideoContext } from 'shared/contexts/VideoContext';
import { FilteredDataContext } from 'shared/contexts/FilteredDataContext';

//CSS@Antd
import { Splitter } from 'antd';
import { useEffect } from "react";

const { clear : clearReactPlayer } = reactPlayerActions;
const { clear : clearTimeline } = timelineActions;
const { clear : clearSelection } = selectionActions;

const SplitterStyle = {
    height: '100%', 
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
}

const YoutubePage = () => {
    //State
    const { videoId : VIDEO_ID } = useParams();

    //Hook
    const { frameRate, state, playerRef, setPlayerRef, playerHandles } = useReactPlayerHook(VIDEO_ID!);
    const { audioData, audioLoaded, audioError, filteredData } = useAudioDecode(VIDEO_ID!, frameRate);
    
    const { playing } = state;
    const { handlePausePlay, handleSeek } = playerHandles;

    const { videoPlayerHandles } = useVideoPlayHook( playing, handlePausePlay, state, handleSeek, filteredData );
    
    const { timelineHandles } = useTimeline(VIDEO_ID!);
    
    const { deselect } = useHandleSelection( document, "activeRange" );
    useHukumu(deselect);

    const { bIdRef, refetchHandles } = useBunRefetch();

    const { hukumuList, fetch : refetchHukumuList } = useHukumuList(VIDEO_ID!);
    const { osusumeList, fetch : refetchOsusumeList } = useOsusumeList();
    const { tangoList, fetch : refetchTangoList } = useTangoList(VIDEO_ID!);

    const dispatch = useAppDispatch();

    useEffect( () => {
        dispatch( clearReactPlayer() )
        dispatch( clearTimeline() )
        dispatch( clearSelection() )
    }, [])
    
    return(
        <>
            <AudioContext.Provider value={{audioData : audioData, audioLoaded : audioLoaded, audioError : audioError}}>
                <FilteredDataContext.Provider value={filteredData}>
                    <VideoContext.Provider value={{ videoId : VIDEO_ID!, frameRate : frameRate }}>
                        <LayoutCompYoutube>
                            <Splitter style={{ height: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                                <Splitter.Panel defaultSize="50%" min="30%" max="50%">                            
                                    <Routes>
                                        <Route path="/*" element={<VideoComp playerRef={playerRef} setPlayerRef={setPlayerRef} state={state} playerHandles={playerHandles} videoPlayerHandles={videoPlayerHandles}/>}/>
                                    </Routes>
                                    <Routes>
                                        <Route path="/timeline" element={<TimelineCarouselComp state={state} bIdRef={bIdRef} timelineHandles={timelineHandles} refetchHandles={refetchHandles} videoPlayerHandles={videoPlayerHandles} deselect={deselect}/>}/>
                                        <Route path="/honyaku" element={<TimelineCarouselHonyakuComp state={state} bIdRef={bIdRef} videoPlayerHandles={videoPlayerHandles} deselect={deselect}/>}/>
                                        <Route path="/tangochou/*" element={<TimelineCarouselHonyakuComp state={state} bIdRef={bIdRef} videoPlayerHandles={videoPlayerHandles} deselect={deselect}/>}/>
                                    </Routes>
                                </Splitter.Panel>
                                <Splitter.Panel>
                                    <Routes>
                                        <Route path="/" element={
                                            <TimelineComp state={state} bIdRef={bIdRef} timelineHandles={timelineHandles} refetchHandles={refetchHandles} videoPlayerHandles={videoPlayerHandles}/>
                                        }/>
                                        <Route path="/timeline" element={
                                            <Splitter layout="vertical" style={SplitterStyle}>
                                                <Splitter.Panel defaultSize="16%" min="16%" max="30%">
                                                    <TangoComp refetchHandles={refetchHandles} refetchTangoList={refetchTangoList}/>
                                                </Splitter.Panel>
                                                <Splitter.Panel>
                                                    <Splitter style={SplitterStyle}>
                                                        <Splitter.Panel collapsible defaultSize="50%" min="30%">
                                                            <CompoundListComp
                                                                hukumuList={hukumuList} osusumeList={osusumeList} tangoList={tangoList}
                                                                refetchHukumuList={refetchHukumuList} refetchOsusumeList={refetchOsusumeList} refetchTangoList={refetchTangoList}
                                                                refetchHandles={refetchHandles}
                                                            />
                                                        </Splitter.Panel>
                                                        <Splitter.Panel  collapsible defaultSize="50%" min="30%">
                                                            <DictionaryComp/>
                                                        </Splitter.Panel>
                                                    </Splitter>
                                                </Splitter.Panel>
                                            </Splitter>}/>
                                        <Route path="/honyaku" element={
                                            <Splitter layout="vertical" style={SplitterStyle}>
                                                <Splitter.Panel defaultSize="16%" min="16%" max="30%">
                                                    <ImiComp/>
                                                </Splitter.Panel>
                                                <Splitter.Panel>
                                                    <Splitter style={SplitterStyle}>
                                                        <Splitter.Panel collapsible defaultSize="50%" min="0%">
                                                            <AiComp bIdRef={bIdRef}/>
                                                        </Splitter.Panel>
                                                        <Splitter.Panel collapsible defaultSize="50%" min="30%">
                                                            <DictionaryComp/>
                                                        </Splitter.Panel>
                                                    </Splitter>
                                                </Splitter.Panel>
                                            </Splitter>}/>
                                        <Route path="/tangochou/*" element={<TangochouComp/>}/>
                                    </Routes>
                                </Splitter.Panel>
                            </Splitter>
                        </LayoutCompYoutube>
                    </VideoContext.Provider>
                </FilteredDataContext.Provider>
            </AudioContext.Provider>
        </>
        
    )
}

export { YoutubePage }