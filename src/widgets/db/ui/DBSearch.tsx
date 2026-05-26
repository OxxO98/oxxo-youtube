
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

//Hook
import { useKirikae } from 'shared/hooks/useKirikae';
import { useJaText } from 'shared/lib/useJaText';

//CSS@Antd
import { Input, Flex, Select } from 'antd';
import type { GetProps } from 'antd';

type SearchProps = GetProps<typeof Input.Search>;

export const DBSearch = () => {
    const { t } = useTranslation('DBPage');

    const SEARCH_TYPE_OPTION = [
        { value: 'auto', label: t('SELECT.0') },
        { value: 'hyouki', label: t('SELECT.1') },
        { value: 'yomi', label: t('SELECT.2') },
        { value: 'imi', label: t('SELECT.3') },
        { value: 'jaText', label : t('SELECT.4') },
        { value: 'koText', label : t('SELECT.5') }
    ]

    const SEARCH_SORT_OPTION = [
        { value: 'auto', label: t('SELECT_SORT.0') },
        { value: 'asc', label: t('SELECT_SORT.1') },
        { value: 'desc', label: t('SELECT_SORT.2') },
        { value: 'asc_amt', label: t('SELECT_SORT.3')},
        { value: 'desc_amt', label: t('SELECT_SORT.4')},
    ]

    const SEARCH_SORT_OPTION_JATEXT = [
        ...SEARCH_SORT_OPTION,
        { value: 'video', label : t('SELECT_SORT.5')},
    ]

    //State
    const [value, setValue] = useState<string>('');

    const [searchType, setSearchType] = useState<SearchType>('auto');
    const [sort, setSort] = useState<SortType>('auto');

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

        let _sort = ( searchType !== 'koText' && searchType !== 'jaText' && sort === 'video' ) ? 'auto' : sort;

        if( kirikae === '' ){
            navigate(`/db/1`)
        }
        else{
            if( isAllHangul(value) === true ){
                if( searchType === 'imi' || searchType === 'koText' ){
                    navigate(`/db/search/1?type=${searchType}&keyword=${value}&sort=${_sort}`)
                }
                else{
                    navigate(`/db/search/1?type=${searchType}&keyword=${kirikae}&sort=${_sort}`)
                }
            }
            else{
                navigate(`/db/search/1?type=${searchType}&keyword=${kirikae}&sort=${_sort}`)
            }
            
        }
    }

    const deleteSearch = () => {
        setValue('');
        navigate(`/db/1`)
    }

    useEffect( () => {
        submitSearch();
    }, [sort])

    return (
        <Flex align='center' style={{ width : '100%'}} gap={8}>
            <Select
                value={searchType}
                onChange={setSearchType}
                options={SEARCH_TYPE_OPTION}
                style={{ width: 120 }}
            />
            <Input.Search allowClear 
                name="search" 
                value={ (searchType === 'imi' || searchType === 'koText') ? value : kirikaeValue ?? ''} 
                onChange={handleKrikae} 
                autoComplete='off' 
                onKeyDown={handleKeyDown} 
                onSearch={onSearch}
            />
            <Select
                value={sort}
                onChange={setSort}
                options={ (searchType === 'jaText' || searchType === 'koText') ? SEARCH_SORT_OPTION_JATEXT : SEARCH_SORT_OPTION }
                style={{ width: 120 }}
            />
        </Flex>
    )
}