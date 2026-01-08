import { useMemo } from 'react'

import { useJaText } from 'shared/lib/useJaText';

export function useAvailable( selection : string ){
    const { checkKatachi } = useJaText();

    const isAvailableKatachi = useMemo( () => {
        return checkKatachi(selection) === 'kanji' || checkKatachi(selection) === 'okuri';
    }, [selection])

    return { isAvailableKatachi };
}

