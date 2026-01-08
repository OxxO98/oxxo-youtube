import { v4 as uuidv4 } from 'uuid';

//hooks
import { useHuri } from 'shared/lib/useHuri';

//entities
import { Text } from 'entities/Text/index';

interface ComplexTextProps {
    bId : string | null;
    data : string;
    ruby : string | null;
    offset : number;
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

export { ComplexText };