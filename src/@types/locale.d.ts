export {};

declare global {
    //i18n
    export interface Locale {
        LayoutComp : LayoutComp;
        LayoutCompYoutube: LayoutCompYoutube;

        SharedModalComp : SharedModalComp;
        YoutubeGridComp : YoutubeGridComp;
        NewVideoComp : NewVideoComp;
        ModalEditVideo : ModalEditVideo;
        ModalDeleteVideo : ModalDeleteVideo;

        TimelineControlComp : TimelineControlComp;
        TimelineBun : TimelineBun;

        UpdateBunJaTextModalComp : UpdateBunJaTextModalComp;
        DeleteBunModalComp : DeleteBunModalComp;
        BunkatsuTimelineComp : BunkatsuTimelineComp;
        HeigouTimelineComp : HeigouTimelineComp;

        MakeDrftComp : MakeDrftComp;
        SelectPromptModal : SelectPromptModal;

        AudioWaveComp : AudioWaveComp;
        HelpModal : HelpModal;

        DictionaryComp : DictionaryComp;

        HonyakuController : HonyakuController;
        HonyakuRepresentive : HonyakuRepresentive;

        HukumuBunComp : HukumuBunComp;

        TangoComp : TangoComp;
        DynamicInputComp : DynamicInputComp;
        ModalTangoDB : ModalTangoDB;
        AccordianTangoDB : AccordianTangoDB;
        TangoDB : TangoDB;

        ModalUpdateHukumu : ModalUpdateHukumu;
        ModalDeleteHukumu : ModalDeleteHukumu;

        ImiComp : ImiComp;

        Osusume : Osusume;

        Tango : Tango;

        TangochouRepresentive : TangochouRepresentive;
        TangoInfo : TangoInfo;
        KanjiInfo : KanjiInfo;
        PdfModalComp : PdfModalComp;

        TimelineCarouselComp : TimelineCarouselComp;
        TimelineCarouselHonyakuComp : TimelineCarouselHonyakuComp;

        AiComp : AiComp;

        TangoAutoModal : TangoAutoModal;
        TangoAutoControl : TangoAutoControl;
        TangoCard : TangoCard;
        MatchedTangoList : MatchedTangoList;

        DBPage : DBPage;

        NotFoundPage : NotFoundPage;
    }

    export interface LayoutComp {
        HOME : string;
    }

    export interface LayoutCompYoutube extends LayoutComp {
        VIDEO : string;
        MARKING : string;
        TIMELINE : string;
        HONYAKU : string;
        TANGOCHOU : string;
    }

    export interface SharedModalComp {
        TITLE : string;
        MESSAGE : {
            SUCCESS : string;
            ERROR : string;
        }
        BUTTON : {
            TITLE : string;
            CANCLE : string;
            COPY : string;
            COPY_RANGE : string;
            COPY_LIGHT : string;
            COPY_UPLOAD : string;
            SAVE : string;
            SAVE_CAPTION_JA : string;
            SAVE_CAPTION_KO : string;
        }
        RANGE_OPTIONS : string[];
        LIGHT_OPTIONS : string[];
        LABEL_PRESET : string;
        FONTS_PRESETS : string[];
    }

    export interface YoutubeGridComp {
        MESSAGE : string;
        DESCRIPTION : string;
    }

    export interface NewVideoComp {
        TITLE : string;
        STEPS : string[];
        BUTTON : {
            TITLE : string;
            NEXT : string;
            PREV : string;
            DONE : string;
        }
        LABEL : string[];
    }

    export interface ModalEditVideo {
        TITLE : string;
        BUTTON : {
            MODIFY : string;
            CANCLE : string;
            SWITCH : string;
        }
        ALERT : string;
    }

    export interface ModalDeleteVideo {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            DELETE : string;
            CANCLE : string;
        }
    }

    export interface TimelineControlComp {
        BUTTON : {
            PART_TRANSCRIPT : string;
            SAVE_NEW : string;
            CANCLE : string;
            MODIFY_TIME : string;
            MODIFY_TEXT : string;
            DELETE : string;
        },
        TOOLTIP : {
            SHIFT_ENTER : string;
        }
    }

    export interface TimelineBun {
        BUTTON : {
            MODIFY : string;
            MOVE : string;
        },
        TOOLTIP : {
            ENTER : string;
        }
    }

    export interface UpdateBunJaTextModalComp {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            CANCLE : string;
            DONE : string;
        }
        CONTENTS : string[];
        TOOLTIP : {
            CTRL_ENTER : string;
            SHIFT_ENTER : string;
        }
    }

    export interface DeleteBunModalComp {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            CANCLE : string;
            DONE : string;
        },
        CONTENTS : string[];
    }
    
    export interface BunkatsuTimelineComp {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            CANCLE : string;
            DONE : string;
        },
        CONTENTS : string[];
        TOOLTIP : {
            BUNKATSU : string;
            CTRL_ENTER : string;
            SHIFT_ENTER : string;
        }
    }

    export interface HeigouTimelineComp {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            CANCLE : string;
            DONE : string;
        },
        CONTENTS : string[];
        TOOLTIP : {
            HEIGOU : string;
            CTRL_ENTER : string;
            SHIFT_ENTER : string;
        }
    }

    export interface MakeDrftComp {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            TRANSCRIPT : string;
            RE_TRANSCRIPT : string;
            DONE_TRANSCRIPT : string;
            DONE_CAPTION : string;
            CANCLE : string;
            SWITCH : string;
            SWITCH_TRANSLATE : string;
            SWITCH_PROMPT : string;
        },
        ALERT : {
            MESSAGE : string;
            DESCRIPTION : string[];
        }
        TAG : string;
        CONTENTS : string[];
    }

    export interface SelectPromptModal {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            CANCLE : string;
        }
    }

    export interface AudioWaveComp {
        BUTTON : {
            PLAYING : string;
            SCRATCH : string;
            ZOOM_IN : string;
            ZOOM_OUT : string;
        }
    }

    export interface HelpModal {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            CANCLE : string;
        }
        GROUPS : {
            ALL : string;
            MARKING : string;
            TIMELINE : string;
            HONYAKU : string;
            VIDEO : string;
            EXTRA : string;
        }
        SHORTCUTS : {
            PREV_SEC : string;
            PREV_FRAME : string;
            NEXT_FRAME : string;
            NEXT_SEC : string;
            SELECT_START : string;
            MARK_START : string;
            MARK_END : string;
            SELECT_END : string;
            MARKER_PLAY : string;
            MARKER_STOP : string;
            LOOP : string;
            NEXT_MARKER_PLAY : string;
            AUTO_MARKER : string;
            TIMELINE_MOVE : string;
            GO_MARKING : string;
            GO_TIMELINE : string;
            GO_HONYAKU : string;
            GO_TANGOCHOU : string;
            CONFIRM : string;
            CANCEL : string;
            EDIT_CURRENT : string;
            FOCUS_INPUT : string;
            BLUR_INPUT : string;
            DIVIDE : string;
            MERGE : string;
        }
    }

    export interface DictionaryComp {
        MESSAGE : {
            ERROR : string;
        }
    }

    export interface HonyakuController {
        BUTTON : {
            DELETE : string;
            SAVE_NEW : string;
            MODIFY : string;
            CANCLE : string;
        }
        TOOLTIP : {
            SHIFT_ENTER : string;
            CTRL_ENTER : string;
        }
    }

    export interface HonyakuRepresentive {
        BUTTON : {
            MODIFY : string;
        },
        MESSAGE : {
            EMPTY : string;
        },
        TOOLTIP : {
            ENTER : string;
        }
    }

    export interface HukumuBunComp {
        BUTTON : {
            TITLE : string;
        }
    }

    export interface TangoComp {
        CONTENTS : {
            YOMI : string;
            TANGO : string;
        }
        BUTTON : {
            CANCLE : string;
            MODIFY : string;
        }
    }

    export interface DynamicInputComp {
        CONTENTS : {
            YOMI : string;
            TANGO : string;
        }
    
    }

    export interface ModalTangoDB {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            SAVE_NEW : string;
            CANCLE : string;
        }
    }

    export interface AccordianTangoDB {
        CONTENTS : {
            SEARCHED_LIST : string[];
            MESSAGE : string;
        }
    }

    export interface TangoDB {
        CONTENTS : {
            EMPTY : string;
        }
        BUTTON : {
            DONE : string;
        }
    }

    export interface ModalUpdateHukumu {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            MODIFY : string;
            CANCLE : string;
        }
        MESSAGE : string[][];
    }

    export interface ModalDeleteHukumu {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            DELETE : string;
            CANCLE : string;
        }
    }

    export interface ImiComp {
        CONTENTS : {
            TANGO : string;
            IMI : string;
        }
        BUTTON : {
            DONE : string;
            DELETE : string;
        }
    }

    export interface Osusume {
        BUTTON : {
            TITLE : string;
        }
    }

    export interface PdfModalComp {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            REVIEW : string;
            SAVE : string;
        },
        SELECT : {
            TANGO_ONLY : string;
            KANJI_ONLY : string;
            BOTH : string;
        }
    }

    export interface Tango {
        BUTTON : {
            MOVE : string;
        }
    }

    export interface TangochouRepresentive {
        BUTTON : {
            MOVE : string;
        }
    }

    export interface TangoInfo {
        BUTTON : {
            BACK : string;
            CLOSE : string;
        }
    }

    export interface KanjiInfo {
        BUTTON : {
            MOVE : string;
            BACK : string;
            CLOSE : string;
        }
    }

    export interface TimelineCarouselComp {
        BUTTON : {
            PREV : string;
            CURR : string;
            NEXT : string;
            MODIFY : string;
            CANCLE : string;
            DELETE : string;
        },
        TOOLTIP : {
            ENTER : string;
            SHIFT_ENTER : string;
        }
    }

    export interface TimelineCarouselHonyakuComp {
        BUTTON : {
            PREV : string;
            CURR : string;
            NEXT : string;
        }
    }

    export interface AiComp {
        BUTTON : {
            NEW_CHAT : string;
            DONE : string;
            CANCLE : string;
        }
    }

    export interface TangoAutoModal {
        TITLE : string;
        BUTTON : {
            TITLE : string;
            PREV : string;
            CANCLE : string;
            CONFIRM : string;
            CONFIRM_WITH_AI : string;
            DONE : string;
        }
        ALERT : {
            MESSAGE : string;
            DESCRIPTION : string;
        }
        MESSAGE : {
            DONE : string;
        }
    }

    export interface TangoAutoControl {
        BUTTON : {
            SKIP : string;
        }
    }

    export interface TangoCard {
        CONTENTS : {
            KANJI : string;
            SIZE : string;
            IMI : string;
            YOMI : string;
            BASE : string;
        }
    }

    export interface MatchedTangoList {
        BUTTON : {
            SAVE_NEW : string;
            SAVE : string;
        }
    }

    export interface DBPage {
        SELECT : string[];
        SELECT_SORT : string[];
        TANGO_COL : string[][];
        TEXT_COL : string[][];
        BUTTON : {
            MOVE_VIDEO : string;
            MOVE_TIMELINE : string;
        }
    }

    //NOT_FOUND
    export interface NotFoundPage {
        MESSAGE : {
            ERROR : string;
        }
        BUTTON : {
            MOVE : string;
        }
    }
}