
import { useEffect, useState } from 'react';
//Component
import { YoutubeGridComp } from 'components/YoutubeGridComp'
import { LayoutComp } from 'components/LayoutComp';

//Hook
import { useAxiosGet } from 'hooks/AxiosHook';

//CSS@Antd
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const MainPage = () => {
    const [isOn, setIsOn] = useState(false);
    const { response, fetch, error } = useAxiosGet('/api/test', false, null );

    useEffect( () => {
        let res = response;
        if( res != null && res.message === 'success' ){
            setIsOn(true);
        }
    }, [response])

    useEffect( () => {
        if(error !== null){
            console.log(error);
            const timeout = setTimeout(() => {
                fetch();
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [error])
    
    return(
        <LayoutComp>     
        {
            isOn === false ?
                <Spin indicator={<LoadingOutlined spin />} size="large"/>
            :
            <YoutubeGridComp/>
        }
        </LayoutComp>
    )
}

export { MainPage }