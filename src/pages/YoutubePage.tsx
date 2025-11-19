import { Routes, Route, useParams } from "react-router-dom";

//Component
import { LayoutComp } from 'components/LayoutComp';

import { VideoComp } from 'components/VideoComp';
import { TimelineComp } from 'components/TimelineComp';
import { TimelineCarouselComp } from 'components/TimelineCarouselComp';
import { DictionaryComp } from 'components/DictionaryComp';
import { ImiComp } from 'components/ImiComp';
import { TangoComp } from 'components/TangoComp';

import { CompoundListComp } from 'components/CompoundListComp';

import { TangochouComp } from 'components/TangochouComp';

import { AiComp } from 'components/AiComp';

//Hook
import { useAudioDecode } from 'hooks/AudioDecodeHook';
import { useReactPlayerHook } from 'hooks/ReactPlayerHook';

import { useHandleSelection } from 'hooks/SelectionHook'
import { useHukumu } from 'hooks/HukumuHook'
import { useBunRefetch } from 'hooks/BunRefetchHook'

import { useHukumuList } from 'hooks/HukumuListHook';
import { useOsusumeList } from 'hooks/OsusumeListHook';
import { useTangoList } from 'hooks/TangoListHook';

import { useVideoPlayHook } from 'hooks/VideoPlayHook';

//Context
import { AudioContext } from 'contexts/AudioContext';
import { VideoContext } from 'contexts/VideoContext';
import { FilteredDataContext } from 'contexts/FilteredDataContext';

//CSS@Antd
import { Splitter } from 'antd';

const SplitterStyle = {
    height: '100%', 
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
}

const YoutubePage = () => {
    //State
    const { videoId : VIDEO_ID } = useParams(); //undefined일 경우 처리 추가 바람.

    //Hook
    const { frameRate, state, playerRef, setPlayerRef, playerHandles } = useReactPlayerHook(VIDEO_ID!);
    const { audioData, audioLoaded, audioError, filteredData } = useAudioDecode(VIDEO_ID!, frameRate);
    
    const { playing } = state;
    const { handlePausePlay, handleSeek } = playerHandles;

    const { videoPlayerHandles } = useVideoPlayHook( playing, handlePausePlay, state, handleSeek );
    
    useHandleSelection( document, "activeRange" );
    const { fetchInHR } = useHukumu();

    const { bIdRef, refetchHandles } = useBunRefetch( fetchInHR );

    const { hukumuList, fetch : refetchHukumuList } = useHukumuList(VIDEO_ID!);
    const { osusumeList, fetch : refetchOsusumeList } = useOsusumeList();
    const { tangoList, fetch : refetchTangoList } = useTangoList(VIDEO_ID!);
    
    return(
        <>
            <AudioContext.Provider value={{audioData : audioData, audioLoaded : audioLoaded, audioError : audioError}}>
                <FilteredDataContext.Provider value={filteredData}>
                    <VideoContext.Provider value={{ videoId : VIDEO_ID!, frameRate : frameRate }}>
                        <LayoutComp.Youtube>
                            <Splitter style={{ height: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                                <Splitter.Panel defaultSize="50%" min="30%" max="50%">                            
                                    <Routes>
                                        <Route path="/*" element={<VideoComp playerRef={playerRef} setPlayerRef={setPlayerRef} state={state} playerHandles={playerHandles} videoPlayerHandles={videoPlayerHandles}/>}/>
                                    </Routes>
                                    <Routes>
                                        <Route path="/timeline" element={<TimelineCarouselComp state={state} playerHandles={playerHandles} bIdRef={bIdRef} refetchHandles={refetchHandles} videoPlayerHandles={videoPlayerHandles}/>}/>
                                        <Route path="/honyaku" element={<TimelineCarouselComp.Honyaku state={state} playerHandles={playerHandles} bIdRef={bIdRef} refetchHandles={refetchHandles} videoPlayerHandles={videoPlayerHandles}/>}/>
                                        <Route path="/tangochou/*" element={<TimelineCarouselComp.Honyaku state={state} playerHandles={playerHandles} bIdRef={bIdRef} refetchHandles={refetchHandles} videoPlayerHandles={videoPlayerHandles}/>}/>
                                    </Routes>
                                </Splitter.Panel>
                                <Splitter.Panel>
                                    <Routes>
                                        <Route path="/" element={
                                            <TimelineComp state={state} bIdRef={bIdRef} refetchHandles={refetchHandles} videoPlayerHandles={videoPlayerHandles}/>
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
                                                        <Splitter.Panel collapsible defaultSize="50%" min="30%">
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

                        </LayoutComp.Youtube>
                    </VideoContext.Provider>
                </FilteredDataContext.Provider>
            </AudioContext.Provider>
        </>
        
    )
}

export { YoutubePage }