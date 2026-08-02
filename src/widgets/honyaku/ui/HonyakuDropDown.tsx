import { useContext } from 'react';

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//model
import { getHonyakuSelectModel } from '../model/getTranslationDirectionModel';

//api
import { useUpdateRepresentive } from '../api/useUpdateRepresentive';
import { useUpdateRepresentiveJaText } from '../api/useUpdateRepresentiveJaText'

//CSS@Antd
import { Select } from 'antd'

interface HonyakuTLDropDownProps {
    ytBId : string;
    translates : RES_GET_TRANSLATE;
    fetch : () => void;
}

export const HonyakuTLDropDown = ({ ytBId, translates, fetch } : HonyakuTLDropDownProps) => {
    //Context
    const { videoId, translationDirection } = useContext(VideoContext);

    //Hook
    const { updateHonyaku } = useUpdateRepresentive(fetch);
    const { updateJaText } = useUpdateRepresentiveJaText(fetch)

    //model
    const selecModel = getHonyakuSelectModel(translates, translationDirection);

    //Handle
    const handleChange = ( value: string ) => {
        if( translationDirection === 'ja-ko' ){
            updateHonyaku(videoId, ytBId, value);
        }
        else{
            updateJaText(videoId, ytBId, value)
        }
    }

    return(
        <Select
            defaultValue={ selecModel.defaultValue }
            style={{ width: '100%' }}
            onChange={ handleChange }
            options={ selecModel.options }
        />
    )
}