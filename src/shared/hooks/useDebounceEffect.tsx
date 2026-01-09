import { useCallback, useEffect } from 'react';

/**
 * debounce함수 useEffect로 작동
 * 
 * @param func 실행 함수
 * @param delay 딜레이
 * @param deps 의존 변수
 */
function useDebounceEffect(func : any, delay : number, deps : any[]) {
    const callback = useCallback(func, deps);

    useEffect( () => {
        const timer = setTimeout( () => {
            callback();
        }, delay);

        return () => {
            clearTimeout(timer);
        }
    }, [callback, delay])
}

export { useDebounceEffect }