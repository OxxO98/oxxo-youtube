import { useTranslation } from 'react-i18next'

import { useJaText } from 'hooks/JaTextHook';

import { Empty, Typography } from 'antd';

//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';

const DictionaryStyle = {
  width : "100%",
  height : "100%"
}

//네이버 사전
const DictionaryComp = () => {
    
    //i18n
    const { t } = useTranslation('DictionaryComp');

    //Redux
    const { selection } = useSelector( (_state : RootState) => _state.selection );

    //Hook
    const { checkKatachi } = useJaText();

    return(
        <>
        {
            selection && selection !== '　' && selection !== ' ' && selection.length < 10 && checkKatachi(selection) !== null ?
            <div style={DictionaryStyle}>
                <iframe title="dictionary_naver" src={'https://ja.dict.naver.com/?m=mobile#/search?range=all&query=' + selection} style={DictionaryStyle}></iframe>
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
