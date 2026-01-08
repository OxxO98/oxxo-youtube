import { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//hooks
import { useKirikae } from 'shared/hooks/useKirikae';
import { useJaText } from 'shared/lib/useJaText';

//Css@antd
import { Input, Flex  } from 'antd'
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;

export const SearchTangoComp = () => {
    //Context
    const { videoId } = useContext(VideoContext);

    //State
    const [value, setValue] = useState<string>('');

    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setValue( e.target.value );
    }

    //Hook
    const navigate = useNavigate();
    const { isAllHangul } = useJaText();

    const { kirikaeValue, handleChange : handleKrikae, kirikae } = useKirikae(value, handleChange);

    //Handle
    const handleKeyDown = (e : React.KeyboardEvent) => {
        if(e.key === 'Enter'){
            submitSearch();
        }
    }

    const onSearch : SearchProps['onSearch'] = (value, _e, info) => {
        if(info?.source === 'input'){ submitSearch(); }
        if(info?.source === 'clear'){ deleteSearch(); }
    }

    const submitSearch = () => {
        if( kirikae === null ){ return }

        if( kirikae === '' ){
            navigate(`/video/${videoId}/tangochou/1`)
        }
        else{
            if( isAllHangul(value) === true ){
                navigate(`/video/${videoId}/tangochou/search/1?keyword=${kirikae}&imiKeyword=${value}`)
            }
            else{
                navigate(`/video/${videoId}/tangochou/search/1?keyword=${kirikae}`)
            }
            
        }
    }

    const deleteSearch = () => {
        setValue('');
        navigate(`/video/${videoId}/tangochou/1`)
    }

    return (
        <Flex align='center' style={{ width : '100%'}}>
            <Input.Search allowClear name="search" value={kirikaeValue ?? ''} onChange={handleKrikae} autoComplete='off' onKeyDown={handleKeyDown} onSearch={onSearch}/>
        </Flex>
    )
}