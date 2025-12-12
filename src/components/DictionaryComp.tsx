import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { useJaText } from 'hooks/JaTextHook';

import { Empty, Typography, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';

//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';

const DictionaryStyle = {
    width : "100%",
    height : "100%"
}

const InnerStyle = {
    width : "100%",
    height : 'calc(100% - 38px)'
}

//네이버 사전
const DictionaryComp = () => {
    
    //i18n
    const { t } = useTranslation('DictionaryComp');
    const { i18n } = useTranslation();

    //Redux
    const { selection } = useSelector( (_state : RootState) => _state.selection );

    const [selectDict, setSelectDict] = useState(i18n.language == 'ko' ? 'naver' : 'weblio');

    const onChange = (e: RadioChangeEvent) => {
        setSelectDict(e.target.value);
    };

    //Hook
    const { checkKatachi } = useJaText();

    return(
        <>
        {
            selection && selection !== '　' && selection !== ' ' && selection.length < 10 && checkKatachi(selection) !== null ?
            <div style={DictionaryStyle}>
                <Radio.Group defaultValue={selectDict} size="middle" onChange={onChange} buttonStyle="solid">
                    <Radio.Button value="naver">Naver</Radio.Button>
                    <Radio.Button value="weblio">weblio</Radio.Button>
                </Radio.Group>
                <iframe title="dictionary_naver" src={ selectDict === 'naver' ? `https://ja.dict.naver.com/?m=mobile#/search?range=all&query=${selection}` : `https://www.weblio.jp/content/${selection}` } style={InnerStyle}></iframe>
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
