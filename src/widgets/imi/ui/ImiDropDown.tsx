//api
import { useUpdateImi } from '../api/useUpdateImi';

//CSS@antd
import { Select } from 'antd';

interface ImiDromDownProps {
    dropDownImi : imiData[] | null;
    iId : string | null;
    fetch : () => void;
}

export const ImiDromDown = ({ dropDownImi, iId, fetch } : ImiDromDownProps ) => {

    const { setIIdHukumu } = useUpdateImi(fetch);

    return(
        <>
        {
            dropDownImi !== null &&
            <Select
                defaultValue={iId}
                style={{ width: '100%' }}
                onChange={setIIdHukumu}
                options={
                    dropDownImi?.map( ( v : imiData ) => {
                        return { value : v.iId, label : v.koText }
                    })
                }
            />
        }
        </>
    )
}