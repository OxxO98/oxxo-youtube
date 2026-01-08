import { useCallback } from 'react';

import { useAxiosGet } from 'shared/hooks/useAxios';

import { useJaText } from 'shared/lib/useJaText';
import { useHuri } from 'shared/lib/useHuri'

export const useCheckTango = () => {
    const { getHyoukiQuery, getYomiQuery } = useJaText();
    const { getOkuri } = useHuri();

    const { response, setParams } = useAxiosGet<RES_GET_TANGO_CHECK, REQ_GET_TANGO_CHECK>('/db/tango/check', true, null);

    const checkTango = useCallback( ( multiInputData : MultiInput[], multiValue : string[], searchText : SearchText ) => {
        let okuri = getOkuri( searchText.hyouki );
        let _hyouki = okuri.matched ? okuri.hyouki : searchText.hyouki;
        
        setParams({
            hyouki : _hyouki,
            yomi : searchText.yomi,
            hyoukiQuery : getHyoukiQuery(multiInputData),
            yomiQuery : getYomiQuery(multiInputData, multiValue)
        });
    }, [] )

    return { response, checkTango }
}