import { useEffect, useState, useContext, CSSProperties } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//entities
import { KanjiText } from 'entities/KanjiText/index';

//ui
import { TangoBunList } from './TangoBunList';

//CSS@antd
import { Button, Tabs, Flex  } from 'antd'

const infoCompStyle : CSSProperties = {
    textAlign : 'left',
    margin : '20px'
}

export const TangoInfo = () => {
    
    const { t } = useTranslation('TangoInfo');

    //Context
    const { videoId } = useContext(VideoContext);

    const { tId } = useParams();

    //Hook
    const navigate = useNavigate();

    //State
    const [tangoBunList, setTangoBunList] = useState<Array<TangoBunListData>>([]);
    const [kanjiList, setKanjiList] = useState<Array<KanjiData>>();

    const [defaultData, setDefaultData] = useState<TangoBunListData | null>(null);

    //Hook
    const { response, setParams } = useAxiosGet<RES_GET_TANGOCHOU_TANGO_INFO, REQ_GET_TANGOCHOU_TANGO_INFO>('/db/tangochou/tango/info', false, { videoId : videoId, tId : tId! });

    //Handle
    const handlePrev = () => {
        navigate(-1);
    }

    const handleClose = () => {
        navigate(`/video/${videoId}/tangochou/1`);
    }

    const handleClickKanji = (kanji : string) => {
        if(kanjiList !== undefined){
            let kId = kanjiList.filter( (v) => v.jaText === kanji)[0]?.kId;
            if(kId === undefined){ return }

            navigate(`/video/${videoId}/tangochou/kanji/${kId}`);
        }
    }

    //Effect
    useEffect( () => {
        let res = response;
        if(res !== null){
            let tangoList = res.data.tangoList;
            let kanjiList = res.data.kanjiList;
            
            setDefaultData(tangoList[0]);
            setTangoBunList(tangoList);
            setKanjiList(kanjiList);
        }
    }, [response]);

    useEffect( () => {
        if(tId !== undefined){
            setParams({ videoId : videoId, tId : tId});
        }
    }, [tId, setParams, videoId]);

    return(
        <>
            {
                tId !== undefined && defaultData !== null &&
                <>
                    <div style={infoCompStyle}>
                        <Flex justify='right' gap={8}>
                            <Button onClick={handlePrev}>{t('BUTTON.BACK')}</Button>
                            <Button onClick={handleClose}>{t('BUTTON.CLOSE')}</Button>
                        </Flex>
                            <KanjiText hyouki={defaultData.hyouki} yomi={defaultData.yomi} onClick={handleClickKanji}/>
                            <div>
                            <Tabs defaultActiveKey="1" items={
                                tangoBunList.map( (v, i) => {
                                    return {
                                        key : i.toString(),
                                        label : `${v.hyouki} (${v.yomi})`,
                                        children : <TangoBunList hyId={v.hyId}/>
                                    }
                                })
                            }/>
                        </div>
                    </div>
                </>
            }
        </>
    );
}