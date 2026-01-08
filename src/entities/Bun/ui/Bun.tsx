import React, {useEffect, useState } from 'react';

//Hooks
import { useAxiosGet } from 'shared/hooks/useAxios';

//entities
import { ComplexText } from 'entities/ComplexText/index';

interface BunProps {
    bId : string;
    bIdRef? : React.RefObject<BIdRef>;
}

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
            }
        }

    }, [resBun, bId, bIdRef, fetchBun]);

    return(
        <>
            {
                resBunLoad === false && hukumuData !== null && 
                    <span className='bun jaText'>
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

export { Bun };
