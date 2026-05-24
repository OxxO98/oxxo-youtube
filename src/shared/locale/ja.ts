const LayoutComp : Locale["LayoutComp"] = {
    HOME : 'ホーム'

}

const LayoutCompYoutube : Locale["LayoutCompYoutube"] = {
    ...LayoutComp,
    VIDEO : 'ビデオ',
    MARKING : 'マーキング',
    TIMELINE : 'タイムライン',
    HONYAKU : '翻訳',
    TANGOCHOU : '単語帳'
}

const SharedModalComp : Locale["SharedModalComp"] = {

    TITLE : 'URLをコピーしてシェアする',
    MESSAGE : {
        SUCCESS : 'コピー成功！',
        ERROR : 'コピー失敗'
    },
    BUTTON : {
        TITLE : 'シェアする',
        CANCLE : 'キャンセル',
        COPY : 'コピーする',
        COPY_RANGE : '範囲を選んでコピーする',
        COPY_LIGHT : 'テキストだけコピーする',
        COPY_UPLOAD : 'アップロードしてシェアする',
        SAVE : 'JSON形式で保存',
        SAVE_CAPTION_JA : '日本語字幕で保存',
        SAVE_CAPTION_KO : '韓国語字幕で保存'
    },
    RANGE_OPTIONS : ['選択範囲', '最大範囲'],
    LIGHT_OPTIONS : ['全部', '日本語だけ', '韓国語だけ']
}

const YoutubeGridComp : Locale["YoutubeGridComp"] = {
    MESSAGE : "無欠性チェック",
    DESCRIPTION : "完了"
}

const NewVideoComp : Locale["NewVideoComp"] = {
    TITLE : '新しい動画を登録します',
    STEPS : ['Youtube URL入力する', 'タイトルを入力する'],
    BUTTON : {
        TITLE : '動画登録',
        NEXT : '次へ',
        PREV : '前へ',
        DONE : '登録'
    },
    LABEL : [ 'Youtube URL', 'タイトル' ]
}

const ModalEditVideo : Locale["ModalEditVideo"] = {
    TITLE : '動画情報を編集しますか',
    BUTTON : {
        MODIFY : '修正',
        CANCLE : '取り消し',
        SWITCH : 'このビデオを隠す'
    },
    ALERT : '警告 : この行動は後戻りできません。'
}
    
const ModalDeleteVideo : Locale["ModalDeleteVideo"] = {
    TITLE : '本当に削除しますか',
    BUTTON : {
        TITLE : '動画削除',
        DELETE : '削除',
        CANCLE : '取り消し'
    }
}

const TimelineControlComp : Locale["TimelineControlComp"] = {
    BUTTON : {
        PART_TRANSCRIPT : 'この部分を音声認識する',
        SAVE_NEW : '作成',
        CANCLE : '取り消し',
        MODIFY_TIME : '時間修正'
    },
    TOOLTIP : {
        SHIFT_ENTER : 'ショートカット : shift + enter',
    }
}

const TimelineBun : Locale["TimelineBun"] = {
    BUTTON : {
        MODIFY : '修正する',
        MOVE : '移動'
    },
    TOOLTIP : {
        ENTER : 'ショートカット : enter',
    }
}

const UpdateBunJaTextModalComp : Locale["UpdateBunJaTextModalComp"] = {
    TITLE : '文章を修正する',
    BUTTON : {
        TITLE : '文章修正',
        CANCLE : '取り消し',
        DONE : '確認'
    },
    CONTENTS : [ '修正される単語', '削除される単語'],
    TOOLTIP : {
        SHIFT_ENTER : 'ショートカット : shift + enter',
        CTRL_ENTER : 'ショートカット : ctrl + enter'
    }
}

const DeleteBunModalComp : Locale["DeleteBunModalComp"] = {
    TITLE : '文章を削除します',
    BUTTON : {
        TITLE : '削除',
        CANCLE : '取り消し',
        DONE : '確認'
    },
    CONTENTS : [ '削除される単語' ]
}

const BunkatsuTimelineComp : Locale['BunkatsuTimelineComp'] = {
    TITLE : '分割しますか',
    BUTTON : {
        TITLE : '分割',
        CANCLE : '取り消し',
        DONE : '分割'
    },
    CONTENTS : [ '分割するところを「/」で表示してください'],
    TOOLTIP : {
      BUNKATSU : 'ショートカット : ctrl + shift + e, ctrl + q',
      CTRL_ENTER : 'ショートカット : ctrl + enter',
      SHIFT_ENTER :'ショートカット : shift + enter'
    }
}

const HeigouTimelineComp : Locale['HeigouTimelineComp'] = {
    TITLE : '併合しますか',
    BUTTON : {
        TITLE : '併合',
        CANCLE : '取り消し',
        DONE : '併合'
    },
    CONTENTS : [ '二つの文章を併合します。代表翻訳文ではない場合は併合されません。'],
    TOOLTIP : {
      HEIGOU : 'ショートカット : ctrl + e',
      CTRL_ENTER : 'ショートカット : ctrl + enter',
      SHIFT_ENTER :'ショートカット : shift + enter'
    }
}

const MakeDrftComp : Locale["MakeDrftComp"] = {
    TITLE : '下書きを作成します',
    BUTTON : {
        TITLE : '下書きを作成する',
        TRANSCRIPT : '音声認識を実行',
        RE_TRANSCRIPT : '音声認識をやり直す',
        DONE_TRANSCRIPT : '音声認識で作成',
        DONE_CAPTION : '字幕で作成',
        CANCLE : '取り消し',
        SWITCH : 'テキストで補正する',
        SWITCH_TRANSLATE : '翻訳文を含む',
        SWITCH_PROMPT : 'プロンプトで補正する'
    },
    ALERT : {
        MESSAGE : '警告',
        DESCRIPTION : [
            "OPEN AIを使っています。環境変数にAPI_KEYがある場合、使えます。",
            "テキストは完全な台本に近い文章にしてください。不必要な内容は除いて入力してください。",
        ]
    },
    TAG : "結合テキスト",
    CONTENTS : ['字幕', '音声認識', '比較']
}

const SelectPromptModal : Locale['SelectPromptModal'] = {
    TITLE : '読み込む動画を選択',
    BUTTON : {
        TITLE : '動画でプロンプトを読み込む',
        CANCLE : '取り消し'
    }
}

const AudioWaveComp : Locale["AudioWaveComp"] = {
    BUTTON : {
        PLAYING : ' ',
        SCRATCH : ' ',
        ZOOM_IN : 'ズームイン',
        ZOOM_OUT : 'ズームアウト'
    }
}

const HelpModal : Locale["HelpModal"] = {
    TITLE : 'ショートカット・ヘルプ',
    BUTTON : {
        TITLE : 'ショートカット・ヘルプ',
        CANCLE : '取り消し'
    },
    CONTENTS : [
        {
            TITLE : '再生コントロール z,x,c,v',
            ITEMS : [
                'z : 1秒前へ', 'x : 1フレーム前へ', 'c : 1フレーム後へ', 'v : 1秒後へ'
            ]
        },
        {
            TITLE : 'スタート・エンド時点を設定する',
            ITEMS : [
                'a : スタート・マーカー選択', 's : スタート・マーカー設定', 'd : エンド・マーカー設定', 'f : エンド・マーカー選択', 'マーカーを選択すると、zxcvで移動できます'
            ]
        },
        {
            TITLE : 'マーカープレイ・コントロール',
            ITEMS : [
                'b : 該当辞典にマーカー設定の後に再生する', 'g : マーカーに移動し、停止する', 
                'z : マーカーの1秒前', 'x : マーカーの1フレーム前', 'c : マーカーの1フレーム後', 'v : マーカーの1秒後'
            ]
        },
        {
            TITLE : '付加機能',
            ITEMS : [
                'r : 繰り返し', 'n : 現在のエンド・マーカーをスタート・マーカーに設定し、再び入力する時、入力した時点をエンド・マーカーに設定する'
            ]
        },
        {
            TITLE : 'タイムライン関連機能',
            ITEMS : [
                '時間入力をクリックすると、該当のマーカーが選択できます', 'x, cで移動可能', 
                'z, v（不安定機能）', 
                'q : 自動にスタート・マーカーの場合、前のエンド・マーカーに設定、エンド・マーカーの場合、後のスタート・マーカーに設定',
                '右と左の方向キーでタイムライン移動ができます'
            ]
        }
    ]
}

const DictionaryComp : Locale['DictionaryComp'] = {
    MESSAGE : {
        ERROR : '使用できない文字が含まれています。'
    }
}

const HonyakuController : Locale['HonyakuController'] = {
    BUTTON : {
        DELETE : '取り消し',
        SAVE_NEW : '新しく保存',
        MODIFY : '修正',
        CANCLE : '取り消し'
    },
    TOOLTIP : {
        SHIFT_ENTER : 'ショートカット : shift + enter',
        CTRL_ENTER : 'ショートカット : ctrl + enter'
    }
}

const HonyakuRepresentive : Locale['HonyakuRepresentive'] = {
    BUTTON : {
        MODIFY : '修正'
    },
    MESSAGE : {
        EMPTY : '翻訳なし'
    },
    TOOLTIP : {
        ENTER : 'ショートカット : enter'
    }
}

const HukumuBunComp : Locale['HukumuBunComp'] = {
    BUTTON : {
        TITLE : '追加登録する'
    }
}

const TangoComp : Locale['TangoComp'] = {
    CONTENTS : {
        YOMI : '読み',
        TANGO : '表記'
    },
    BUTTON : {
        CANCLE : '取り消し',
        MODIFY : '修正'
    }
}

const DynamicInputComp : Locale['DynamicInputComp'] = {
    CONTENTS : {
        YOMI : '読み',
        TANGO : '表記'
    }
}

const ModalTangoDB : Locale['ModalTangoDB'] = {
    TITLE : '新しく単語を登録します',
    BUTTON : {
        TITLE : '確認',
        SAVE_NEW : '新しい単語で登録',
        CANCLE : '取り消し'
    }
}

const AccordianTangoDB : Locale['AccordianTangoDB'] = {
    CONTENTS : {
        SEARCHED_LIST : ["表記と読み完全一致", "一部完全一致", "後方一致", "前方一致", "送り仮名一致", "その他"],
        MESSAGE : '検索結果 : {{count}}個'
    }
}

const TangoDB : Locale['TangoDB'] = {
    CONTENTS : {
        EMPTY : '登録された単語がありません。'
    },
    BUTTON : {
        DONE : 'この単語で登録'
    }
}

const ModalUpdateHukumu : Locale['ModalUpdateHukumu'] = {
    TITLE : '読みを修正しますか',
    BUTTON : {
        TITLE : '修正',
        MODIFY : '修正',
        CANCLE : '取り消し'
    },
    MESSAGE : [
        [ '既存の', 'が', 'に変更されます'],
        [ '変更される前の読み方 : ' ],
        [ '変更された後の読み方 : ' ]
    ]
}

const ModalDeleteHukumu : Locale['ModalDeleteHukumu'] = {
    TITLE : '本当に削除しますか',
    BUTTON : {
        TITLE : '削除',
        DELETE : '削除',
        CANCLE : '取り消し'
    }
}

const ImiComp : Locale['ImiComp'] = {
    CONTENTS : {
        TANGO : '単語',
        IMI : '意味'
    },
    BUTTON : {
        DONE : '確認',
        DELETE : '削除'
    }
}

const Osusume : Locale['Osusume'] = {
    BUTTON : {
        TITLE : '追加登録する'
    }
}

const Tango : Locale['Tango'] = {
    BUTTON : {
        MOVE : '単語帳へ移動'
    }
}

const TangochouRepresentive : Locale['TangochouRepresentive'] = {
    BUTTON : {
        MOVE : 'もっと見る'
    }
}

const TangoInfo : Locale['TangoInfo'] = {
    BUTTON : {
        BACK : '戻る',
        CLOSE : '閉じる'
    }
}

const KanjiInfo : Locale['KanjiInfo'] = {
    BUTTON : {
        MOVE : 'もっと見る',
        BACK : '戻る',
        CLOSE : '閉じる'
    }
}

const PdfModalComp : Locale['PdfModalComp'] = {
    TITLE : 'PDFファイルに変換します',
    BUTTON : {
        TITLE : 'PDFファイルに変換',
        REVIEW : 'プレビュー',
        SAVE : 'ファイルに保存'
    },
    SELECT : {
        TANGO_ONLY : '単語だけ表示する',
        KANJI_ONLY : '漢字だけ表示する',
        BOTH : '全部表示する',
    }
}

const TimelineCarouselComp : Locale['TimelineCarouselComp'] = {
    BUTTON : {
        PREV : '前へ',
        CURR : '現在の時間に移動',
        NEXT : '次へ',
        MODIFY : '修正',
        CANCLE : '取り消し'
    },
    TOOLTIP : {
        ENTER : 'ショートカット : enter',
        SHIFT_ENTER : 'ショートカット : shift + enter',
    }
}

const TimelineCarouselHonyakuComp : Locale['TimelineCarouselHonyakuComp'] = {
    BUTTON : {
        PREV : '前へ',
        CURR : '現在の時間に移動',
        NEXT : '次へ',
    }
}

const AiComp : Locale['AiComp'] = {
    BUTTON : {
        NEW_CHAT : '新しく質問する',
        DONE : '確認',
        CANCLE : '取り消し'
    }
}

const TangoAutoModal : Locale['TangoAutoModal'] = {
    TITLE : '単語を自動で作成してDBに登録します',
    BUTTON : {
        TITLE : '単語を自動で作成',
        PREV : '前へ',
        CANCLE : '取り消し',
        CONFIRM : '確認',
        CONFIRM_WITH_AI : '韓国語の意味と一緒に作成',
        DONE : '確認',
    },
    ALERT : {
        MESSAGE : '警告',
        DESCRIPTION : 'この行動は終わるまで取り消しできません',
    },
    MESSAGE : {
        DONE : '完了'
    }
}

const TangoAutoControl : Locale['TangoAutoControl'] = {
    BUTTON : {
        SKIP : '後で登録する'
    }
}

const TangoCard : Locale['TangoCard'] = {
    CONTENTS : {
        IMI : '韓国語の意味',
        KANJI : '漢字',
        SIZE : '個',
        BASE : '基本形',
        YOMI : '読み'
    }
}

const MatchedTangoList : Locale['MatchedTangoList'] = {
    BUTTON : {
        SAVE_NEW : '新しい単語で登録',
        SAVE : 'この単語で登録'
    }
}

const DBPage : Locale['DBPage'] = {
    SELECT : [
        '表記+読み', '表記', '読み', '意味', '日本語文', '韓国語文'
    ],
    TANGO_COL : [
        ["表記", "意味", "表記まとめ", "個"],
        ["表記", "読み", "発音", "漢字"],
        ["タイトル", "個", "該当の動画へ移動"],
        ["原文", "翻訳文", "発音", "該当の文へ移動"]
    ],
    TEXT_COL : [
        ["タイトル", "個", "該当の動画へ移動"],
        ["原文", "翻訳文", "発音", "該当の文へ移動"],
        ["表記", "読み", "発音"]
    ],
    BUTTON : {
      MOVE_VIDEO : '動画へ移動',
      MOVE_TIMELINE : '文へ移動'
    }
}

//NOT_FOUND
const NotFoundPage : Locale['NotFoundPage'] = {
    MESSAGE : {
        ERROR : 'ページを見つかりませんでした。'
    },
    BUTTON : {
        MOVE : 'ホームに戻る'
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