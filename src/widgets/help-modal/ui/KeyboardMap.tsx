import type { CSSProperties } from 'react';

import { ArrowKeys, GroupColorMap, KeyboardRows } from '../model/constants';
import type { KeyConfig, ShortcutConfig, ShortcutPreset } from '../model/types';
import { getShortcutDisplayGroup, getShortcutKeys } from '../lib/shortcut';
import { KeyboardRowStyle, KeyboardWrapStyle } from './styles';

interface KeyboardMapProps {
    shortcuts : ShortcutConfig[];
    selectedPreset : ShortcutPreset;
    highlightedShortcutIds : string[];
    onHoverKey : (key : string | null) => void;
}

export const KeyboardMap = ({ shortcuts, selectedPreset, highlightedShortcutIds, onHoverKey } : KeyboardMapProps) => {

    const shortcutsByCode = shortcuts.reduce<Record<string, ShortcutConfig[]>>( (acc, shortcut) => {
        getShortcutKeys(shortcut).forEach( (key) => {
            acc[key] = [...(acc[key] ?? []), shortcut];
        })
        return acc;
    }, {})

    const renderKeyBody = (keyConfig : KeyConfig, compact : boolean = false) => {
        const matchedShortcuts = shortcutsByCode[keyConfig.code] ?? [];
        const highlightedShortcuts = matchedShortcuts.filter( (shortcut) => highlightedShortcutIds.includes(shortcut.id) );
        const displayShortcut = highlightedShortcuts[0] ?? matchedShortcuts[0];
        const group = getShortcutDisplayGroup(displayShortcut, selectedPreset);
        const colors = group ? GroupColorMap[group] : null;
        const isHighlighted = highlightedShortcuts.length !== 0;
        const hasShortcut = matchedShortcuts.length !== 0;

        const keyStyle : CSSProperties = {
            flex : keyConfig.width ?? 1,
            minWidth : 0,
            height : compact ? 34 : 58,
            padding : compact ? 4 : 8,
            borderRadius : 8,
            border : `1px solid ${isHighlighted ? colors?.border ?? '#30363d' : hasShortcut ? '#8b949e' : '#30363d'}`,
            background : isHighlighted ? colors?.background ?? '#161b22' : '#161b22',
            color : isHighlighted ? colors?.color ?? '#8b949e' : matchedShortcuts.length === 0 ? '#484f58' : '#8b949e',
            boxShadow : isHighlighted ? `0 0 0 2px ${colors?.badge ?? '#58a6ff'}, inset 0 -3px 0 rgba(0, 0, 0, 0.35)` : 'inset 0 -3px 0 rgba(0, 0, 0, 0.35)',
            display : 'flex',
            alignItems : 'center',
            justifyContent : 'center',
            position : 'relative',
            fontSize : compact ? 12 : 13,
        }

        const keyNode = (
            <div
                style={keyStyle}
                onMouseEnter={() => {
                    if(matchedShortcuts.length !== 0){
                        onHoverKey(keyConfig.code);
                    }
                }}
                onMouseLeave={() => onHoverKey(null)}
            >
                <strong>{keyConfig.label}</strong>
                {isHighlighted && colors !== null && <span style={{ position : 'absolute', right : 6, top : 6, width : 7, height : 7, borderRadius : 7, background : colors.badge }}/>}
            </div>
        )

        if(matchedShortcuts.length === 0){
            return keyNode;
        }
        
        return (
            <div>{keyNode}</div>
        )
    }

    const renderArrowPad = () => {
        return (
            <div key="arrowPad" style={{ flex : 3.8, minWidth : 0, display : 'grid', gridTemplateColumns : 'repeat(3, 1fr)', gridTemplateRows : 'repeat(2, 1fr)', gap : 6 }}>
                <div/>
                {renderKeyBody(ArrowKeys[0], true)}
                <div/>
                {renderKeyBody(ArrowKeys[1], true)}
                {renderKeyBody(ArrowKeys[2], true)}
                {renderKeyBody(ArrowKeys[3], true)}
            </div>
        )
    }

    const renderKey = (keyConfig : KeyConfig) => {
        if(keyConfig.code === 'arrowPad'){
            return renderArrowPad();
        }

        return (
            <div key={keyConfig.code} style={{ flex : keyConfig.width ?? 1, minWidth : 0 }}>
                {renderKeyBody(keyConfig)}
            </div>
        )
    }

    return (
        <div style={KeyboardWrapStyle}>
            {
                KeyboardRows.map( (row, index) => (
                    <div key={index.toString()} style={KeyboardRowStyle}>
                        {row.map(renderKey)}
                    </div>
                ))
            }
        </div>
    )
}
