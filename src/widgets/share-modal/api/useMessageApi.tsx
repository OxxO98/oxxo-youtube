
import { useTranslation } from 'react-i18next';

import { message } from 'antd';

export type success = () => void;
export type error = () => void;

export function useMessageApi(){
    
    //i18n
    const { t } = useTranslation('SharedModalComp');

    const [messageApi, contextHolder] = message.useMessage();

    const success : success = () => {
        messageApi.open({
            type: 'success',
            content: t('MESSAGE.SUCCESS'),
        });
    };

    const error : error = () => {
        messageApi.open({
            type: 'error',
            content: t('MESSAGE.ERROR'),
        });
    };

    return { contextHolder, success, error }
}