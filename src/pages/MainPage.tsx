import { useEffect, useState } from 'react';

//widgets
import { YoutubeGridComp } from 'widgets/video-grid/index'
import { LayoutComp } from 'widgets/layout/index';

//Hook
import { useAxiosGet } from 'shared/hooks/useAxios';

//CSS@Antd
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const MainPage = () => {
    const [isOn, setIsOn] = useState(false);
    const { response, fetch, error } = useAxiosGet('/api/health', false, null );

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
    }, [error, fetch])
    
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