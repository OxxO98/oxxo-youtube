import { useTranslation } from 'react-i18next';

//Entities
import { ComplexText } from 'entities/ComplexText/index';

//type
import type { auto_db_tIdList } from '../type';

//CSS@antD
import { Flex, Card, Button, theme } from 'antd';
const { useToken } = theme; 

interface MatchedTangoListProps {
    tIdList : auto_db_tIdList;
    hyouki : string;
    yomi : string;
    handleCommit : (tId : string | null, skip : boolean | null ) => void;
}

export const MatchedTangoList = ({ tIdList, hyouki, yomi, handleCommit } : MatchedTangoListProps ) => {
    const { t } = useTranslation('MatchedTangoList');

    const { token } = useToken();

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
                                    <Button onClick={() => handleCommit(v[0].tId, null)}>{t('BUTTON.SAVE')}</Button>
                                ]}
                                style={ 
                                    ( hyouki === v[0].hyouki && yomi === v[0].yomi ) ?
                                    { borderWidth : 2, borderColor : token.colorPrimaryBg } :
                                    { }
                                }
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
                    <Button type="dashed" onClick={() => handleCommit(null, null)}>{t('BUTTON.SAVE_NEW')}</Button>
                </>
                :
                <Button onClick={() => handleCommit(null, null)}>{t('BUTTON.SAVE_NEW')}</Button>
            }
            </Flex>
        </>
    )
}