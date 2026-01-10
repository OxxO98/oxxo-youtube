
//widgets
import { HukumuListComp } from 'widgets/list-hukumu/index';
import { OsusumeListComp } from 'widgets/list-osusume/index';
import { TangoListComp } from 'widgets/list-tango/index';

//Redux
import { useAppSelector } from 'shared/store';

interface CompoundListCompProps {
    hukumuList : HukumuList[] | null;
    osusumeList : OsusumeList[] | null;
    tangoList : TangoList[] | null;
    refetchHukumuList : () => void;
    refetchOsusumeList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

const CompoundListComp = ({ hukumuList, osusumeList, tangoList, refetchHukumuList, refetchOsusumeList, refetchTangoList, refetchHandles } : CompoundListCompProps) => {

    //Redux
    const { hukumuData } = useAppSelector((state) => state.selection);

    return(
        <>
            {
                hukumuData !== null ?
                <>
                {
                    hukumuList !== null && hukumuList.length !== 0 ?
                    <>
                        <HukumuListComp hukumuList={hukumuList} refetchHukumuList={refetchHukumuList} refetchTangoList={refetchTangoList} refetchHandles={refetchHandles}/>
                    </>
                    :
                    <>
                        <TangoListComp tangoList={tangoList}/>
                    </>
                }
                </>
                :
                <>
                {
                    osusumeList !== null ? 
                    <>
                        <OsusumeListComp osusumeList={osusumeList} refetchOsusumeList={refetchOsusumeList} refetchTangoList={refetchTangoList} refetchHandles={refetchHandles}/>
                    </>
                    :
                    <>
                        <TangoListComp tangoList={tangoList}/>
                    </>
                }
                </>
            }
            
        </>
    )
}

export { CompoundListComp }