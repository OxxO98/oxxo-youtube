import type { CSSProperties } from 'react';

export const KeyboardWrapStyle : CSSProperties = {
    display : 'grid',
    gap : 8,
    padding : 16,
    borderRadius : 8,
    background : '#0d1117',
    border : '1px solid #30363d',
    overflowX : 'auto',
    boxShadow : 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
}

export const KeyboardRowStyle : CSSProperties = {
    display : 'flex',
    gap : 8,
    minWidth : 1040,
}

export const LegendStyle : CSSProperties = {
    display : 'flex',
    flexWrap : 'wrap',
    gap : 8,
    margin : '12px 0 16px',
}

export const ShortcutListStyle : CSSProperties = {
    display : 'grid',
    gridTemplateColumns : 'repeat(auto-fit, minmax(260px, 1fr))',
    gap : 8,
    margin : '12px 0 16px',
    maxHeight : 220,
    overflowY : 'auto',
    paddingRight : 4,
}

export const SelectWrapStyle : CSSProperties = {
    display : 'flex',
    justifyContent : 'flex-end',
    marginBottom : 12,
}
