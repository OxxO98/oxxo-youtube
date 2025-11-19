import { useContext, useEffect, useState, useCallback } from 'react';

import { ServerContext } from 'contexts/ServerContext';

import axios from 'axios';

function useAudioDecode(videoId : string, frameRate : number){
    //State
    const [filteredData, setFilteredData] = useState<FilteredData | null>(null);
    const [audioLoaded, setAudioLoaded] = useState<boolean>(false);
    const [audioError, setAudioError] = useState<boolean>(false);
    const [audioData, setAudioData] = useState<AudioBuffer | null>(null);

    const baseUrl = useContext(ServerContext);

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

    const normalizeData = (filteredData : Array<number>) => {
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
            //setRange(0);
            setFilteredData({
                right : normalizeData(filteredData.right),
                left : normalizeData(filteredData.left),
                length : filteredData.right.length
            });
        }
    }, [audioData, audioLoaded, frameRate]);

    
    
    useEffect( () => {
        if(audioError === true && audioData === null){
            //state의 duration을 쓸 수 있을지는 고민
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