export type ShortcutGroup = 'marking' | 'timeline' | 'honyaku' | 'video' | 'extra';
export type ShortcutPreset = ShortcutGroup | 'all';

export interface KeyConfig {
    code : string;
    label : string;
    width? : number;
}

export interface ShortcutConfig {
    id : string;
    keyCombos : string[][];
    groups : ShortcutGroup[];
    label : string;
}

export interface GroupColor {
    background : string;
    border : string;
    color : string;
    badge : string;
}

export interface ShortcutPresetOption {
    value : ShortcutPreset;
    label : string;
}
