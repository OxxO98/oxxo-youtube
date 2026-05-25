const LayoutComp : Locale["LayoutComp"] = {
    HOME : '홈'

}

const LayoutCompYoutube : Locale["LayoutCompYoutube"] = {
    ...LayoutComp,
    VIDEO : '비디오',
    MARKING : '마킹',
    TIMELINE : '타임라인',
    HONYAKU : '번역',
    TANGOCHOU : '단어장'
}

const SharedModalComp : Locale["SharedModalComp"] = {
    TITLE : 'URL을 복사해 공유합니다',
    MESSAGE : {
        SUCCESS : '복사 완료!',
        ERROR : '복사 실패'
    },
    BUTTON : {
        TITLE : '공유하기',
        CANCLE : '취소',
        COPY : '복사하기',
        COPY_RANGE : '선택 범위로 복사하기',
        COPY_LIGHT : '텍스트로만 복사하기',
        COPY_UPLOAD : '업로드해서 공유하기',
        SAVE : 'JSON 파일로 저장',
        SAVE_CAPTION_JA : '일본어 자막으로 저장',
        SAVE_CAPTION_KO : '한국어 자막으로 저장'
    },
    RANGE_OPTIONS : ['선택된 범위', '최대 범위'],
    LIGHT_OPTIONS : ['전부', '일본어만', '한국어만'],
    LABEL_PRESET : '프리셋 선택',
    FONTS_PRESETS : ['각진 고딕1', '각진 고딕2', '둥근 고딕', '손글씨1', '손글씨2', '도트1', '도트2']
}

const YoutubeGridComp : Locale["YoutubeGridComp"] = {
    MESSAGE : "무결성 체크",
    DESCRIPTION : "완료"
}

const NewVideoComp : Locale["NewVideoComp"] = {
    TITLE : '새 영상을 추가합니다',
    STEPS : ['유튜브 주소 입력', '제목 입력'],
    BUTTON : {
        TITLE : '동영상 추가',
        NEXT : '다음',
        PREV : '이전',
        DONE : '확인'
    },
    LABEL : [ 'Youtube URL', '제목' ]
}

const ModalEditVideo : Locale["ModalEditVideo"] = {
    TITLE : '영상을 편집하겠습니까?',
    BUTTON : {
        MODIFY : '수정',
        CANCLE : '취소',
        SWITCH : '이 비디오를 숨기기'
    },
    ALERT : '경고 : 이 행동은 되돌릴 수 없습니다.'
}
    
const ModalDeleteVideo : Locale["ModalDeleteVideo"] = {
    TITLE : '정말 삭제하시겠습니까?',
    BUTTON : {
        TITLE : '영상 삭제',
        DELETE : '삭제',
        CANCLE : '취소'
    }
}

const TimelineControlComp : Locale["TimelineControlComp"] = {
    BUTTON : {
        PART_TRANSCRIPT : '부분 음성인식',
        SAVE_NEW : '작성',
        CANCLE : '취소',
        MODIFY_TIME : '시간 수정'
    },
    TOOLTIP : {
        SHIFT_ENTER : '단축키 : shift + enter'
    }
}

const TimelineBun : Locale["TimelineBun"] = {
    BUTTON : {
        MODIFY : '수정',
        MOVE : '이동'
    },
    TOOLTIP : {
        ENTER : '단축키 : enter',
    }
}

const UpdateBunJaTextModalComp : Locale["UpdateBunJaTextModalComp"] = {
    TITLE : '문장을 수정합니다',
    BUTTON : {
        TITLE : '문장 수정',
        CANCLE : '취소',
        DONE : '확인'
    },
    CONTENTS : [ '수정된 단어', '삭제된 단어'],
    TOOLTIP : {
        SHIFT_ENTER : '단축키 : shift + enter',
        CTRL_ENTER : '단축키 : ctrl + enter'
    }
}

const DeleteBunModalComp : Locale["DeleteBunModalComp"] = {
    TITLE : '문장을 삭제합니다',
    BUTTON : {
        TITLE : '삭제',
        CANCLE : '취소',
        DONE : '확인'
    },
    CONTENTS : [ '삭제된 단어' ]
}

const BunkatsuTimelineComp : Locale['BunkatsuTimelineComp'] = {
    TITLE : '분할 하시겠습니까?',
    BUTTON : {
        TITLE : '분할',
        CANCLE : '취소',
        DONE : '분할'
    },
    CONTENTS : [ '분할할 부분을 "/"로 표시해 주세요.'],
    TOOLTIP : {
      BUNKATSU : '단축키 : ctrl + shift + e, ctrl + q',
      CTRL_ENTER : '단축키 : ctrl + enter',
      SHIFT_ENTER :'단축키 : shift + enter'
    }
}

const HeigouTimelineComp : Locale['HeigouTimelineComp'] = {
    TITLE : '병합 하시겠습니까?',
    BUTTON : {
        TITLE : '병합',
        CANCLE : '취소',
        DONE : '병합'
    },
    CONTENTS : [ '두 문장을 병합 합니다. 대표 번역문이 아닌 경우는 병합되지 않습니다.'],
    TOOLTIP : {
      HEIGOU : '단축키 : ctrl + e',
      CTRL_ENTER : '단축키 : ctrl + enter',
      SHIFT_ENTER :'단축키 : shift + enter'
    }
}

const MakeDrftComp : Locale["MakeDrftComp"] = {
    TITLE : '초안을 작성합니다',
    BUTTON : {
        TITLE : '초안 작성',
        TRANSCRIPT : '음성인식 실행',
        RE_TRANSCRIPT : '음성인식 재작성',
        DONE_TRANSCRIPT : '음성인식으로 작성',
        DONE_CAPTION : '자막으로 작성',
        CANCLE : '닫기',
        SWITCH : '텍스트로 보정',
        SWITCH_TRANSLATE : '번역 포함',
        SWITCH_PROMPT : '프롬프트로 보정'
    },
    ALERT : {
        MESSAGE : '경고',
        DESCRIPTION : [
            "OPEN AI를 사용합니다. 환경변수에 API_KEY가 있는 경우 사용됩니다.",
            "텍스트는 완전한 대본에 가까워야 합니다. 불필요한 내용을 제거하고 사용해주십시오.",
        ]
    },
    TAG : "병합됨",
    CONTENTS : ['자막', '음성인식', '비교']
}

const SelectPromptModal : Locale["SelectPromptModal"] = {
    TITLE : '가져올 영상을 선택',
    BUTTON : {
        TITLE : '영상으로 프롬프트 가져오기',
        CANCLE : '닫기'
    }
}

const AudioWaveComp : Locale["AudioWaveComp"] = {
    BUTTON : {
        PLAYING : ' ',
        SCRATCH : ' ',
        ZOOM_IN : '확대',
        ZOOM_OUT : '축소'
    }
}

const HelpModal : Locale["HelpModal"] = {
    TITLE : '단축키 도움말',
    BUTTON : {
        TITLE : '단축키 도움말',
        CANCLE : '닫기'
    },
    GROUPS : {
        ALL : '전체',
        MARKING : '마킹',
        TIMELINE : '타임라인',
        HONYAKU : '번역',
        VIDEO : '비디오',
        EXTRA : '기타'
    },
    SHORTCUTS : {
        PREV_SEC : '1초 전으로 이동',
        PREV_FRAME : '1프레임 전으로 이동',
        NEXT_FRAME : '1프레임 후로 이동',
        NEXT_SEC : '1초 후로 이동',
        SELECT_START : 'Start 마커 선택',
        MARK_START : '현재 시간을 Start 마커로 설정',
        MARK_END : '현재 시간을 End 마커로 설정',
        SELECT_END : 'End 마커 선택',
        MARKER_PLAY : '해당 시점에 마커 설정 후 재생',
        MARKER_STOP : '마커 위치로 이동하고 정지',
        LOOP : 'Start-End 마커 사이 반복 재생',
        NEXT_MARKER_PLAY : '현재 End를 Start로 설정한 뒤 재생',
        AUTO_MARKER : '이전/다음 타임라인 기준으로 마커 자동 설정',
        TIMELINE_MOVE : '타임라인 이동',
        GO_MARKING : '마킹 화면으로 이동',
        GO_TIMELINE : '타임라인 화면으로 이동',
        GO_HONYAKU : '번역 화면으로 이동',
        GO_TANGOCHOU : '단어장 화면으로 이동',
        CONFIRM : '확인',
        CANCEL : '취소',
        EDIT_CURRENT : '현재 항목 편집',
        FOCUS_INPUT : '편집 상태에서 입력창으로 이동',
        BLUR_INPUT : '입력창 포커스 취소',
        DIVIDE : '분할',
        MERGE : '병합'
    }
}

const DictionaryComp : Locale['DictionaryComp'] = {
    MESSAGE : {
        ERROR : '사용할 수 없는 문자가 포함되어 있음'
    }
}

const HonyakuController : Locale['HonyakuController'] = {
    BUTTON : {
        DELETE : '삭제',
        SAVE_NEW : '새로 저장',
        MODIFY : '수정',
        CANCLE : '취소'
    },
    TOOLTIP : {
        SHIFT_ENTER : '단축키 : shift + enter',
        CTRL_ENTER : '단축키 : ctrl + enter'
    }
}

const HonyakuRepresentive : Locale['HonyakuRepresentive'] = {
    BUTTON : {
        MODIFY : '수정'
    },
    MESSAGE : {
        EMPTY : '번역 없음'
    },
    TOOLTIP : {
        ENTER : '단축키 : enter'
    }
}

const HukumuBunComp : Locale['HukumuBunComp'] = {
    BUTTON : {
        TITLE : '추가하기'
    }
}

const TangoComp : Locale['TangoComp'] = {
    CONTENTS : {
        YOMI : '읽기',
        TANGO : '표기'
    },
    BUTTON : {
        CANCLE : '취소',
        MODIFY : '수정'
    }
}

const DynamicInputComp : Locale['DynamicInputComp'] = {
    CONTENTS : {
        YOMI : '읽기',
        TANGO : '표기'
    }
}

const ModalTangoDB : Locale['ModalTangoDB'] = {
    TITLE : '새 단어를 등록합니다',
    BUTTON : {
        TITLE : '확인',
        SAVE_NEW : '새로운 단어로 등록',
        CANCLE : '취소'
    }
}

const AccordianTangoDB : Locale['AccordianTangoDB'] = {
    CONTENTS : {
        SEARCHED_LIST : ["표기 읽기 완전 일치", "일부 완전 완전 일치", "후방 일치", "전방 일치", "오쿠리가나 일치", "그외"],
        MESSAGE : '검색결과 : {{count}}개'
    }
}

const TangoDB : Locale['TangoDB'] = {
    CONTENTS : {
        EMPTY : '등록된 뜻 없음'
    },
    BUTTON : {
        DONE : '이 단어로 등록'
    }
}

const ModalUpdateHukumu : Locale['ModalUpdateHukumu'] = {
    TITLE : '읽기를 수정하시겠습니까?',
    BUTTON : {
        TITLE : '수정',
        MODIFY : '수정',
        CANCLE : '닫기'
    },
    MESSAGE : [
        [ '기존 ', '가 ', '로 변경됩니다.'],
        [ '변경 전 읽기 : ' ],
        [ '변경 후 읽기 : ' ]
    ]
}

const ModalDeleteHukumu : Locale['ModalDeleteHukumu'] = {
    TITLE : '정말 삭제 하시겠습니까?',
    BUTTON : {
        TITLE : '삭제',
        DELETE : '삭제',
        CANCLE : '닫기'
    }
}

const ImiComp : Locale['ImiComp'] = {
    CONTENTS : {
        TANGO : '단어',
        IMI : '뜻'
    },
    BUTTON : {
        DONE : '확인',
        DELETE : '삭제'
    }
}

const Osusume : Locale['Osusume'] = {
    BUTTON : {
        TITLE : '추가하기'
    }
}

const Tango : Locale['Tango'] = {
    BUTTON : {
        MOVE : '단어장으로 이동'
    }
}

const TangochouRepresentive : Locale['TangochouRepresentive'] = {
    BUTTON : {
        MOVE : '단어로'
    }
}

const TangoInfo : Locale['TangoInfo'] = {
    BUTTON : {
        BACK : '뒤로',
        CLOSE : '닫기'
    }
}

const KanjiInfo : Locale['KanjiInfo'] = {
    BUTTON : {
        MOVE : '단어로',
        BACK : '뒤로',
        CLOSE : '닫기'
    }
}

const PdfModalComp : Locale['PdfModalComp'] = {
    TITLE : 'pdf로 변환 합니다',
    BUTTON : {
        TITLE : 'PDF로 변환',
        REVIEW : '미리보기',
        SAVE : '저장'
    },
    SELECT : {
        TANGO_ONLY : '단어만 표시',
        KANJI_ONLY : '한자만 표시',
        BOTH : '둘다 표시',
    }
}

const TimelineCarouselComp : Locale['TimelineCarouselComp'] = {
    BUTTON : {
        PREV : '이전',
        CURR : '현재 시간 이동',
        NEXT : '다음',
        MODIFY : '수정',
        CANCLE : '취소'
    },
    TOOLTIP : {
        ENTER : '단축키 : enter',
        SHIFT_ENTER : '단축키 : shift + enter'
    }
}

const TimelineCarouselHonyakuComp : Locale['TimelineCarouselHonyakuComp'] = {
    BUTTON : {
        PREV : '이전',
        CURR : '현재 시간 이동',
        NEXT : '다음'
    }
}

const AiComp : Locale['AiComp'] = {
    BUTTON : {
        NEW_CHAT : '새로 질문하기',
        DONE : '확인',
        CANCLE : '취소'
    }
}

const TangoAutoModal : Locale['TangoAutoModal'] = {
    TITLE : '단어를 자동 생성에 DB에 등록합니다',
    BUTTON : {
        TITLE : '단어 자동 생성',
        PREV : '이전',
        CANCLE : '취소',
        CONFIRM : '확인',
        CONFIRM_WITH_AI : '뜻과 함께 생성',
        DONE : '확인',
    },
    ALERT : {
        MESSAGE : '경고',
        DESCRIPTION : '이 행동은 끝날 때 까지 취소할 수 없습니다',
    },
    MESSAGE : {
        DONE : '완료'
    }
}

const TangoAutoControl : Locale['TangoAutoControl'] = {
    BUTTON : {
        SKIP : '나중에 등록하기'
    }
}

const TangoCard : Locale['TangoCard'] = {
    CONTENTS : {
        IMI : '의미',
        KANJI : '한자',
        SIZE : '개',
        BASE : '기본형',
        YOMI : '읽기'
    }
}

const MatchedTangoList : Locale['MatchedTangoList'] = {
    BUTTON : {
        SAVE_NEW : '새로운 단어로 등록',
        SAVE : '이 단어로 등록'
    }
}

const DBPage : Locale['DBPage'] = {
    SELECT : [
        '표기+읽기', '표기', '읽기', '뜻', '일본어 문장', '한국어 문장'
    ],
    TANGO_COL : [
        ["표기", "뜻", "표기 요약", "갯수"],
        ["표기", "읽기", "발음", "한자"],
        ["영상 제목", "갯수", "해당 영상으로 이동"],
        ["원문", "번역문", "발음", "해당 문장으로 이동"]
    ],
    TEXT_COL : [
        ["영상 제목", "갯수", "해당 영상으로 이동"],
        ["원문", "번역문", "발음", "해당 문장으로 이동"],
        ["표기", "읽기", "발음"]
    ],
    BUTTON : {
      MOVE_VIDEO : '이동',
      MOVE_TIMELINE : '이동'
    }
}

//NOT_FOUND
const NotFoundPage : Locale['NotFoundPage'] = {
    MESSAGE : {
        ERROR : '페이지를 찾을 수 없습니다'
    },
    BUTTON : {
        MOVE : '메인으로'
    }
}

export default {
    LayoutComp,
    LayoutCompYoutube,
    
    SharedModalComp,
    YoutubeGridComp,
    NewVideoComp,
    ModalEditVideo,
    ModalDeleteVideo,

    TimelineControlComp,
    TimelineBun,

    UpdateBunJaTextModalComp,
    DeleteBunModalComp,
    BunkatsuTimelineComp,
    HeigouTimelineComp,

    MakeDrftComp,
    SelectPromptModal,

    AudioWaveComp,
    HelpModal,

    DictionaryComp,

    HonyakuController,
    HonyakuRepresentive,

    HukumuBunComp,

    TangoComp,
    DynamicInputComp,
    ModalTangoDB,
    AccordianTangoDB,
    TangoDB,

    ModalUpdateHukumu,
    ModalDeleteHukumu,

    ImiComp,

    Osusume,

    Tango,

    TangochouRepresentive,
    TangoInfo,
    KanjiInfo,
    PdfModalComp,

    TimelineCarouselComp,
    TimelineCarouselHonyakuComp,

    AiComp,

    TangoAutoModal,
    TangoAutoControl,
    TangoCard,
    MatchedTangoList,

    DBPage,

    NotFoundPage,
} as Locale
