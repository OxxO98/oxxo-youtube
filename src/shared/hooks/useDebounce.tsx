import { useRef, useCallback } from 'react';

/**
 * @deprecated
 * debounce 훅이지만 원래 목적과 다른 방식으로 작동 중 useDebounceEffect를 사용 바람.
 */
function useDebounce(){
    const timer = useRef<number>(0);

    return useCallback<(callback : any, delay : number) => (...arg : any) => void>(
        ( callback : any, delay : number ) => (...arg : any) => {
            clearTimeout(timer.current);
            timer.current = window.setTimeout(() => {
                callback(...arg);
            }, delay);
        }, []
    );
}

export { useDebounce }  