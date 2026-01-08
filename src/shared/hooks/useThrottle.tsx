import { useRef, useCallback } from 'react';
  
function useThrottle(){
  let isThrottle = useRef<boolean>(false);

  return useCallback<(callback : any, delay : number) => (...arg : any) => void>(
    ( callback : any, delay : number ) => (...arg : any) => {
      if(isThrottle.current){
        return;
      }

      isThrottle.current = true;

      window.setTimeout( () => {
        callback(...arg);
        isThrottle.current = false;
      }, delay)
    }, []
  )
}

export { useThrottle }