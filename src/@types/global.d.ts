export { };

declare global {
    type SupportedLanguage = 'ko' | 'ja';

    interface InitialSettings {
        general: {
            language: SupportedLanguage;
        };
        audioDucking: {
            enabled: boolean;
            duckLevel: number;
        };
    }

    interface Window {
        audioDuckingAPI?: {
            setActive: (active: boolean) => void;
        };
        settingsAPI?: {
            getInitialSettings: () => Promise<InitialSettings>;
        };
    }

    export type TranslationDirection = 'ja-ko' | 'ko-ja'

    export interface UnicodeContext {
        kanji: RegExp;
        kanjiStart: RegExp;
        kanjiEnd: RegExp;
        hiragana: RegExp;
        okuri: RegExp;
    }

    export interface UnicodeRangeContext {
        kanji: string;
        hiragana: string;
        katakana: string;
    }

    export interface VideoContext {
        videoId: string;
        frameRate: number;
        translationDirection: TranslationDirection;
    }

    export interface AudioDataContext {
        audioData: AudioBuffer | null;
        audioLoaded: boolean;
        audioError: boolean;
    }

    //일단 대체할 방법이 없어 보이는 부분, 레거시를 제외하고 제한적으로 사용바람
    export interface ObjStringKey<T> extends Array<T> {
        [index: string | number]: T;
    }

    type ObjKey = {
        [index: string | number]: any;
    }

    //type
    export type lang = 'ja' | 'ko';

    //DB Object
    export interface YTBun {
        ytBId: string;
        jaBId: string | null;
        koBId: string | null;
        koText: string;
        jaText: string;
    }

    export interface jaBun {
        jaBId: string;
        jaText: string;
        ytBId: string;
    }

    export interface koBun {
        koBId: string;
        koText: string;
        ytBId: string;
    }
    
    //Data
    export interface HukumuData {
        tId: string;
        hyId: string;
        hyouki: string;
        yomi: string;
        startOffset: number;
        endOffset: number;
        textData: TextData[];
    }

    //LIstComps
    export interface HukumuList {
        jaBId: string;
        jaText: string;
        startOffset: number;
        endOffset: number;
    }

    export interface TangoList {
        tId: string;
        hyouki: string;
        yomi: string;

        list: ComplexText[];
        imi: string[] | null;
    }

    export interface OsusumeList {
        tId: string;
        hyId: string;
        hyouki: string;
        yomi: string;
        imi: string[];
    }

    export interface FilteredData {
        right: number[];
        left: number[];
        length: number;
    }

    export type AudioData = FilteredData;

    export interface TextData {
        data: string;
        ruby: string | null;
        offset: number;
    }

    export interface imiData {
        iId: string;
        koText: string;
        tId: string;
    }

    export interface ComplexText {
        hyouki: string;
        yomi: string;
    }

    export interface TangoData {
        list: ComplexText[];
        imi: string[] | null;
    }

    //Tangochou
    export interface TangochouData {
        tId: string;
        hyId: string;
        textData: TextData[];
        yomi: string;
        hyouki: string;
        imi: string[];
    }

    export interface KanjiData {
        kId: string;
        jaText: string;
    }

    export interface TangoBunListData {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        hyId: string;
        iId: string;
        tId: string;
        textData: TextData[]
        hyouki: string;
        yomi: string;
    }

    export interface TangoBunData {
        jaBId: string;
        startOffset: number;
        endOffset: number;
        hyId: string;
        iId: string;
        tId: string;
        jaText: string;
        ytBId: string;
    }

    export interface KanjiTangoData {
        tId: string;
        hyouki: string;
        yomi: string;
        kId: string;
        jaText: string;
    }

    //others Data
    export interface MultiInput {
        data: string;
        inputBool: boolean;
    }

    export interface SearchText {
        hyouki: string;
        yomi: string;
    }

    export interface TangoDBSearchedList {
        kanzen: RES_SEARCH_TANGO[];
        orSame: RES_SEARCH_TANGO[];
        prefix: RES_SEARCH_TANGO[];
        suffix: RES_SEARCH_TANGO[];
        okuri: RES_SEARCH_TANGO[];
        theOther: RES_SEARCH_TANGO[];
    }

    //Transcription & chatgpt
    export interface TranscriptOption {
        reset?: 'true' | 'false';
        lang?: lang;
        offset?: OffsetObj;
        translate?: 'true' | 'false';
        prompt?: 'true' | 'false';
    }

    export interface ChatHistory {
        user: string;
        response: string;
    }

    export interface RES_CAPTION {
        startTime: number;
        endTime: number;
        text: string;
        translate?: string;
        tag: string;
    }

    export interface RES_TRANSCRIPT {
        startTime: number;
        endTime: number;
        text: string;
        translate?: string;
        tag: string;
    }

    export interface JSON_DATA {
        startTime: number;
        endTime: number;
        hurigana: string;
        jaText: string;
        koText: string;
        reading?: string;
    }

    //Bun
    export interface StyledObj {
        bId: string;
        startOffset: number;
        endOffset: number;
        opt: string;
    }

    export interface RefetchObj {
        fetchBun: () => void;
        fetchTL: () => void;
    }

    export interface OffsetObj {
        startOffset: number;
        endOffset: number;
    }

    export type BIdRef = ObjStringKey<RefetchObj | any>

    export interface RefetchHandles {
        bId?: (bId: string, ...props: any[]) => void;
        reset?: () => void;
        refetch: (bId: string, ...props: any[]) => void;
        refetchAll: () => void;
        resetList: () => void;
    }

    //ReactPlayer
    export interface ReactPlayerState {
        src: string;
        pip: boolean;
        playing: boolean;
        controls: boolean;
        volume: number;
        muted: boolean;
        played: number;
        playedSeconds: number;
        loaded: number;
        duration: number;
        loop: boolean;
        seeking: boolean;
    }

    export interface PlayerHandles {
        handlePausePlay: (playing: boolean) => void;
        handlePlay: () => void;
        handlePause: () => void;
        handleTimeUpdate: () => void;
        handleDurationChange: () => void;
        handleSeek: (time: number) => void;
    }

    export interface AutoStop {
        set: boolean;
        startOffset: number;
        endOffset: number;
        loop: boolean;
    }


    export interface HandleKeyboardObj {
        pauseYT?: () => void;
        prevSec?: () => void;
        nextSec?: () => void;
        prevFrame?: () => void;
        nextFrame?: () => void;
        gotoTime?: (time: number, playBool: boolean | null) => void;
        markStart?: () => void;
        markEnd?: () => void;
        selectStartTime?: () => void;
        selectEndTime?: () => void;
        markerPlay?: () => void;
        markerStop?: () => void;
        loop?: () => void;
        nextMarkerPlay?: () => void;
        custom?: { code: string; action: () => void; }[]
    }

    export interface VideoPlayerHandles {
        gotoTime: (time: number, playBool: boolean | null) => void;
        setScratch: (set: boolean, startOffset: number, endOffset: number, loop: boolean) => void;
        keyboard: HandleKeyboardObj;
        autoStop: AutoStop;
    }
    
    //Etc...
    //jaText Hook
    export interface tracedHukumu extends HukumuData {
        find : { str : string, startOffset : number, endOffset : number } | null;
        tag : 'searched' | 'modified' | 'deleted';
    }

    export interface tracedMed {
        add : number[];
        del : number[];
    }

    //DB Page type
    export type SearchType = 'auto' | 'hyouki' | 'yomi' | 'imi' | 'jaText' | 'koText';
    export type SortType = 'auto' | 'asc' | 'desc' | 'asc_amt' | 'desc_amt' | 'video';

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

        jaTextData : TextData[];
        hukumus : HukumuData[];
        reading : string;
    }

    export interface db_tango_data {
        tId : string;
        hukumus : db_hukumu_data[][][];
        match? : {
            type : 'hyouki' | 'yomi' | 'imi';
            start : number;
            end : number;
            hyoukiIndex : number;
            videoIndex : number;
            bunIndex : number;
        };
    }

    export type db_all = db_tango_data[];

    export interface db_text_data {
        title : string;
        src : string;

        ytBId : string;
        startTime : number;
        
        jaBId : string;
        jaText : string;
        ruby : string;

        jaTextData : TextData[];    
        hukumus : HukumuData[];
        reading : string;
        match : {
            type : 'jaText' | 'koText';
            matchType : 'hukumu' | 'text' | 'etc';
            start : number;
            end : number;
        };
    }

    export interface db_video_data {
        src : string;
        buns : db_text_data[];
    }

    export type db_all_text = db_video_data[]
}
