import { useEffect, useRef } from 'react';

import { GroupColorMap } from '../model/constants';
import type { ShortcutConfig, ShortcutPreset } from '../model/types';
import { getShortcutDisplayGroup, getShortcutKeyComboLabels } from '../lib/shortcut';
import { ShortcutListStyle } from './styles';

interface ShortcutListProps {
    shortcuts : ShortcutConfig[];
    selectedPreset : ShortcutPreset;
    highlightedShortcutIds : string[];
    scrollToShortcutId : string | null;
    onHoverShortcut : (shortcutId : string | null) => void;
}

export const ShortcutList = ({ shortcuts, selectedPreset, highlightedShortcutIds, scrollToShortcutId, onHoverShortcut } : ShortcutListProps) => {
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect( () => {
        if(scrollToShortcutId === null){ return }

        itemRefs.current[scrollToShortcutId]?.scrollIntoView({ block : 'nearest', behavior : 'smooth' });
    }, [scrollToShortcutId])

    return (
        <div style={ShortcutListStyle}>
            {
                shortcuts.map( (shortcut) => {
                    const group = getShortcutDisplayGroup(shortcut, selectedPreset);
                    const colors = GroupColorMap[group ?? shortcut.groups[0]];
                    const isHighlighted = highlightedShortcutIds.includes(shortcut.id);
                    const cardStyle = isHighlighted ? {
                        border : `1px solid ${colors.border}`,
                        background : colors.background,
                        color : colors.color,
                    } : {
                        border : '1px solid #30363d',
                        background : '#161b22',
                        color : '#8b949e',
                    }

                    return (
                        <div
                            key={shortcut.id}
                            ref={(el) => {
                                itemRefs.current[shortcut.id] = el;
                            }}
                            onMouseEnter={() => onHoverShortcut(shortcut.id)}
                            onMouseLeave={() => onHoverShortcut(null)}
                            style={{
                                display : 'grid',
                                gridTemplateColumns : '120px 1fr',
                                gap : 8,
                                alignItems : 'start',
                                padding : 8,
                                borderRadius : 8,
                                ...cardStyle,
                            }}
                        >
                            <strong>{getShortcutKeyComboLabels(shortcut.keyCombos).join(' / ')}</strong>
                            <div style={{ display : 'grid', gap : 2, fontSize : 12, lineHeight : 1.35 }}>
                                <span>{shortcut.label}</span>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}
