import React, { useEffect, useState, CSSProperties, RefObject, useCallback } from 'react';
import Markdown from 'marked-react';
import { useTranslation } from 'react-i18next';

//Hook
import { useChat } from 'hooks/AiHook';

//CSS@antd
import { Flex, Input, Button, Space, Skeleton, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';

const CompStyle : CSSProperties = {
    width : '100%',
    height : '100%',
}

const ChatCompStyle : CSSProperties = {
    width : '100%',
    height : 'calc(100% - 70px)',
    overflow : 'scroll'
}

const ChatInputStyle : CSSProperties = {
    width : '100%',
    height : '70px'
}

const ChatAiMessageStyle : CSSProperties = {
    width : 'calc(100% - 32px)',
    margin : '16px',
    textAlign : 'start'
}

const ChatUserMessageStyle : CSSProperties = {
    width : '80%',
    margin : '8px',
    textAlign : 'start',
    borderRadius: '32px',
}


interface AiCompProps {
    bIdRef : RefObject<BIdRef>;
}

const AiComp = ({ bIdRef } : AiCompProps) => {

    const { t } = useTranslation('AiComp');
    //State
    const [value, setValue] = useState<string>('');

    //Redux
    const { hukumuData, selectedBun } = useSelector( (_state : RootState) => _state.selection );

    //Hook
    const { AImessage, userMessage, handleChat, cancelChat, loading, history } = useChat();

    const replaceTango = useCallback( () => {
        if( hukumuData !== null ){
            setValue( (prev) => (
                prev.replaceAll('/단어/', `「${hukumuData.hyouki}」`)
            ) );
        }
    }, [hukumuData])

    const replaceBun = useCallback( () => {
        if( bIdRef !== null && bIdRef.current['bId'+selectedBun] !== undefined ){
            let jaText = bIdRef.current['bId'+selectedBun].jaText;
            setValue( (prev) => ( 
                prev.replaceAll('/문장/', `「${jaText}」`) 
            ) );

            let koText = bIdRef.current['bId'+selectedBun].koText;
            if(koText !== undefined ){
                setValue( (prev) => ( 
                    prev.replaceAll('/번역/', `"${koText}"`) 
                ) );
            }
        }
    }, [bIdRef, selectedBun])

    //Handle
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    const handleSubmit = () => {
        handleChat(value);
        setValue('');
    }

    useEffect( () => {
        replaceTango();
        replaceBun();
    }, [value, replaceTango, replaceBun])

    return(
        <>
            <Flex vertical style={CompStyle} align='flex-end'>
                <div style={ChatCompStyle}>
                    <Flex vertical justify='end' align='end'>
                    {
                        history.map( (v) => 
                            <> 
                                <Card style={ChatUserMessageStyle}>
                                    {v.user}
                                </Card>
                                <Card variant="borderless" style={ChatAiMessageStyle}
                                    actions={[
                                        <Button>{t('BUTTON.NEW_CHAT')}</Button>
                                    ]}
                                >
                                    <Markdown value={v.response}/>
                                </Card>
                            </>
                            
                        )
                    }
                    {
                        userMessage !== '' &&
                        <Card style={ChatUserMessageStyle}>
                            {userMessage}
                        </Card>
                    }
                    {
                        AImessage === '' ?
                        <Skeleton loading={loading} title={false} active/>
                        :
                        <Card variant="borderless" style={ChatAiMessageStyle}
                            actions={[
                                <Button>{t('BUTTON.NEW_CHAT')}</Button>
                            ]}
                        >
                            <Markdown value={AImessage}/>
                        </Card>
                    }
                    </Flex>
                </div>
                <div style={ChatInputStyle}>
                    <Space.Compact block>
                        <Input value={value} onChange={handleChange}/>
                        {
                            !loading ?
                                <Button onClick={handleSubmit}>{t('BUTTON.DONE')}</Button>
                            :
                                <Button type="primary" onClick={cancelChat}>{t('BUTTON.CANCLE')}<LoadingOutlined/></Button>
                        }
                    </Space.Compact>
                </div>
            </Flex>
        </>
    )
}

export { AiComp }