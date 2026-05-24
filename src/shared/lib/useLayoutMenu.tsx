import React from 'react';
import { useTranslation } from 'react-i18next';

//CSS@Antd
import { Tooltip } from 'antd'
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

export type routeTuple = [string, string, string, string | null]
export type itemTuple = [string, string] | 
    [string, string, React.ReactNode | null] | 
    [string, string, React.ReactNode | null, itemTuple[]] |
    [string, string, React.ReactNode | null, itemTuple[] | null, React.ReactNode]

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
    label: string | React.ReactNode,
    key: string,
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

/**
 * 레이아웃에서 메뉴 설정에 관한 Hook
 * 
 * @param name i18n에 사용될 구별자
 * @param routesData 라우팅 정보
 * @param itemesData Menu에 들어갈 아이템 정보
 * @param videoId 비디오 ID (라우팅 시 사용됨)
 * @returns 
 */
export function useLayoutMenu(
    name : string,
    routesData : routeTuple[],
    itemesData : itemTuple[],
    videoId? : string
){
    //i18n
    const { t } = useTranslation(name);

    const routes : Routes[] = routesData.map( (v) => {
        if(videoId !== undefined){
            return getRouteItem(v[0], v[1], v[2].replace('videoId', videoId), v[3]);
        }
        else{
            return getRouteItem(...v)
        }
    });
    const makeMenuItem = (v : itemTuple) : MenuItem => {
        const tooltip = v.length === 5 ? v[4] : null;
        const label = tooltip !== null ? <Tooltip title={tooltip}><span>{t(v[0])}</span></Tooltip> : t(v[0]);
        const children = v.length >= 4 && (v[3] !== null && v[3] !== undefined) ? v[3].map(makeMenuItem) : undefined;
        const icon = v.length >= 3 ? v[2] : undefined;

        return getItem(label, v[1], icon, children);
    }

    const items : MenuItem[] = itemesData.map(makeMenuItem);

    return { routes, items }
}
