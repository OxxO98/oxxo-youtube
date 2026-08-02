export { };

declare global {
    //Response@axios
    export interface ApiResponse<T> {
        data: T;
        message?: 'empty' | 'success' | 'error' | 'done';
    }

    export type RES_GET_TRANSCRIPT = RES_CAPTION[];
    export type REQ_GET_TRANSCRIPT = {
        videoId: string;
        reviseText: string;
        reset?: 'true' | 'false';
    }

    export type RES_GET_TRANSCRIPT_RANGE = string;
    export type REQ_GET_TRANSCRIPT_RANGE = {
        videoId: string;
        startOffset: number;
        endOffset: number;
        reset?: 'true' | 'false';
        lang?: lang;
        offset?: OffsetObj;
    }

    export type RES_GET_VIDEO = RES_VIDEO[];
    export type REQ_GET_VIDEO = {
        opt_disabled?: string;
    };

    export type RES_GET_VIDEO_INFO = RES_VIDEO;
    export type REQ_GET_VIDEO_INFO = {
        videoId: string;
    }

    export type RES_GET_VIDEO_LANG = {
        lang: 'ja' | 'ko' | null;
    }
    export type REQ_GET_VIDEO_LANG = {
        videoId: string;
    }

    export type RES_GET_VIDEO_SEARCH = RES_VIDEO[];
    export type REQ_GET_VIDEO_SEARCH = {
        keyword: string;
    }

    export type RES_GET_TIMELINE = {
        timeline: RES_TIMELINE[];
        direction: TranslationDirection;
    }
    export type REQ_GET_TIMELINE = {
        videoId: string;
    }

    export type RES_GET_SHARE = RES_SHARE[];
    export type REQ_GET_SHARE = {
        videoId: string;
    }

    export type RES_GET_JSON = RES_JSON[];
    export type REQ_GET_JSON = {
        videoId: string;
    }

    export type RES_GET_USERID = {
        userId: string;
    }
    export type REQ_GET_USERID = null;

    export type RES_GET_CAPTION = RES_CAPTION[];
    export type REQ_GET_CAPTION = {
        videoId: string;
    }

    export type RES_GET_BUN = {
        jaText: string;
        hukumuArr: RES_HUKUMU_DATA[];
    }
    export type REQ_GET_BUN = {
        bId: string;
    }

    export type RES_GET_BUN_HUKUMU = RES_HUKUMU_DATA[];

    export type REQ_GET_BUN_HUKUMU = {
        ytBId: string;
    }

    export type RES_GET_HUKUMU = RES_HUKUMU_DATA[];
    export type REQ_GET_HUKUMU = {
        jaBId: string;
    }

    export type RES_GET_HUKUMU_CHECK = RES_HUKUMU_CHECK[];
    export type REQ_GET_HUKUMU_CHECK = {
        jaBId: string;
        startOffset: number;
        endOffset: number;
    }

    export type RES_GET_IMI = RES_IMI;
    export type REQ_GET_IMI = {
        jaBId: string;
        startOffset: number;
        endOffset: number;
    }

    export type RES_GET_INTEGRITY = null;
    export type REQ_GET_INTEGRITY = null;

    export type RES_GET_LIST_HUKUMU = HukumuList[];
    export type REQ_GET_LIST_HUKUMU = {
        videoId: string;
        jaBId: string;
        startOffset: number;
        endOffset: number;
        hyouki: string;
    }

    export type RES_GET_LIST_OSUSUME = OsusumeList[];
    export type REQ_GET_LIST_OSUSUME = {
        hyouki: string;
    }

    export type RES_GET_LIST_TANGO = TangoList[];
    export type REQ_GET_LIST_TANGO = {
        videoId: string;
    }

    export type RES_GET_TANGO = TangoData;
    export type REQ_GET_TANGO = {
        tId: string;
    }

    export type RES_GET_TANGO_CHECK = RES_SEARCH_TANGO[];
    export type REQ_GET_TANGO_CHECK = {
        hyouki: string;
        yomi: string;
        hyoukiQuery: string;
        yomiQuery: string;
    }

    export type RES_GET_TANGOCHOU = RES_TANGOCHOU_LIST;
    export type REQ_GET_TANGOCHOU = {
        videoId: string;
    }

    export type RES_GET_TANGOCHOU_TANGO_INFO = {
        tangoList: TangoBunListData[];
        kanjiList: KanjiData[];
    }
    export type REQ_GET_TANGOCHOU_TANGO_INFO = {
        videoId: string;
        tId: string;
    }

    export type RES_GET_TANGOCHOU_TANGO_LIST = TangoBunData[];
    export type REQ_GET_TANGOCHOU_TANGO_LIST = {
        videoId: string;
        hyId: string;
    }

    export type RES_GET_TANGOCHOU_KANJI_INFO = {
        kanji: KanjiData;
        tangoList: KanjiTangoData[];
    }
    export type REQ_GET_TANGOCHOU_KANJI_INFO = {
        videoId: string;
        kId: string;
    }

    export type RES_GET_TANGOCHOU_SEARCH = RES_TANGOCHOU_LIST;
    export type REQ_GET_TANGOCHOU_SEARCH = {
        videoId: string;
        keyword: string;
        imiKeyword?: string;
    }

    export type RES_GET_TANGOCHOU_PDF = RES_PDF_ALL;
    export type REQ_GET_TANGOCHOU_PDF = {
        videoId: string;
    }

    export type RES_GET_TRANSLATE = {
        jaBun: jaBun | null;
        koBun: koBun | null;
        jaList: jaBun[] | null;
        koList: koBun[] | null;
    }
    export type REQ_GET_TRANSLATE = {
        videoId: string;
        ytBId: string;
    }

    export type RES_GET_TRANSLATE_REP = YTBun;
    export type REQ_GET_TRANSLATE_REP = {
        videoId: string;
        ytBId: string;
    }

    export type RES_GET_TRANSLATE_AUTO = string;
    export type REQ_GET_TRANSLATE_AUTO = {
        videoId: string;
        value: string;
        translationDirection: TranslationDirection;
    }

    export type RES_POST_LIST_HUKUMU = {
        jaBId: string;
    }

    export type REQ_GET_AUTO_DB = {
        videoId: string;
        option?: string;
    };
    
    export type RES_GET_AUTO_YOMI = {
        yomi : string;
    }
    export type REQ_GET_AUTO_YOMI = {
        text : string;
    }

    export type RES_GET_PROMPT = string;
    export type REQ_GET_PROMPT = {
        videoId : string;
    }

    //REQUEST : POST, PUT, DELETE
    export type REQ_POST_TRANSLATE = {
        videoId: string;
        ytBId: string;
        value: string;
    }
    export type REQ_PUT_TRANSLATE = {
        videoId: string;
        ytBId: string;
        value: string;
    }
    export type REQ_DELETE_TRANSLATE = {
        videoId: string;
        ytBId: string;
        koBId: string;
    }

    export type REQ_PUT_TRANSLATE_REP = {
        videoId: string;
        ytBId: string;
        koBId: string;
    }

    export type REQ_POST_LIST_COMMIT = {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        tId: string;
        hyId: string;
    }

    export type REQ_POST_IMI = {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        tId: string;
        value: string;
    }
    export type REQ_PUT_IMI = {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        iId: string;
    }
    export type REQ_DELETE_IMI = {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        iId: string;
    }

    export type REQ_POST_HUKUMU = {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        hyoukiStr: string;
        yomiStr: string;
        hyouki: string;
        yomi: string;
        tId?: string;
    }
    export type REQ_PUT_HUKUMU = {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        hyId: string;
        hyoukiStr: string;
        yomiStr: string;
        hyouki: string;
        yomi: string;
    }
    export type REQ_DELETE_HUKUMU = {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        hyId: string;
    }

    export type REQ_PUT_HUKUMU_BUN = {
        jaBId: string;
        jaText: string;
        modifiedObj: ObjKey;
        deletedObj: ObjKey;
    }
    export type REQ_DELETE_BUN = {
        videoId: string;
        ytBId: string;
    }

    export type REQ_POST_BUN = {
        videoId: string;
        translationDirection: TranslationDirection;
        value: string;
        startTime: number;
        endTime: number;
    }
    export type REQ_PUT_BUN_TIME = {
        videoId: string;
        ytBId: string;
        startTime: number;
        endTime: number;
    }
    export type REQ_PUT_BUN_JATEXT = {
        videoId: string;
        ytBId: string;
        jaText: string;
    }

    export type REQ_PUT_BUNKATSU = {
        videoId: string;
        ytBId: string;
        critTime: number;
        critJaText: number; //분할 위치 오프셋
        critKoText: number; //분할 위치 오프셋
    }
    export type REQ_PUT_HEIGOU = {
        videoId: string;
        ytBId: string;
        nextYtBId: string;
    }

    export type REQ_POST_VIDEO = {
        youtubeSrc: string;
        title: string;
        direction : TranslationDirection;
    }

    export type REQ_PUT_VIDEO = {
        videoId: string;
        newTitle: string;
        newTagsQuery: string;
        disabled: number;
    }

    export type REQ_DELETE_VIDEO = {
        videoId: string;
    }

    export type REQ_PUT_LASTEDIT = {
        videoId : string;
    }

    export type REQ_POST_TRANSCRIPT_TO_BUNS = {
        videoId: string;
    }

    export type REQ_POST_CAPTION_TO_BUNS = {
        videoId: string;
    }

    export type REQ_POST_USERID = {
        userId: string;
    }

    export type REQ_POST_AUTO_DB = {
        videoId: string;
        change: ObjKey;
    }

    //Response legacy
    export interface RES_HUKUMU_DATA {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        hyId: string; //yomi와 통합
        iId: string | null;
        tId: string;
        //Hyouki
        textData: TextData[];
        yomi: string;
        hyouki: string;
    }

    export interface RES_VIDEO {
        title: string;
        src: string;
        tags?: string[];
        direction?: TranslationDirection;
    }

    type BaseTimeline = {
        ytBId: string;
        startTime: number;
        endTime: number;
    };

    export type RES_TIMELINE =
        ( BaseTimeline & {
            jaBId: string;
            koBId: null;
            jaText: string;
            koText?: string;
        } )
        | ( BaseTimeline & {
            jaBId: null;
            koBId: string;
            jaText?: string;
            koText: string;
        } )

    export interface RES_HUKUMU_CHECK {
        jaBId: string;
        tId: string;
        hyId: string;
        hyouki: string;
        yomi: string;
        startOffset: number;
        endOffset: number;
        textData: TextData[]
    }

    export interface RES_IMI {
        iId: string;
        imi: string | null;
        iIds: imiData[]
    }

    export interface RES_SEARCH_TANGO {
        hyouki: string;
        yomi: string;
        tId: string;
        hyId: string;
        hyOffset: number;
        yOffset: number;
        imi: string[];
    }

    export type RES_TANGOCHOU_LIST = TangochouData[]

    export interface RES_TANGO_INFO {
        tangoList: TangoBunData[];
        kanjiList: KanjiData[];
    }

    export interface RES_KANJI_INFO {
        kanji: KanjiData;
        tangoList: KanjiTangoData[]
    }

    //PDF
    export interface RES_PDF_TANGO_DATA {
        //HUKUMU
        jaBId: string;
        startOffset: number;
        endOffset: number;
        hyId: string;
        iId: string | null;
        tId: string;
        //HYOUKI
        textData: TextData[];
        yomi: string;
        hyouki: string;
        //JABUN
        jaText: string;
        //IMI
        imi: string;
        //KOBUN
        koText: string;
    }

    export interface RES_PDF_KANJI_DATA {
        //HUKUMU
        hyId: string;
        tId: string;
        //HYOUKI
        textData: TextData[];
        yomi: string;
        hyouki: string;
        //IMI
        imi: string;
        //KANJI
        kId: string;
        jaText: string; //한자 표기
    }

    export type RES_PDF_TANGO_LIST = RES_PDF_TANGO_DATA[];

    export type RES_PDF_KANJI_LIST = RES_PDF_KANJI_DATA[];

    export interface RES_PDF_ALL {
        tangoList: RES_PDF_TANGO_LIST[];
        kanjiList: RES_PDF_KANJI_LIST[];
    };

    //DB_PAGE
    export interface RES_GET_DB {
        db: db_all;
        pagination: {
            page: number,
            total: number,
            totalPages: number
        }
    }

    export interface REQ_GET_DB {
        page: number;
        limit: number;
    }

    export type RES_GET_DB_READING = string;

    export interface REQ_GET_DB_READING {
        jaText: string;
    }

    export interface RES_GET_SEARCH_DB extends RES_GET_DB {
        type: SearchType
    }

    export interface REQ_GET_SEARCH_DB {
        type: string;
        keyword: string;
        page: number;
        limit: number;
        sort?: string;
    }

    //EXTRA_API
    export interface REQ_PUT_TRANSLATE_REP_JA {
        videoId: string;
        ytBId: string;
        jaBId: string;
    }

    //공유하는 데이터
    export interface RES_SHARE {
        startTime: number;
        endTime: number;
        jaText: string;
        textData: RES_SHARED_TEXTDATA[];
        koText?: string;
    }

    export interface RES_SHARED_TEXTDATA {
        d: string; //data
        r: string | null; //ruby
        o: number; //offset
    }

    export interface RES_SHARED_TIMELINE {
        s: number; //startTime
        e: number; //endTime
        j: RES_SHARED_TEXTDATA[]; //jaText but, Textdata
        k: string; //koText
    }

    export interface RES_SHARED_DATA {
        v: string; //videoId
        t: RES_SHARED_TIMELINE[]; //timeline
    }

    export interface RES_JSON {
        startTime: number;
        endTime: number;
        jaText: string;
        textData: TextData[];
        koText?: string;
        reading?: string;
    }
}