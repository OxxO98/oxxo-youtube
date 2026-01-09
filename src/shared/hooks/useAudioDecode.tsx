import { useContext, useEffect, useState, useCallback } from 'react';

import { ServerContext } from 'shared/contexts/ServerContext';

import axios from 'axios';

/**
 * React 훅: 비디오의 오디오를 서버에서 가져와 디코딩하고 처리합니다.
 * 
 * YouTube 비디오 ID를 받아 오디오 스트림을 가져온 후,
 * 웹 오디오 API로 디코딩하고 지정된 프레임레이트로 정규화된 오디오 데이터를 반환합니다.
 * 
 * @param videoId - 처리할 비디오의 ID
 * @param rameRate - 오디오 데이터의 프레임레이트 (초당 샘플 수)
 * @returns audioData - 디코딩된 오디오 데이터
 * @returns audioLoaded - 오디오 로드 완료 여부
 * @returns audioError - 오디오 로드 중 오류 여부
 * @returns filteredData - 정규화된 오디오 데이터 (좌/우 채널)
 */
function useAudioDecode(videoId : string, frameRate : number){
    //State
    const [filteredData, setFilteredData] = useState<FilteredData | null>(null);
    const [audioLoaded, setAudioLoaded] = useState<boolean>(false);
    const [audioError, setAudioError] = useState<boolean>(false);
    const [audioData, setAudioData] = useState<AudioBuffer | null>(null);

    const baseUrl = useContext(ServerContext);

    /**
     * 서버에서 오디오 스트림을 가져와 웹 오디오 API로 디코딩
     * 
     * @async
     */
    const decode = useCallback( async () => {
        axios.get(
            baseUrl.concat('/yts/audioStream'),
            { params : { videoId : videoId }, responseType: 'arraybuffer' }
        ).then( 
            ( res ) => {                
                const audioCtx = new AudioContext();
                audioCtx.decodeAudioData( res.data ).then( (audioBuffer) => {
                    setAudioData(audioBuffer);
                    setAudioLoaded(true);
                }).catch( (error) => {
                    console.log('audioDecode error', error);
                    setAudioError(true);
                });
            }
        ).catch(
            (error) => {
                console.log('audioStream error', error);
                setAudioError(true);
            }
        )
    }, [baseUrl, videoId]);

    /**
     * 오디오 데이터를 정규화합니다 (0~1 범위로 스케일링).
     * 
     * @param filteredData - 정규화할 오디오 데이터 배열
     * @returns 정규화된 오디오 데이터 배열 (0~1 범위)
     */
    const normalizeData = ( filteredData : number[] ) => {
        let peak = 0;
        if( filteredData.length > 10000){
            let arr = [];
            let a = 0;
            while(a <= filteredData.length/10000){
                let temp = filteredData.slice(a*10000, (a+1)*10000 );
                let max = Math.max( ...temp );
                arr.push( max );
                a++;
            }
            peak = Math.max(...arr);
        }
        else {
            peak = Math.max(...filteredData);
        }
        const multiplier = Math.pow(peak, -1);

        return filteredData.map((n) => n * multiplier);
    };
    
    
    useEffect( () => {
        if(audioData !== null && audioLoaded === true){
            const samplesPerSec = frameRate;
            const {
                duration,
                sampleRate,
                numberOfChannels
            } = audioData;

            const rawData = {
                right : audioData.getChannelData(0),
                left : numberOfChannels > 1 ? audioData.getChannelData(1) : audioData.getChannelData(0)
            }; // 첫번쨰 채널의 AudioBuffer
            const totalSamples = duration * samplesPerSec;
            const blockSize = Math.floor(sampleRate / samplesPerSec);
            const filteredData : FilteredData = {
                right : [],
                left : [],
                length : 0
            }

            for (let i = 0; i < totalSamples; i++) {
                const blockStart = blockSize * i;
                let blockSum = 0;

                for (let j = 0; j < blockSize; j++) {
                    if (rawData.right[blockStart + j]) {
                    blockSum = blockSum + Math.abs(rawData.right[blockStart + j]);
                    }
                }

                filteredData.right.push(blockSum / blockSize);
            }
            for (let i = 0; i < totalSamples; i++) {
                const blockStart = blockSize * i;
                let blockSum = 0;

                for (let j = 0; j < blockSize; j++) {
                    if (rawData.left[blockStart + j]) {
                    blockSum = blockSum + Math.abs(rawData.left[blockStart + j]);
                    }
                }

                filteredData.left.push(blockSum / blockSize);
            }
            
            setFilteredData({
                right : normalizeData(filteredData.right),
                left : normalizeData(filteredData.left),
                length : filteredData.right.length
            });
        }
    }, [audioData, audioLoaded, frameRate]);
    
    useEffect( () => {
        if(audioError === true && audioData === null){
            let dummyLength = Math.floor(180*frameRate);
            const dummyData = Array.from({ length : dummyLength }, (v, i) =>  Math.random() > 0.5 ? Math.random()*0.7 + 0.3 : Math.random()*0.2 + 0.4 );
        
            console.log('make dummy data...');
        
            setFilteredData({
                right : [...dummyData],
                left : [...dummyData],
                length : dummyLength
            });
        }
    }, [audioError, audioData, frameRate])

    useEffect( () => {
        if(videoId !== undefined || videoId !== '' || videoId !== null ){
            decode();
        }
    }, [videoId, decode]) 

    return { audioData, audioLoaded, audioError, filteredData }
}

export { useAudioDecode }