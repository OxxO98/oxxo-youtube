import type { GroupColor, KeyConfig, ShortcutGroup } from './types';

export const KeyboardRows : KeyConfig[][] = [
    [
        { code : 'backquote', label : '`' },
        { code : '1', label : '1' },
        { code : '2', label : '2' },
        { code : '3', label : '3' },
        { code : '4', label : '4' },
        { code : '5', label : '5' },
        { code : '6', label : '6' },
        { code : '7', label : '7' },
        { code : '8', label : '8' },
        { code : '9', label : '9' },
        { code : '0', label : '0' },
        { code : 'minus', label : '-' },
        { code : 'equal', label : '=' },
        { code : 'backspace', label : 'Backspace', width : 2 },
    ],
    [
        { code : 'tab', label : 'Tab', width : 1.5 },
        { code : 'q', label : 'Q' },
        { code : 'w', label : 'W' },
        { code : 'e', label : 'E' },
        { code : 'r', label : 'R' },
        { code : 't', label : 'T' },
        { code : 'y', label : 'Y' },
        { code : 'u', label : 'U' },
        { code : 'i', label : 'I' },
        { code : 'o', label : 'O' },
        { code : 'p', label : 'P' },
        { code : 'bracketLeft', label : '[' },
        { code : 'bracketRight', label : ']' },
        { code : 'backslash', label : '\\', width : 1.5 },
    ],
    [
        { code : 'capsLock', label : 'Caps', width : 1.8 },
        { code : 'a', label : 'A' },
        { code : 's', label : 'S' },
        { code : 'd', label : 'D' },
        { code : 'f', label : 'F' },
        { code : 'g', label : 'G' },
        { code : 'h', label : 'H' },
        { code : 'j', label : 'J' },
        { code : 'k', label : 'K' },
        { code : 'l', label : 'L' },
        { code : 'semicolon', label : ';' },
        { code : 'quote', label : '\'' },
        { code : 'enter', label : 'Enter', width : 2.2 },
    ],
    [
        { code : 'shiftLeft', label : 'Shift', width : 2.3 },
        { code : 'z', label : 'Z' },
        { code : 'x', label : 'X' },
        { code : 'c', label : 'C' },
        { code : 'v', label : 'V' },
        { code : 'b', label : 'B' },
        { code : 'n', label : 'N' },
        { code : 'm', label : 'M' },
        { code : 'comma', label : ',' },
        { code : 'period', label : '.' },
        { code : 'slash', label : '/' },
        { code : 'shiftRight', label : 'Shift', width : 2.7 },
    ],
    [
        { code : 'ctrlLeft', label : 'Ctrl', width : 1.4 },
        { code : 'metaLeft', label : 'Win', width : 1.3 },
        { code : 'altLeft', label : 'Alt', width : 1.3 },
        { code : 'space', label : 'Space', width : 6.2 },
        { code : 'altRight', label : 'Alt', width : 1.3 },
        { code : 'metaRight', label : 'Win', width : 1.3 },
        { code : 'menu', label : 'Menu', width : 1.4 },
        { code : 'ctrlRight', label : 'Ctrl', width : 1.4 },
        { code : 'arrowPad', label : '', width : 3.8 },
    ],
];

export const ArrowKeys : KeyConfig[] = [
    { code : 'up', label : 'Up' },
    { code : 'left', label : 'Left' },
    { code : 'down', label : 'Down' },
    { code : 'right', label : 'Right' },
];

const COLOR_GROUP_BLUE = ['#102033', '#2f81f7', '#d9ecff', '#58a6ff']
const COLOR_GROUP_GREEN = ['#12261b', '#3fb950', '#dcffe4', '#56d364']
const COLOR_GROUP_YELLOW = ['#2d210d', '#d29922', '#fff2cc', '#e3b341']
const COLOR_GROUP_PURPLE = [ '#211733', '#a371f7', '#efe3ff', '#bc8cff']
const COLOR_GROUP_RED = ['#301a1e', '#f85149', '#ffdcd7', '#ff7b72']
const COLOR_GROUP_GRAY = ['#303030', '#464646', '#ffffff', '#696969']

export const GroupColorMap : Record<ShortcutGroup, GroupColor> = {
    marking : { background : COLOR_GROUP_BLUE[0], border : COLOR_GROUP_BLUE[1], color : COLOR_GROUP_BLUE[2], badge : COLOR_GROUP_BLUE[3] },
    timeline : { background : COLOR_GROUP_RED[0], border : COLOR_GROUP_RED[1], color : COLOR_GROUP_RED[2], badge : COLOR_GROUP_RED[3] },
    honyaku : { background : COLOR_GROUP_YELLOW[0], border : COLOR_GROUP_YELLOW[1], color : COLOR_GROUP_YELLOW[2], badge : COLOR_GROUP_YELLOW[3] },
    video : { background : COLOR_GROUP_PURPLE[0], border : COLOR_GROUP_PURPLE[1], color : COLOR_GROUP_PURPLE[2], badge : COLOR_GROUP_PURPLE[3] },
    extra : { background : COLOR_GROUP_GRAY[0], border : COLOR_GROUP_GRAY[1], color : COLOR_GROUP_GRAY[2], badge : COLOR_GROUP_GRAY[3] },
};

export const ShortcutGroups : { group : ShortcutGroup; labelKey : string }[] = [
    { group : 'marking', labelKey : 'GROUPS.MARKING' },
    { group : 'timeline', labelKey : 'GROUPS.TIMELINE' },
    { group : 'honyaku', labelKey : 'GROUPS.HONYAKU' },
    { group : 'video', labelKey : 'GROUPS.VIDEO' },
    { group : 'extra', labelKey : 'GROUPS.EXTRA' },
];
