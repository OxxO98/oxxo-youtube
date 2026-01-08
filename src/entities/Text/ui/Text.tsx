
//Redux
import { useAppSelector } from 'shared/store';

interface TextProps {
    bId : string | null;
    data : string;
    ruby : string | null;
    offset : number;
}

const Text = ({ bId, data, ruby, offset } : TextProps ) => {

    //Redux
    const { styled } = useAppSelector( (_state) => _state.selection );

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

export { Text };
