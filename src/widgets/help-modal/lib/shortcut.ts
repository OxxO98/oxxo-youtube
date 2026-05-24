import { ArrowKeys, KeyboardRows } from '../model/constants';
import type { ShortcutConfig, ShortcutGroup, ShortcutPreset, ShortcutPresetOption } from '../model/types';

type Translate = (key : string) => string;

export const getShortcutLabel = (t : Translate, labelKey : string) => {
    return t(`SHORTCUTS.${labelKey}`);
}

export const getShortcutMap = (t : Translate) : ShortcutConfig[] => [
    { id : 'prev-sec', keyCombos : [['z']], groups : ['video', 'marking'], label : getShortcutLabel(t, 'PREV_SEC') },
    { id : 'prev-frame', keyCombos : [['x']], groups : ['video', 'marking'], label : getShortcutLabel(t, 'PREV_FRAME') },
    { id : 'next-frame', keyCombos : [['c']], groups : ['video', 'marking'], label : getShortcutLabel(t, 'NEXT_FRAME') },
    { id : 'next-sec', keyCombos : [['v']], groups : ['video', 'marking'], label : getShortcutLabel(t, 'NEXT_SEC') },
    { id : 'select-start', keyCombos : [['a']], groups : ['marking'], label : getShortcutLabel(t, 'SELECT_START') },
    { id : 'mark-start', keyCombos : [['s']], groups : ['marking'], label : getShortcutLabel(t, 'MARK_START') },
    { id : 'mark-end', keyCombos : [['d']], groups : ['marking'], label : getShortcutLabel(t, 'MARK_END') },
    { id : 'select-end', keyCombos : [['f']], groups : ['marking'], label : getShortcutLabel(t, 'SELECT_END') },
    { id : 'marker-play', keyCombos : [['b']], groups : ['video', 'marking'], label : getShortcutLabel(t, 'MARKER_PLAY') },
    { id : 'marker-stop', keyCombos : [['g']], groups : ['video', 'marking'], label : getShortcutLabel(t, 'MARKER_STOP') },
    { id : 'loop', keyCombos : [['r']], groups : ['video', 'marking'], label : getShortcutLabel(t, 'LOOP') },
    { id : 'next-marker-play', keyCombos : [['n']], groups : ['marking'], label : getShortcutLabel(t, 'NEXT_MARKER_PLAY') },
    { id : 'auto-marker', keyCombos : [['q']], groups : ['timeline'], label : getShortcutLabel(t, 'AUTO_MARKER') },
    { id : 'timeline-move', keyCombos : [['left'], ['right']], groups : ['video', 'timeline'], label : getShortcutLabel(t, 'TIMELINE_MOVE') },
    { id : 'go-marking', keyCombos : [['ctrlLeft', '1']], groups : ['extra'], label : getShortcutLabel(t, 'GO_MARKING') },
    { id : 'go-timeline', keyCombos : [['ctrlLeft', '2']], groups : ['extra'], label : getShortcutLabel(t, 'GO_TIMELINE') },
    { id : 'go-honyaku', keyCombos : [['ctrlLeft', '3']], groups : ['extra'], label : getShortcutLabel(t, 'GO_HONYAKU') },
    { id : 'go-tangochou', keyCombos : [['ctrlLeft', '4']], groups : ['extra'], label : getShortcutLabel(t, 'GO_TANGOCHOU') },
    { id : 'confirm', keyCombos : [['ctrlLeft', 'enter']], groups : ['extra', 'marking', 'timeline', 'honyaku' ], label : getShortcutLabel(t, 'CONFIRM') },
    { id : 'cancel', keyCombos : [['shiftLeft', 'enter']], groups : ['extra', 'marking', 'timeline', 'honyaku' ], label : getShortcutLabel(t, 'CANCEL') },
    { id : 'edit-current', keyCombos : [['enter']], groups : ['timeline'], label : getShortcutLabel(t, 'EDIT_CURRENT') },
    { id : 'focus-input', keyCombos : [['tab']], groups : ['marking'], label : getShortcutLabel(t, 'FOCUS_INPUT') },
    { id : 'blur-input', keyCombos : [['backspace']], groups : ['marking'], label : getShortcutLabel(t, 'BLUR_INPUT') },
    { id : 'divide', keyCombos : [['ctrlLeft', 'q'], ['ctrlLeft', 'shiftLeft', 'e']], groups : ['marking'], label : getShortcutLabel(t, 'DIVIDE') },
    { id : 'merge', keyCombos : [['ctrlLeft', 'e']], groups : ['marking'], label : getShortcutLabel(t, 'MERGE') },
];

export const getShortcutPresetOptions = (t : Translate) : ShortcutPresetOption[] => [
    { value : 'all', label : t('GROUPS.ALL') },
    { value : 'marking', label : t('GROUPS.MARKING') },
    { value : 'timeline', label : t('GROUPS.TIMELINE') },
    { value : 'honyaku', label : t('GROUPS.HONYAKU') },
    { value : 'video', label : t('GROUPS.VIDEO') },
    { value : 'extra', label : t('GROUPS.EXTRA') },
];

export const getKeyLabel = (code : string) => {
    for(const row of KeyboardRows){
        const key = row.find( (keyboardKey) => keyboardKey.code === code );
        if(key !== undefined){
            return key.label;
        }
    }

    const arrowKey = ArrowKeys.find( (keyboardKey) => keyboardKey.code === code );
    return arrowKey?.label ?? code.toUpperCase();
}

export const getShortcutKeyLabel = (keyCombo : string[]) => {
    return keyCombo.map(getKeyLabel).join(' + ');
}

export const getShortcutKeyComboLabels = (keyCombos : string[][]) => {
    return keyCombos.map(getShortcutKeyLabel);
}

export const hasShortcutKey = (shortcut : ShortcutConfig, key : string) => {
    return shortcut.keyCombos.some( (keyCombo) => keyCombo.includes(key) );
}

export const getShortcutKeys = (shortcut : ShortcutConfig) => {
    const keys = shortcut.keyCombos.reduce<string[]>( (acc, keyCombo) => [...acc, ...keyCombo], []);
    return Array.from(new Set(keys));
}

export const isShortcutInGroup = (shortcut : ShortcutConfig, group : ShortcutGroup) => {
    return shortcut.groups.includes(group);
}

export const getShortcutDisplayGroup = (shortcut : ShortcutConfig | undefined, selectedPreset : ShortcutPreset) => {
    if(shortcut === undefined){ return null }

    if(selectedPreset !== 'all' && shortcut.groups.includes(selectedPreset)){
        return selectedPreset;
    }

    return shortcut.groups[0];
}
