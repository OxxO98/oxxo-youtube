import { useEffect, CSSProperties } from 'react';
import VirtualList from 'rc-virtual-list';
import { useTranslation } from 'react-i18next';

//Hook
import { useAxiosPost } from 'hooks/AxiosHook';

//CSS@antd
import { List, Button, Card, Skeleton } from 'antd'

//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';
import { ComplexText } from 'components/Bun';

interface OsusumeListCompProps {
    osusumeList : Array<OsusumeList>;
    refetchOsusumeList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

interface HukumuProps {
    osusume : OsusumeList;
    refetchOsusumeList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

const ListCompStyle : CSSProperties = {
    padding : '16px'
}

const OsusumeListComp = ({ osusumeList, refetchOsusumeList, refetchTangoList, refetchHandles } : OsusumeListCompProps ) => {

    return(
        <Skeleton loading={osusumeList === null} title={false} active>
        {
            osusumeList !== null && 
            <List style={ListCompStyle}>
                <VirtualList
                    data={osusumeList}
                    itemHeight={47}
                    itemKey="tId"
                >
                {
                    (v) => (
                        <List.Item>
                            <Osusume osusume={v} refetchOsusumeList={refetchOsusumeList} refetchTangoList={refetchTangoList} refetchHandles={refetchHandles}/>
                        </List.Item>
                    )
                }
                </VirtualList>
            </List>
        }
        </Skeleton>
    )
}

const Osusume = ({ osusume, refetchOsusumeList, refetchTangoList, refetchHandles } : HukumuProps ) => {

    //i18n
    const { t } = useTranslation('Osusume');

    //Redux
    const { selectedBun, textOffset } = useSelector((_state : RootState) => _state.selection);

    //Hook
    const { refetch } = refetchHandles;

    const { response, setParams } = useAxiosPost<null, REQ_POST_LIST_COMMIT>('/db/list/commit', true, null);

    const commitOne = () => {
        setParams( {
            jaBId : selectedBun, startOffset : textOffset.startOffset, endOffset : textOffset.endOffset,
            tId : osusume.tId, hyId : osusume.hyId
        });
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            refetch(selectedBun);
            refetchOsusumeList();
            refetchTangoList();
        }
    }, [response, refetch, selectedBun, refetchOsusumeList, refetchTangoList]);

    return(
        <Card
            style={{ width : "100%" }}
            actions={[
                <Button onClick={commitOne}>{t('BUTTON.TITLE')}</Button>
            ]}
        >
            <Card.Meta
                title={
                    <ComplexText bId={null} data={osusume.hyouki} ruby={osusume.yomi} offset={0}/>
                }
            />
        </Card>
    )
}

export { OsusumeListComp };