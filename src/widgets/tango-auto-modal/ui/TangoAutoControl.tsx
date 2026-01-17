import { useTranslation } from 'react-i18next';

//CSS@antD
import { Button, Flex } from 'antd';

interface TangoAutoControlProps {
    handleSkip : () => void;
}

export const TangoAutoControl = ({ handleSkip } : TangoAutoControlProps) => {
    const { t } = useTranslation('TangoAutoControl');

    return (
        <Flex justify="center" gap={16}>
            <Button onClick={() => { handleSkip() }}>{t('BUTTON.SKIP')}</Button>
        </Flex>
    )
}