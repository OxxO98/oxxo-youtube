import { useCallback, useState } from 'react';

function useSelectEdit(){
  const [edit, setEdit] = useState(false);

  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = useCallback( (selectId : string) => {
    setSelected(selectId);
    setEdit(true);
  }, [])

  const clearEdit = useCallback( () => {
    setSelected(null);
    setEdit(false);
  }, [])

  return { edit, selected, handleSelect, clearEdit };
}


export { useSelectEdit }