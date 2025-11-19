import React, {useEffect, useState } from 'react';

//Hooks
import { useAxiosGet } from 'hooks/AxiosHook';
import { useHuri } from 'hooks/HuriHook';

import { v4 as uuidv4 } from 'uuid';

//Redux
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/store';

interface BunProps {
    bId : string;
    bIdRef? : React.RefObject<BIdRef>;
}

interface ComplexTextProps {
    bId : string | null;
    data : string;
    ruby : string | null;
    offset : number;
}

interface TextProps {
    bId : string | null;
    data : string;
    ruby : string | null;
    offset : number;
}

interface KanjiTextProps {
    hyouki : string;
    yomi : string;
    onClick : ( kanji : string ) => void;
}

//HUKUMU까지 확인함
const Bun = ({ bId, bIdRef } : BunProps ) => {

    //State
    const [bunData, setBunData] = useState('');
    const [hukumuData, setHukumuData] = useState<Array<TextData>>([]);

    //Hook
    const { response : resBun, loading : resBunLoad, fetch : fetchBun } = useAxiosGet<RES_GET_BUN, REQ_GET_BUN>('/db/bun', false, { bId : bId });

    useEffect( () => {
        let res = resBun;
        if(res !== null){
            setBunData(res.data.jaText);

            let textData : Array<TextData> = [];
            let endIndex = 0;
            for(let key in res.data.hukumuArr){
                let _data = res.data.hukumuArr[key];
                if( _data.startOffset - endIndex > 0 ){
                    let tmpText = res.data.jaText.substring(endIndex, _data.startOffset);
                    let obj = { data : tmpText, ruby : null, offset : endIndex };
                    textData.push(obj);
                }
                textData.push({ data : _data.hyouki, ruby : _data.yomi, offset : _data.startOffset });

                endIndex = _data.endOffset;
            }
            if(res.data.jaText.length - endIndex > 0 && res.data.hukumuArr.length > 0 ){
                let tmpText = res.data.jaText.substring( res.data.hukumuArr[res.data.hukumuArr.length-1].endOffset );
                textData.push({ data : tmpText, ruby : null, offset : res.data.hukumuArr[res.data.hukumuArr.length-1].endOffset });
            }

            setHukumuData(textData);

            
            if( bIdRef !== undefined ){
                bIdRef.current[`bId${bId}`] = {
                    ...bIdRef.current[`bId${bId}`],
                    fetchBun : fetchBun,
                    jaText : res.data.jaText
                };
                //fetchHukumu: fetchHukumu,
            }
        }

    }, [resBun, bId, bIdRef, fetchBun]);

    return(
        <>
            {
                resBunLoad === false && hukumuData !== null && 
                    <span className='bun'>
                    {
                        hukumuData.length > 0 ?
                        hukumuData.map( (arr) =>
                            <ComplexText bId={bId} offset={arr['offset']} key={bId+arr['offset']} data={arr['data']} ruby={arr['ruby']}/>
                        )
                        :
                        <ComplexText bId={bId} offset={0} key={bId+'0'} data={bunData} ruby={null}/>
                    }
                    </span>
            }
        </>
    )
}

const ComplexText = ({ bId, data, ruby, offset } : ComplexTextProps) => {

    const { complexArr } = useHuri();

    const _key = ( v : TextData ) => bId !== undefined && bId !== null ? `${bId}-${v['offset']}` : uuidv4();

    return(
        <>
        {
            complexArr(data, ruby ?? null, offset ?? 0).map( (arr : TextData) =>
                <Text key={_key(arr)} offset={arr['offset']} bId={bId} data={arr['data']} ruby={arr['ruby']}/>
            )
        }
        </>
    )
}

const Text = ({ bId, data, ruby, offset } : TextProps ) => {

    //Redux
    const { styled } = useSelector( (_state : RootState) => _state.selection );

    const convertStyled = () => {
        let tmpArr = [];

        if(styled !== null && styled !== undefined && styled.bId === bId && styled.bId !== '' ){
            let { startOffset, endOffset } = styled;
            let startTextOffset = offset;
            let endTextOffset = offset + data.length;

            let styleOpt = "highlight";

            if(styled.opt === 'bold'){
                styleOpt = "bold";
            }

            if( startTextOffset <= startOffset && endOffset <= endTextOffset ){
                // Text가 styled를 포함 하는 경우.
                if( startOffset-startTextOffset > 0 ){
                    tmpArr.push({
                        data : data.substring(0, startOffset-startTextOffset), style : null,
                        offset : startTextOffset
                    });
                }
                tmpArr.push({
                    data : data.substring(startOffset-startTextOffset, endOffset-startTextOffset), ruby : ruby, style : styleOpt,
                    offset : startOffset
                });
                if( endTextOffset-endOffset > 0 ){
                    tmpArr.push({
                        data : data.substring(endOffset-startTextOffset), style : null,
                        offset : endOffset
                    });
                }
            }
            else if( startOffset <= startTextOffset && endTextOffset <= endOffset ){
                // styled에 Text가 포함 된 경우.
                tmpArr.push({
                    data : data, ruby : ruby, style : styleOpt,
                    offset : offset
                });
            }
            else{
                tmpArr.push({
                    data : data, ruby : ruby, style : null,
                    offset : offset
                });
            }
        }
        else{
            tmpArr.push({
                data : data, ruby : ruby, style : null,
                offset : offset
            });
        }

        return tmpArr;
    }

    let _offset = (v : number) => offset !== null && offset !== undefined ? v : '0';

    return(
        <>
        {
        convertStyled().map( (arr) => {
            if(arr?.ruby === null || arr?.ruby === undefined){
                return(
                    <span className={`${arr.style !== null ? arr.style : ''} rubyNasi`} data-bid={bId} data-offset={_offset(arr.offset)} key={bId+'-'+arr.offset}>
                        {arr.data}
                    </span>
                )
            }
            else{
                return(
                    <ruby className={`${arr.style !== null ? arr.style : ''} rubyAri`} data-bid={bId} data-offset={_offset(arr.offset)} key={bId+'-'+arr.offset}>
                        {arr.data}
                        <rt>
                            {arr.ruby}
                        </rt>
                    </ruby>
                )
            }
        })
        }
        </>
    )
}

//단어장의 단어 정보 onClick이벤트를 위해 만듬.
const KanjiText = ({ hyouki, yomi, onClick } : KanjiTextProps ) => {
    const { complexArr } = useHuri();

    const converKanjiTextList = (hyouki : string) => {
        let list = [];

        for(let i=0; i<hyouki.length; i++){
            list.push(
                <span onClick={() => onClick(hyouki[i])} key={i.toString()}>
                    {hyouki[i]}
                </span>
            )
        }

        return list;
    }

    return(
        <div className="largeTango">
        {
            complexArr(hyouki, yomi, 0).map( (arr : TextData) => {
                if(arr.ruby === null){
                    return( <span key={arr.data}>{arr.data}</span> );
                }
                else{
                    return(
                        <ruby key={arr.data}>
                            {
                                converKanjiTextList(arr.data)
                            }
                            <rt>{arr.ruby}</rt>
                        </ruby>
                    )
                }
            })
        }
        </div>
    )
}

export { Text, ComplexText, KanjiText };

export default Bun;
