
import { useTranslation } from 'react-i18next';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//CSS@antd
import { Button, Card } from 'antd'

//Redux
import { useAppSelector } from 'shared/store';

interface HukumuBunCompProps {
    hukumu : HukumuList;
    commitOne : ( hukumu : HukumuList, hukumuData : HukumuData | null ) => void;
}

export const HukumuItem = ({ hukumu, commitOne } : HukumuBunCompProps ) => {

    //i18n
    const { t } = useTranslation('HukumuBunComp');

    //Redux
    const { hukumuData } = useAppSelector((state) => state.selection);

    return(
        <Card actions={[
            <Button onClick={() => commitOne(hukumu, hukumuData)}>{t('BUTTON.TITLE')}</Button>
        ]}
            style={{ width : '100%' }}
            title={
                    <>
                        <ComplexText bId={null} data={hukumuData!.hyouki} ruby={hukumuData!.yomi} offset={0}/>
                    </>
                }
        >
            <Card.Meta
                description={
                    <>
                        {hukumu.jaText.substring(0, hukumu.startOffset)}
                        <span className="highlight">
                            <ComplexText bId={null} data={hukumuData!.hyouki} ruby={hukumuData!.yomi} offset={0}/>
                        </span>
                        {hukumu.jaText.substring(hukumu.endOffset)}
                    </>
                }
            />
        </Card>
    )
}

export default HukumuItem;