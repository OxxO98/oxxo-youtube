import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';

import ja from 'shared/locale/ja';
import ko from 'shared/locale/ko';

export const defaultNS = 'translation';
export const resources = {
    ko : {
        ...ko,
    },
    ja : {
        ...ja
    }
}

const initializeI18n = (language: SupportedLanguage) => {
    return i18n.use(initReactI18next).init({
        lng : language,
        resources,
        defaultNS,
        fallbackLng : 'ko'
    });
}

export default i18n;
export { initializeI18n };
