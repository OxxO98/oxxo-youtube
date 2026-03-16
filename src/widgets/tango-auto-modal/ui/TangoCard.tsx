import { RefObject } from 'react';

import { useTranslation } from 'react-i18next';

//Entities
import { ComplexText } from 'entities/ComplexText/index';

//Redux
import { useAppSelector } from 'shared/store';

//type
import type { auto_db_tango, auto_db_hukumu } from '../type';

//CSS@antD
import { Flex, Card, Checkbox } from 'antd';
import type { CheckboxProps } from 'antd';
interface TangoProps {
    data : auto_db_tango;
    commitData : RefObject<ObjKey | null>
}

export const TangoCard = ({ data, commitData } : TangoProps ) => {
    const { t } = useTranslation('TangoCard');

    //Redux
    const { bunIds } = useAppSelector( (state) => state.timeline );

    const onChange : CheckboxProps['onChange'] = ( e ) =>  {
        if(commitData.current === null || e.target.id === undefined ){ return }
        
        commitData.current[e.target.id].skip = !e.target.checked;
    }

    const render = ( v : auto_db_hukumu ) => {
        if( bunIds == null){ return <></> }

        let jaText = bunIds[Number(v.jaBId.slice(2))-1].jaText;
        
        return <div>
            <Checkbox onChange={(e) => onChange(e)} id={v.id} checked={commitData.current?.[v.id].skip ? false : true } disabled={commitData.current === null}>
                <div style={{ margin : '16px 0'}}>
                    {jaText.substring(0, v.startOffset)}
                <span className="bold highlight">
                    {jaText.substring(v.startOffset, v.endOffset)}
                </span>
                    {jaText.substring(v.endOffset)}
                </div>
            </Checkbox>
        </div>
    }

    return(
        <Card
            style={{ width : '40%' }}
        >
            <Card.Meta
                title={
                    <ComplexText bId={'tango'} data={data[0].hyouki} ruby={data[0].yomi} offset={0}/>
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
                            {t('CONTENTS.BASE')} : {data[0].base}
                        </div>
                        <div style={{ fontSize : '1.2em' }}>
                            {t('CONTENTS.KANJI')} : {data[0].kanjis.join(', ')}
                        </div>
                        <div style={{ fontSize : '1.2em', color : 'white' }}>
                            {t('CONTENTS.YOMI')} : {data[0].yomi}
                        </div>
                        <div>
                            <div style={{ height : '324px', overflow : 'scroll'}}>
                                {
                                    bunIds !== null &&
                                    data.map( (v) => 
                                        render(v)
                                    )
                                }
                            </div>
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