
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

//Hook
import { useKirikae } from 'shared/hooks/useKirikae';
import { useJaText } from 'shared/lib/useJaText';

//CSS@Antd
import { Input, Flex } from 'antd';
import type { GetProps } from 'antd';

type SearchProps = GetProps<typeof Input.Search>;

export const DBSearch = () => {
    
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
            navigate(`/db/1`)
        }
        else{
            if( isAllHangul(value) === true ){
                navigate(`/db/search/1?keyword=${kirikae}&imiKeyword=${value}`)
            }
            else{
                navigate(`/db/search/1?keyword=${kirikae}`)
            }
            
        }
    }

    const deleteSearch = () => {
        setValue('');
        navigate(`/db/1`)
    }

    return (
        <Flex align='center' style={{ width : '100%'}}>
            <Input.Search allowClear name="search" value={kirikaeValue ?? ''} onChange={handleKrikae} autoComplete='off' onKeyDown={handleKeyDown} onSearch={onSearch}/>
        </Flex>
    )
}