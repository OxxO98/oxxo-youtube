
//Component
import { HukumuListComp } from 'components/HukumuListComp';
import { OsusumeListComp } from 'components/OsusumeListComp';
import { TangoListComp } from 'components/TangoListComp';

//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';

interface CompoundListCompProps {
    hukumuList : Array<HukumuList> | null;
    osusumeList : Array<OsusumeList> | null;
    tangoList : Array<TangoList> | null;
    refetchHukumuList : () => void;
    refetchOsusumeList : () => void;
    refetchTangoList : () => void;
    refetchHandles : RefetchHandles;
}

const CompoundListComp = ({ hukumuList, osusumeList, tangoList, refetchHukumuList, refetchOsusumeList, refetchTangoList, refetchHandles } : CompoundListCompProps) => {

    //Redux
    const { hukumuData } = useSelector((state : RootState) => state.selection);

    //Hook

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