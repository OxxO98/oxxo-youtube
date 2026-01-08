import { useState } from 'react';

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