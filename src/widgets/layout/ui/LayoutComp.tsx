import { CSSProperties, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    textAlign : 'left'
}

const routeTuples : routeTuple[] = [
    [ '1', 'Home', '/', null ],
    [ '2', 'DB', '/db/1', null ]
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

    //Handle
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