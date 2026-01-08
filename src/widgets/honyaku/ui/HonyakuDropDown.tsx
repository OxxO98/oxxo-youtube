import { useContext } from 'react';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//api
import { useUpdateRepresentive } from '../api/useUpdateRepresentive';

//CSS@Antd
import { Select } from 'antd'

interface HonyakuTLDropDownProps {
    ytBId : ytBId;
    koBun : koBun;
    koList : Array<koBun>;
    fetch : () => void;
}

export const HonyakuTLDropDown = ({ ytBId, koBun, koList, fetch } : HonyakuTLDropDownProps) => {
    //Context
    const { videoId } = useContext(VideoContext);

    //Hook
    const { updateHonyaku } = useUpdateRepresentive(fetch);

    //Handle
    const handleChange = ( value: string ) => {
        updateHonyaku(videoId, ytBId, value);
    }

    return(
        <>
        {
            koList !== null && 
            <Select
                defaultValue={koBun.koText}
                style={{ width: '100%' }}
                onChange={handleChange}
                options={
                    koList?.map( (v : koBun) => {
                        return { value : v.koBId, label : v.koText }
                    })
                }
            />
        }
        </>
    )
}