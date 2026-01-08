
//CSS@Antd
import { Flex } from 'antd';
import { useTimeStamp } from 'shared/lib/useTimeStamp';

interface SharedRangeBunProps {
    data : RES_SHARE
}

export const SharedRangeBun = ({ data } : SharedRangeBunProps ) => {

    const { timeToTS } = useTimeStamp()

    return(
        <Flex vertical>
            <Flex justify='space-between'>
                <div>{ timeToTS(data.startTime) }</div>
                <div>{ timeToTS(data.endTime) }</div>
            </Flex>
            <div>{data.jaText}</div>
            <div>{data.koText}</div>
        </Flex>
    )
}
