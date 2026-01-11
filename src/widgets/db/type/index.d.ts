export interface db_kanji_data {
    kId : string;
    jaText : string;
}

export interface db_hukumu_data {
    title : string;
    src : string;

    ytBId : string;
    jaBId : string;
    jaText : string;
    koBId : string | null;
    koText? : string;
    startTime : number;
    endTime : number;

    startOffset : number;
    endOffset : number;

    hyId : string;
    iId : string | null;
    tId : string;

    hyouki : string;
    yomi : string;
    textData : TextData[];

    imi? : string;

    kanjis : db_kanji_data[];
}

export interface db_tango_data {
    tId : string;
    hukumus : db_hukumu_data[][][];
}

export type db_all = db_tango_data[];