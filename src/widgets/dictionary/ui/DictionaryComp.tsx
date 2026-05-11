import { CSSProperties, useState } from 'react'
import { useTranslation } from 'react-i18next'

//Hooks
import { useJaText } from 'shared/lib/useJaText';

//Redux
import { useAppSelector } from 'shared/store';

//CSS@antd
import { Empty, Typography, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
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
    const { i18n } = useTranslation();

    //Redux
    const { selection } = useAppSelector( (_state) => _state.selection );

    const [selectDict, setSelectDict] = useState(i18n.language === 'ko' ? 'naver' : 'weblio');

    const [searchText, setSearchText] = useState<string>('');

    const onChange = (e: RadioChangeEvent) => {
        setSelectDict(e.target.value);
    };

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
                <Radio.Group defaultValue={selectDict} size="middle" onChange={onChange} buttonStyle="solid">
                    <Radio.Button value="naver">Naver</Radio.Button>
                    <Radio.Button value="weblio">weblio</Radio.Button>
                </Radio.Group>
                <iframe title="dictionary_naver" src={ selectDict === 'naver' ? `https://ja.dict.naver.com/?m=mobile#/search?range=all&query=${searchText}` : `https://www.weblio.jp/content/${searchText}` } style={InnerStyle}></iframe>
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
