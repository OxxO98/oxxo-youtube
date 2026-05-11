import { CSSProperties, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

//hooks
import { useLayoutMenu } from 'shared/lib/useLayoutMenu';
import type { routeTuple, itemTuple } from 'shared/lib/useLayoutMenu';

//entities
import { SelectLocaleComp } from 'features/select-locale/index';

//CSS@Antd
import { Menu, Layout, Flex } from 'antd';
import type { MenuProps } from 'antd';
import { 
    HomeOutlined,
    DatabaseOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

interface LayoutCompProps {
    children : any;
}

const MenuStyle : CSSProperties = {
    textAlign : 'left',
    maxHeight : '100vh' 
}

const routeTuples : routeTuple[] = [
    [ '1', 'Home', '/', '' ],
    [ '2', 'DB', '/db/1', 'db' ]
]

const itemTuples : itemTuple[] = [
    [ 'HOME', '1', <HomeOutlined/> ],
    [ 'DB', '2', <DatabaseOutlined/> ]
]

export const LayoutComp = ({ children } : LayoutCompProps ) => {

    const { routes, items } = useLayoutMenu('LayoutComp', routeTuples, itemTuples)

    //State
    const [collapsed, setCollapsed] = useState(false);

    //Hook
    const navigate = useNavigate();
    const location = useLocation();
        
    const getLocation = useCallback( () => {
        let _find = routes.filter( (v) => v.path === location.pathname || ( v.comparePath !== null && location.pathname.split('/')[1] === v.comparePath ) );

        return _find.length !== 0 ? _find[0].key : '2';
    }, [location.pathname, routes])

    const currentLocation = useMemo( () => { return getLocation() }, [getLocation]);

    //Handle
    const handleClick: MenuProps['onClick'] = (e) => {
        let path = routes.filter( (v) => v.key === e.key )[0].path;
        if(path){ navigate(path) }
    };

    return(
        <Layout style={{ height : '100vh', overflow : 'hidden' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} selectedKeys={[currentLocation]} onClick={handleClick} style={MenuStyle}/>
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