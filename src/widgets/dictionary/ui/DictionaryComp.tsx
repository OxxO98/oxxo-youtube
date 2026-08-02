import { CSSProperties, useState } from 'react'
import { useTranslation } from 'react-i18next'

//Hooks
import { useJaText } from 'shared/lib/useJaText';

//Redux
import { useAppSelector } from 'shared/store';

//CSS@antd
import { Empty, Typography } from 'antd';
import { useDebounceEffect } from 'shared/hooks/useDebounceEffect';

const DictionaryStyle : CSSProperties = {
    height : "100%",
    width : '100%',
    overflow : 'hidden'
}

const InnerStyle : CSSProperties = {
    height : 'calc(100% - 38px)',
    width : 'calc(100% + 16px)',
    marginRight: '-16px',
    overflow : 'hidden'
}

//네이버 사전
const DictionaryComp = () => {
    
    //i18n
    const { t } = useTranslation('DictionaryComp');

    //Redux
    const { selection } = useAppSelector( (_state) => _state.selection );

    const [searchText, setSearchText] = useState<string>('');

    useDebounceEffect( () => {
        if( selection && selection !== '　' && selection !== ' ' && selection !== '' && selection.length < 10 && checkKatachi(selection) !== null ){
            setSearchText(selection)
        }
    }, 500, [selection])

    //Hook
    const { checkKatachi } = useJaText();

    return(
        <>
        {
            searchText ?
            <div style={DictionaryStyle}>
                <iframe title="dictionary_naver" src={`https://ja.dict.naver.com/?m=mobile#/search?range=all&query=${searchText}`} style={InnerStyle}></iframe>
            </div>
            :
            <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={
                    <Typography.Text>
                        {t('MESSAGE.ERROR')}
                    </Typography.Text>
                }
            />
        }
        </>
    )
}

export { DictionaryComp };
