
export interface db {
    data : DBData;
    read() : Promise<void>;
    write() : Promise<void>;
}

export interface DBData {
    userId?: string;
    videos : Video[];
    jaBuns : jaBun[];
    koBuns : koBun[];
    hukumu : Hukumu[];
    hyouki : Hyouki[];
    imi : Imi[];
    tango : Tango[];
    komu : Komu[];
    kanji : Kanji[];
}

export type queryHyouki = string;
export type queryYomi = string;

export interface Video {
    title : string;
    src : string;
    timeline : YTB[];
    tags?: string[];
    disabled?: boolean;
    lastEditTime?: number;
    direction? : 'ja-ko' | 'ko-ja';
}

export interface YTB {
    ytBId : string;
    jaBId : string | null;
    koBId : string | null;
    startTime : number;
    endTime : number;
}

export interface jaBun {
    jaBId : string;
    jaText : string;
    ytBId : string;
}

export interface koBun {
    koBId : string;
    koText : string;
    ytBId : string;
}

//Tango 관련
export interface TextData {
    data : string;
    ruby : string | null;
    offset : number;
}

export interface Hyouki {
    hyId : string;
    textData : TextData[];
    yomi : string;
    hyouki : string;
    tId : string;
}

export interface Imi {
    iId : string;
    koText : string;
    tId : string;
}

export interface Tango {
    tId : string;
}

export interface Komu {
    hyId : string;
    kId : string;
}

export interface Kanji {
    kId : string;
    jaText : string;
}

export interface Hukumu {
    jaBId : string;
    startOffset : number;
    endOffset : number;
    hyId : string; //yomi와 통합
    iId : string | null;
    tId : string;
}

//getHukumu
export interface HukumuData {
    jaBId : string;
    startOffset : number;
    endOffset : number;
    hyId : string; //yomi와 통합
    iId : string | null;
    tId : string;
    //Hyouki
    textData : TextData[];
    yomi : string;
    hyouki : string;
}
