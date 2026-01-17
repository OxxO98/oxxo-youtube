export interface auto_db_matched {
    hyId : string;
    textData : TextData[];
    yomi : string;
    hyouki : string;
    tId : string;
}

export type auto_db_tIdList = auto_db_matched[][];

export interface auto_db_hukumu {
    base : string;
    jaBId : string;
    startOffset : number;
    endOffset : number;
    hyouki : string;
    yomi : string;
    imi? : string;
    textData : TextData[];
    kanjis : string[];
    hyoukiQuery : string;
    yomiQuery : string;
    id : string;
    tIdList : auto_db_tIdList;
}

export type auto_db_tango = auto_db_hukumu[]

export type auto_db = auto_db_tango[]