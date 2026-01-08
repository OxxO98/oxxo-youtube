import { useTranslation } from 'react-i18next';

export function useSearchedArr(){

    const { t } = useTranslation('AccordianTangoDB');
    
    const getSearchedArr = (obj : TangoDBSearchedList | null) => {
        if(obj !== null){
            let retArr = [];

            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.0'), list : obj.kanzen, count : obj.kanzen.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.1'), list : obj.orSame, count : obj.orSame.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.2'), list : obj.prefix, count : obj.prefix.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.3'), list : obj.suffix, count : obj.suffix.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.4'), list : obj.okuri, count : obj.okuri.length
            });
            retArr.push({
                name : t('CONTENTS.SEARCHED_LIST.5'), list : obj.theOther, count : obj.theOther.length
            });

            return retArr.filter( (arr) => arr.count > 0);
        }
        else{
            return [];
        }
    }

    return { getSearchedArr }
}