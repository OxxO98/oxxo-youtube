import { useTranslation } from 'react-i18next';

//Entities
import { ComplexText } from 'entities/ComplexText/index';

//Redux
import { useAppSelector } from 'shared/store';

//type
import type { auto_db_tango, auto_db_hukumu } from '../type';

//CSS@antD
import { Flex, Card } from 'antd';

interface TangoProps {
    data : auto_db_tango
}

export const TangoCard = ({ data } : TangoProps ) => {
    const { t } = useTranslation('TangoCard');

    //Redux
    const { bunIds } = useAppSelector( (state) => state.timeline );

    const render = ( v : auto_db_hukumu ) => {
        if( bunIds == null){ return <></> }

        let jaText = bunIds[Number(v.jaBId.slice(2))-1].jaText;

        return <p>
            {jaText.substring(0, v.startOffset)}
        <span className="bold highlight">
            {jaText.substring(v.startOffset, v.endOffset)}
        </span>
            {jaText.substring(v.endOffset)}
        </p>
    }

    return(
        <Card
            style={{ width : '40%' }}
        >
            <Card.Meta
                title={
                    <ComplexText bId={null} data={data[0].hyouki} ruby={data[0].yomi} offset={0}/>
                }
                description={
                    <>
                        {
                            data[0]?.imi !== undefined &&
                            <div>
                                {t('CONTENTS.IMI')} : {data[0].imi}
                            </div>
                        }
                        <div>
                            {t('CONTENTS.KANJI')} : {data[0].kanjis.join(', ')}
                        </div>
                        <div>
                        {
                            bunIds !== null && 
                            data.map( (v) => bunIds[Number(v.jaBId.slice(2))-1].jaBId ).join(', ')
                        }
                        {
                            bunIds !== null &&
                            data.map( (v) => 
                                render(v)
                            )
                        }
                        </div>
                        <Flex justify="flex-end">
                            <div>
                                {data.length} {t('CONTENTS.SIZE')}
                            </div>
                        </Flex>
                    </>
                }
            />
        </Card>
    )
}