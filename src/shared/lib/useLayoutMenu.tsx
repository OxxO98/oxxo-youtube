import React from 'react';
import { useTranslation } from 'react-i18next';

//CSS@Antd
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

export type routeTuple = [string, string, string, string | null]
export type itemTuple = [string, string] | [string, string, React.ReactNode | null] | [string, string, React.ReactNode | null, itemTuple[]]

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
    label: string,
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
    const items : MenuItem[] = itemesData.map( (v) => {
        if(v.length === 4){
            return getItem(t(v[0]), v[1], v[2], v[3].map( (_) => getItem( t(_[0]) , _[1], _[2]) ))
        }
        else if(v.length === 3){
            return getItem(t(v[0]), v[1], v[2])
        }
        else{
            return getItem(t(v[0]), v[1])
        }
    });

    return { routes, items }
}