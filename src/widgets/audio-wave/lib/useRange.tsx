import { useEffect, useState, useCallback } from 'react';

export function useRange(
    filteredData : FilteredData | null,
    frameRate : number,
    videoTime : number,
    playing : boolean,    
) {
    //State
    const [range, setRange] = useState<number[] | null>(null); //Index

    const setRangeCrit = useCallback( (time : number) => {
        if(!filteredData) return;
        if( playing === false ){ return } 

        if(range === null) return;

        let [ _start, _end ] = range;
        let _zoom = _end - _start;

        if(_zoom >= filteredData.length){
            setRange([0, filteredData.length]);
        }
        else{
            let _time = Math.floor(time*frameRate);

            if( _start <= _time && _time <= _end ){
                return;
            }

            if( _time + _zoom > filteredData.length-1 ){
                setRange([filteredData.length-1-_zoom, filteredData.length-1]);
            }
            else if( _time - _zoom < 0){
                setRange([0, _zoom]);
            }
            else{
                setRange([_time, _time+_zoom]);
            }
        }
    }, [playing, range, filteredData, frameRate])
    
    useEffect( () => {
        setRangeCrit(videoTime);
    }, [videoTime, setRangeCrit])

    useEffect( () => {
        if(filteredData !== null && range == null){
            setRange([0, filteredData.length-1]) //초기 Range 설정
        }
    }, [filteredData, range])

    return { range, setRange, setRangeCrit };
}