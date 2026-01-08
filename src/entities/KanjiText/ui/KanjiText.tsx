

import { useHuri } from 'shared/lib/useHuri';

interface KanjiTextProps {
    hyouki : string;
    yomi : string;
    onClick : ( kanji : string ) => void;
}

//단어장의 한자 정보 onClick이벤트를 위해 만듬.
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
        <div className="largeTango jaText">
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

export { KanjiText };