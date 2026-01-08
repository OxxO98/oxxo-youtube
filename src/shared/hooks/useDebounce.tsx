import { useRef, useCallback } from 'react';

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