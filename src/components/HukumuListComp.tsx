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
import { ComplexText } from './Bun';

interface HukumuListCompProps {
    hukumuList : Array<HukumuList>;
    refetchHukumuList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

interface HukumuBunCompProps {
    hukumu : HukumuList;
    refetchHukumuList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

const ListCompStyle : CSSProperties = {
    padding : '16px'
}

const HukumuListComp = ({ hukumuList, refetchHukumuList, refetchTangoList, refetchHandles } : HukumuListCompProps ) => {

    return(
        <Skeleton loading={hukumuList === null} title={false} active>
        {
            hukumuList !== null &&
            <List style={ListCompStyle}>
                <VirtualList
                    data={hukumuList}
                    itemHeight={47}
                    itemKey="tId"
                >
                {
                    (hukumu) => (
                        <List.Item>
                            <HukumuBunComp hukumu={hukumu} refetchHukumuList={refetchHukumuList}  refetchTangoList={refetchTangoList} refetchHandles={refetchHandles}/>
                        </List.Item>
                    )
                }
                </VirtualList>
            </List>
        }
        </Skeleton>
    )
}

const HukumuBunComp = ({ hukumu, refetchHukumuList, refetchTangoList, refetchHandles } : HukumuBunCompProps ) => {

    //i18n
    const { t } = useTranslation('HukumuBunComp');

    //Redux
    const { hukumuData } = useSelector((state : RootState) => state.selection);

    //Hook
    const { refetch } = refetchHandles;

    const { response, setParams } = useAxiosPost<null, REQ_POST_LIST_COMMIT>('/db/list/commit', true, null);

    //Handle
    const commitOne = () => {
        if( hukumuData === null){ return }

        setParams({
            jaBId : hukumu.jaBId, startOffset : hukumu.startOffset, endOffset : hukumu.endOffset,
            tId : hukumuData.tId, hyId : hukumuData.hyId
        });
    }

    useEffect( () => {
        let res = response;
        if(res !== null){
            refetch(hukumu.jaBId);
            refetchHukumuList();
            refetchTangoList();
        }
    }, [response, refetch, hukumu.jaBId, refetchHukumuList, refetchTangoList]);

    return(
        <Card actions={[
            <Button onClick={commitOne}>{t('BUTTON.TITLE')}</Button>
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

export { HukumuListComp }