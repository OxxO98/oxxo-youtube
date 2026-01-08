import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//api
import { useCommit } from '../api/useCommit';

//CSS@antd
import { Button, Card } from 'antd'

//Redux
import { useAppSelector } from 'shared/store';

interface HukumuProps {
    osusume : OsusumeList;
    refetchOsusumeList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

export const OsusumeItem = ({ osusume, refetchOsusumeList, refetchTangoList, refetchHandles } : HukumuProps ) => {

    //i18n
    const { t } = useTranslation('Osusume');

    //Redux
    const { selectedBun, textOffset } = useAppSelector((_state) => _state.selection);

    //Hook
    const { refetch } = refetchHandles;

    const { response, commit } = useCommit();

    useEffect( () => {
        if(response !== null){
            refetch(selectedBun);
            refetchOsusumeList();
            refetchTangoList();
        }
    }, [response, refetch, selectedBun, refetchOsusumeList, refetchTangoList]);

    return(
        <Card
            style={{ width : "100%" }}
            actions={[
                <Button onClick={ () => commit(selectedBun, textOffset, osusume) } key="commit">{t('BUTTON.TITLE')}</Button>
            ]}
        >
            <Card.Meta
                title={
                    <ComplexText bId={null} data={osusume.hyouki} ruby={osusume.yomi} offset={0}/>
                }
                description={
                    <>
                    {
                        osusume.imi && osusume.imi.length !== 0 &&
                        <>{osusume.imi.join(',')}</>
                    }
                    </>
                }
            />
        </Card>
    )
}

export default OsusumeItem;
