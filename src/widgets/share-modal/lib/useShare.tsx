import { useCallback, useEffect } from 'react';

import LZstring from 'lz-string'

//hooks
import { useDebounceEffect } from 'shared/hooks/useDebounceEffect';

//config
import { COPY_MAX } from '../config/share-config';

type opt = 'both' | 'ja' | 'ko'
export type SharePreset = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type getEncoded = ( arr : RES_SHARE[], start? : number, end? : number ) => string;
export type getEncodedLight = ( arr : RES_SHARE[], start? : number, end? : number, opt? : opt ) => string;
export type findRange = ( arr : RES_SHARE[], startPoint? : number ) => { encoded : string, offset : number }
export type findRangeLight = ( arr : RES_SHARE[], startPoint? : number, opt? : opt ) => { encoded : string, offset : number }

export function useShare(
    videoId : string,
    bunIds : RES_SHARE[] | null,
    setUrl : ( url : string ) => void,
    range : number[] | null,
    preset : SharePreset,
){
    const _getEncoded : getEncoded = useCallback( ( arr : RES_SHARE[], start : number = 0, end : number = arr.length ) => {
        let sharedTimeline = arr.slice(start, end+1).map( (v) => {
            return {
                s : v.startTime,
                e : v.endTime,
                j : v.textData,
                k : v.koText ?? ''
            }
        })

        let shared = {
            v : videoId,
            t : sharedTimeline,
            s : {
                p : preset
            }
        }

        let stringify = JSON.stringify(shared)

        let compressed = LZstring.compressToEncodedURIComponent(stringify);

        return compressed;
    }, [videoId, preset]);

    const _getEncodedLight : getEncodedLight = useCallback( ( arr : RES_SHARE[], start : number = 0, end : number = arr.length, opt : opt = 'both' ) => {
        const _returnOpt = ( v : RES_SHARE ) => {
            if( opt === 'ja'){
                return {
                    s : v.startTime,
                    e : v.endTime,
                    j : v.jaText
                }
            }
            else if(opt === 'ko' && v.koText !== undefined){
                return {
                    s : v.startTime,
                    e : v.endTime,
                    k : v.koText
                }
            }
            else{
                return {
                    s : v.startTime,
                    e : v.endTime,
                    j : v.jaText,
                    k : v.koText ?? ''
                }
            }
        }
        
        let sharedTimeline = arr.slice(start, end+1).map( (v) => _returnOpt(v) )

        let shared = {
            v : videoId,
            t : sharedTimeline
        }

        let stringify = JSON.stringify(shared)

        let compressed = LZstring.compressToEncodedURIComponent(stringify);

        return compressed;
    }, [videoId]);

    const _findRange : findRange = ( arr : RES_SHARE[], startPoint : number = 0 ) => {
        
        let start = startPoint;
        let end = arr.length-1;
        let mid = Math.floor( (end+start)/2 );

        let maxEndcoded = _getEncoded(arr, 0+startPoint, end);

        if(maxEndcoded.length < COPY_MAX){
            return { encoded : maxEndcoded, offset : end }
        }

        while( start <= end ){
            mid = Math.floor( (end+start)/2 );

            maxEndcoded = _getEncoded(arr, 0+startPoint, mid);

            let sharedLength = maxEndcoded.length;

            if( sharedLength < COPY_MAX ){
                if( end > mid+1 ){
                    start = mid;
                }
                else{
                    return { encoded : maxEndcoded, offset : mid };
                }
            }
            else{
                if(mid-1 === start){
                    maxEndcoded =  _getEncoded(arr, 0+startPoint, start);

                    return { encoded : maxEndcoded, offset : start };
                }
                else{
                    end = mid;
                }
            }
        }
        return { encoded : maxEndcoded, offset : mid };
    }

    const _findRangeLight : findRangeLight = ( arr : RES_SHARE[], startPoint : number = 0, opt : opt = 'both' ) => {
        
        let start = startPoint;
        let end = arr.length-1;
        let mid = Math.floor( (end+start)/2 );

        let maxEndcoded = _getEncodedLight(arr, 0+startPoint, end, opt);

        if(maxEndcoded.length < COPY_MAX){
            return { encoded : maxEndcoded, offset : end }
        }

        while( start <= end ){
            mid = Math.floor( (end+start)/2 );

            maxEndcoded = _getEncodedLight(arr, 0+startPoint, mid, opt);

            let sharedLength = maxEndcoded.length;

            if( sharedLength < COPY_MAX ){
                if( end > mid+1 ){
                    start = mid;
                }
                else{
                    return { encoded : maxEndcoded, offset : mid };
                }
            }
            else{
                if(mid-1 === start){
                    maxEndcoded =  _getEncodedLight(arr, 0+startPoint, start, opt);

                    return { encoded : maxEndcoded, offset : start };
                }
                else{
                    end = mid;
                }
            }
        }
        return { encoded : maxEndcoded, offset : mid };
    }
    
    useEffect( () => {
        if(bunIds !== null){
            setUrl( _getEncoded(bunIds) );
        }
    }, [bunIds, _getEncoded])

    useDebounceEffect( () => {
        if( range !== null && bunIds !== null ){
            setUrl( _getEncoded(bunIds, range[0], range[1]) );
        }
    }, 1000, [range, bunIds, _getEncoded])

    return { _getEncoded, _getEncodedLight, _findRange, _findRangeLight }
}
