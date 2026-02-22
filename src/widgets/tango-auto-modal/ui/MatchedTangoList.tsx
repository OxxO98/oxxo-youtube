import { useTranslation } from 'react-i18next';

//Entities
import { ComplexText } from 'entities/ComplexText/index';

//type
import type { auto_db_tIdList } from '../type';

//CSS@antD
import { Flex, Card, Button } from 'antd';

interface MatchedTangoListProps {
    tIdList : auto_db_tIdList
    handleCommit : (tId : string | null, skip : boolean) => void;
}

export const MatchedTangoList = ({ tIdList, handleCommit } : MatchedTangoListProps ) => {
    const { t } = useTranslation('MatchedTangoList');

    return(
        <>
            <Flex vertical
                gap={16}
                style={{ width : '40%', overflow : 'scroll' }}
            >
            {
                tIdList.length !== 0 ?
                <>
                    {
                        tIdList.map( (v) => 
                            <Card
                                actions={[
                                    <Button onClick={() => handleCommit(v[0].tId, false)}>{t('BUTTON.SAVE')}</Button>
                                ]}
                            >
                                <Card.Meta
                                        title={<ComplexText bId={null} data={v[0].hyouki} ruby={v[0].yomi} offset={0}/>
                                    }
                                    description={
                                        <Flex justify="space-between">
                                            <div>
                                                {v.map( (t) => t.hyouki ).join(', ')}
                                            </div>
                                        </Flex>
                                    }
                                />
                            </Card>
                        )
                    }
                    <Button type="dashed" onClick={() => handleCommit(null, false)}>{t('BUTTON.SAVE_NEW')}</Button>
                </>
                :
                <Button onClick={() => handleCommit(null, false)}>{t('BUTTON.SAVE_NEW')}</Button>
            }
            </Flex>
        </>
    )
}