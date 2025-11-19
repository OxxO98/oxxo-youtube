import React, { CSSProperties, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

//component
import { ShareModalComp } from 'components/ShareModalComp'
import { SelectLocaleComp } from 'components/SelectLocaleComp';

//Redux
import { store } from 'reducers/store'
import { selectionActions } from 'reducers/selectionReducer';

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

const { Header, Content, Sider } = Layout; //Import 위에 있으면 안됨.
type MenuItem = Required<MenuProps>['items'][number];

interface LayoutCompProps {
    children : any;
}

interface Routes {
    key : string;
    label : string;
    path : string;
    comparePath : string | null;
}

function getRouteItem(
    key : string,
    label : string,
    path : string,
    comparePath : string | null,
) : Routes {
    return {
        key, label, path, comparePath
    } as Routes;
}

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode | null,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        children,
        label,
        icon,
    } as MenuItem;
}

const MenuStyle : CSSProperties = {
    textAlign : 'left'
}

const LayoutComp = ({ children } : LayoutCompProps ) => {
    //i18n
    const { t } = useTranslation('LayoutComp');

    const routes : Routes[] = [
        getRouteItem( '1', 'Home', '/', null)
    ]

    const items: MenuItem[] = [
        getItem(t('HOME'), '1', <HomeOutlined/>),
    ];

    //State
    const [collapsed, setCollapsed] = useState(false);

    //Hook
    const navigate = useNavigate();

    //Antd
    const handleClick: MenuProps['onClick'] = (e) => {
        let path = routes.filter( (v) => v.key === e.key )[0].path;
        if(path){ navigate(path) }
    };

    return(
        <Layout style={{ minHeight : '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={handleClick} style={MenuStyle}/>
            </Sider>
            <Layout>
                <Header style={{ padding: 0 }}>
                    <Flex align='center' gap={16} justify='right' style={{ height : '100%', margin : '0 16px'}}>
                        <SelectLocaleComp/>
                    </Flex>
                </Header>
                <Content style={{ height : '100%', margin: '0 16px' }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

const LayoutCompYoutube = ({ children } : LayoutCompProps ) => {
    //i18n
    const { t } = useTranslation('LayoutCompYoutube');

    const params = useParams();

    const routes : Routes[] = useMemo( () => [
        getRouteItem( '1', 'Home', '/', null),
        getRouteItem( '2', 'Youtube', `/video/${params.videoId}/`, ''),
        getRouteItem( '3', 'Youtube', `/video/${params.videoId}/timeline`, `timeline`),
        getRouteItem( '4', 'Youtube', `/video/${params.videoId}/honyaku`, `honyaku`),
        getRouteItem( '5', 'Youtube', `/video/${params.videoId}/tangochou/1`, `tangochou`),
    ], [params.videoId])

    const items: MenuItem[] = [
        getItem( t('HOME'), '1', <HomeOutlined/>),
        getItem( t('VIDEO'), 'sub1', <YoutubeOutlined/> ,[
            getItem( t('MARKING'), '2', <FieldTimeOutlined />),
            getItem( t('TIMELINE'), '3', <DatabaseOutlined />),
            getItem( t('HONYAKU'), '4', <EditOutlined />),
            getItem( t('TANGOCHOU'), '5', <BookOutlined />),
        ]),
    ];

    //State
    const [collapsed, setCollapsed] = useState(false);

    //Hook
    const navigate = useNavigate();
    const location = useLocation();

    const { clear } = selectionActions;
    
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
                store.dispatch( clear() );
            }
            navigate(path); 
        }
    };

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

LayoutComp.Youtube = LayoutCompYoutube;

export { LayoutComp };