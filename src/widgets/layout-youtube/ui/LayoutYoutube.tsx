import React, { CSSProperties, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

//hooks
import { useLayoutMenu } from 'shared/lib/useLayoutMenu';
import type { routeTuple, itemTuple } from 'shared/lib/useLayoutMenu';

//widgets
import { ShareModalComp } from 'widgets/share-modal/index'

//entities
import { SelectLocaleComp } from 'features/select-locale/index';

//Redux
import { useAppDispatch, selectionActions } from 'shared/store';

//CSS@Antd
import { Menu, Layout, Flex } from 'antd';
import type { MenuProps } from 'antd';
import { 
    HomeOutlined,
    YoutubeOutlined,
    FieldTimeOutlined,
    EditOutlined,
    BookOutlined,
    DatabaseOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

interface LayoutCompProps {
    children : any;
}

const MenuStyle : CSSProperties = {
    textAlign : 'left'
}

const routeTuples : routeTuple[] = [
    [ '1', 'Home', '/', null ],
    [ '2', 'Youtube', `/video/videoId/`, '' ],
    [ '3', 'Youtube', `/video/videoId/timeline`, `timeline` ],
    [ '4', 'Youtube', `/video/videoId/honyaku`, `honyaku` ],
    [ '5', 'Youtube', `/video/videoId/tangochou/1`, `tangochou` ],
]

const itemTuples : itemTuple[] = [
    [ 'HOME', '1', <HomeOutlined/> ],
    [ 'VIDEO', 'sub1', <YoutubeOutlined/>, [
            [ 'MARKING', '2', <FieldTimeOutlined />, null, 'ctrl+1' ],
            [ 'TIMELINE', '3', <DatabaseOutlined />, null, 'ctrl+2' ],
            [ 'HONYAKU', '4', <EditOutlined />, null, 'ctrl+3' ],
            [ 'TANGOCHOU', '5', <BookOutlined />, null, 'ctrl+4' ]
        ] 
    ]
]

const { clear } = selectionActions;

export const LayoutCompYoutube = ({ children } : LayoutCompProps ) => {

    const params = useParams();

    const { routes, items } = useLayoutMenu('LayoutCompYoutube', routeTuples, itemTuples, params.videoId);

    //State
    const [collapsed, setCollapsed] = useState(false);

    //Hook
    const navigate = useNavigate();
    const location = useLocation();

    const dispatch = useAppDispatch();
    
    const getLocation = useCallback( () => {
        let _find = routes.filter( (v) => v.path === location.pathname || ( v.comparePath !== null && location.pathname.split('/')[3] === v.comparePath ) );

        return _find.length !== 0 ? _find[0].key : '2';
    }, [location.pathname, routes])

    const currentLocation = useMemo( () => { return getLocation() }, [getLocation]);
    
    //Antd
    const handleClick: MenuProps['onClick'] = (e) => {
        let path = routes.filter( (v) => v.key === e.key )[0].path;
        if(path){ 
            if( path === '/'){
                dispatch( clear() );
            }
            navigate(path); 
        }
    };

    //Hotkeys
    useHotkeys('ctrl+1', () => navigate(routes[1].path) );
    useHotkeys('ctrl+2', () => navigate(routes[2].path) );
    useHotkeys('ctrl+3', () => navigate(routes[3].path) );
    useHotkeys('ctrl+4', () => navigate(routes[4].path) );

    return(
        <Layout style={{ height : '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <Menu theme="dark" defaultSelectedKeys={['2']} defaultOpenKeys={['sub1']} mode="inline" items={items} selectedKeys={[currentLocation]} onClick={handleClick} style={MenuStyle}/>
            </Sider>
            <Layout>
                <Header style={{ padding: 0 }}>
                    <Flex align='center' gap={16} justify='right' style={{ height : '100%', margin : '0 16px'}}>
                        <SelectLocaleComp/>
                        <ShareModalComp/>
                    </Flex>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

let LayoutComp = { Youtube : LayoutCompYoutube }

export default LayoutComp
