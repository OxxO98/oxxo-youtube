import { useState } from 'react';

/**
 * useSelection의 경우 한 ID에서만 범위를 한정하기 때문에 이를 보조하기 위한 Hook
 * onMouseDown에 setActive를 설정해 드래그 하는 부분에서 사용가능하게 함. 
 * 
 * @returns 
 * @todo TimelineComp에서만 사용되는 기능
 */
function useActive(){
    const [activeId, setActiveId] = useState<string>();

    const setActive = (id : string) => {
        setActiveId(id);
    }

    const getActive = (id : string) => {
        if(activeId === id){
            return true;
        }
        else{
            return false;
        }
    }

    return { getActive, setActive }
}

export { useActive }