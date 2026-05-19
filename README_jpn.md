# OxxO YouTube

[한국어](README.md) | [日本語]

OxxO YouTubeは、日本語のYouTube動画を学習、翻訳、字幕化するためのデスクトップアプリケーションです。YouTubeの音声とキャプションを収集してタイムラインの下書きを作成し、文単位の編集、韓国語翻訳、ふりがな/単語帳管理、共有URL、PDF/SRT/JSONエクスポートまでをひとつの作業フローにまとめます。

このプロジェクトは、Reactベースのフロントエンド、ExpressベースのローカルAPIサーバー、Electronデスクトップランタイムを組み合わせたフルスタックのデスクトップアプリです。データは基本的にローカルJSON DBへ保存され、パッケージ化されたElectron環境ではユーザーデータパス内の`Asset`ディレクトリを使用します。

## Demo Github Repository

[oxxo-youtube-share](https://github.com/OxxO98/oxxo-youtube-share)

## Demo Site

[demo-stay-with-me](http://oxxo.ddns.net/?l=z8Yuez8RJCRUfTpp)

[demo](http://oxxo.ddns.net/?l=nQl0UMG0JyQvfH0G)

## 技術スタック

| 領域           | 使用技術                                                         |
| -------------- | ---------------------------------------------------------------- |
| Desktop        | Electron 41, Electron Forge, Electron utilityProcess             |
| Frontend       | React 19, TypeScript, React Router, Redux Toolkit, React Context |
| UI             | Ant Design 5, Sass, rc-virtual-list, react-hotkeys-hook          |
| Media          | react-player, Web Audio API, Canvas, fluent-ffmpeg               |
| Backend        | Node.js, Express 5, lowdb, axios, Winston                        |
| AI / NLP       | OpenAI SDK, nodejs-whisper, MeCab, mecab-async, Zod              |
| YouTube        | youtubei.js, yt-dlp fallback                                     |
| Export / Share | jsPDF, file-saver, lz-string, SRT/JSON export                    |
| i18n           | i18next, react-i18next                                           |

## 主な機能

### 動画プロジェクト管理

- YouTube動画URLとタイトルを登録し、直近の編集時間を基準にプロジェクトを並べ替えます。
- タグベースの検索と動画の非表示処理機能を提供します。

### 音声ベースのタイムライン編集

- `react-player`でYouTube動画を再生し、サーバーから受け取った音声ストリームをWeb Audio APIでデコードします。
- 音声サンプルをフレーム単位で正規化したあと、Canvasの波形としてレンダリングします。
- キーボードショートカットとマーカー操作により、1秒/1フレーム移動、開始/終了地点の指定、区間リピート、スクラッチ再生をサポートします。
- `rc-virtual-list`を使用し、長い字幕タイムラインも軽量にレンダリングします。

### 字幕下書き生成

- YouTubeキャプションが存在する場合、`youtubei.js`で日本語または自動生成日本語キャプションを取得します。
- キャプションがない場合や、より精密な認識が必要な場合は、音声をWAVとしてキャッシュし、Whisperベースの音声認識を実行します。
- `OPENAI_API_KEY`がある場合は、OpenAI音声認識およびGPTベースの補正/翻訳フローを使用できます。
- APIキーがない環境では、ローカルの`nodejs-whisper`経路を使用します。
- 長い音声は一定区間に分割して処理したあと、結果を再結合することで、長時間動画も処理できるように設計されています。

### 文、翻訳、単語帳編集

- タイムライン上の日本語文と韓国語翻訳を独立したエンティティとして保存し、代表翻訳を選択できます。
- 日本語文の中で選択した範囲を単語または表現として登録します。
- 表記、読み、意味、漢字情報を分離して保存し、同じ単語の複数表記や複数意味を管理します。
- MeCabベースの形態素解析で候補単語と読みを推薦し、必要に応じてOpenAIで韓国語の意味を補強します。
- 単語帳画面では、単語、表記、漢字、含まれる文を逆引きできます。

### 共有とエクスポート

- タイムラインデータを`lz-string`で圧縮し、URLパラメータとして共有します。
- URL長の制限を考慮し、全体共有、選択範囲共有、軽量テキスト共有、外部短縮アップロード共有を分離しています。
- 編集結果をJSON、YouTube/SRT字幕形式、PDF単語帳としてエクスポートできます。
  > [!CAUTION]
  > JSON形式でエクスポートしてPremiere Proで利用する場合、対象の日本語フォントで全角スペースが漢字一文字の幅と一致するフォントだとスムーズに表示されます。
- 日本語を韓国語発音としてエクスポートできます。
- PDF生成時には日本語/韓国語フォントをjsPDFへ埋め込み、ふりがなと翻訳を含む学習資料を構成します。

## アプリケーション構成

```text
.
+-- electron/           # Electronメインプロセス、ローディングウィンドウ、プリロードブリッジ
+-- server/             # Express APIサーバーとlowdbデータ処理
+-- src/
|   +-- app/            # アプリのエントリーポイント、Redux store、i18n、グローバルスタイル
|   +-- pages/          # ルート単位のページ
|   +-- widgets/        # 画面単位の機能モジュール
|   +-- features/       # モーダル/選択などユーザーアクション単位の機能
|   +-- entities/       # 文、テキスト、漢字などのドメインUIエンティティ
|   +-- shared/         # 共通hooks、context、locale、store、util
+-- public/             # CRA静的リソース
+-- forge.config.js     # Electronパッケージング設定
```

フロントエンドは`app/pages/widgets/features/entities/shared`という階層に分けて機能を配置しています。ルーティングは`src/app/App.tsx`で管理し、中心となる作業画面は`/video/:videoId/*`配下のルートで`MARKING`、`TIMELINE`、`HONYAKU`、`TANGOCHOU`モードを切り替えます。

状態管理は2つの軸に分かれています。

- Redux Toolkit: プレイヤー時間、選択範囲、タイムライン、再取得トリガーのように複数コンポーネントが共有する相互作用状態
- React Context: 現在の動画ID、フレームレート、音声バッファ、波形データのように画面範囲で必要なランタイムデータ

## バックエンド構成

主なAPIグループは次のとおりです。

| Prefix                 | 役割                                       |
| ---------------------- | ------------------------------------------ |
| `/api`                 | ヘルスチェック                             |
| `/yts`                 | YouTube音声ストリーム、キャプション収集    |
| `/ai`                  | チャット、全体/部分音声認識                |
| `/db`                  | 動画、タイムライン、共有、全体DB照会       |
| `/db/bun`              | 文の作成、修正、削除、分割、結合           |
| `/db/translate`        | 翻訳の追加、修正、削除、代表翻訳の選択     |
| `/db/hukumu`           | 文中に含まれる単語の登録/修正/削除         |
| `/db/tango`, `/db/imi` | 単語と意味の照会/管理                      |
| `/db/list`             | 現在の文脈を基準にした単語候補と推薦リスト |
| `/db/tangochou`        | 単語帳、漢字情報、PDFデータ                |
| `/db/auto`             | MeCab/OpenAIベースの自動単語候補生成       |
| `/db/integrity`        | DB整合性チェックおよびバックアップ         |

## データモデル

ローカルDBは`lowdb`で管理されるJSONファイルです。Electron実行時は`app.getPath('userData')/Asset/db/db.json`を使用し、開発サーバー単独実行時は`server/Asset/db/db.json`をデフォルトパスとして使用します。

主要テーブルは次のとおりです。

| コレクション | 説明                                   |
| ------------ | -------------------------------------- |
| `videos`     | 動画メタデータ、タグ、タイムライン配列 |
| `jaBuns`     | 日本語文                               |
| `koBuns`     | 韓国語翻訳文                           |
| `hukumu`     | 文中の単語出現位置と単語参照           |
| `hyouki`     | 表記、読み、ふりがな分解情報           |
| `imi`        | 韓国語の意味                           |
| `tango`      | 単語の論理的なまとまり                 |
| `komu`       | 表記と漢字のマッピング                 |
| `kanji`      | 漢字単位の情報                         |

文、翻訳、単語を単なる文字列として結びつけるのではなく、IDベースで接続することで、同じ単語が複数の文に登場したり、ひとつの単語が複数の表記/意味を持ったりする場合にも再利用できるよう構成しています。

## 実行方法

### 開発実行

```bash
npm install
npm run start
```

`npm run start`はExpressサーバーとCRA開発サーバーを同時に実行します。

### ビルド後のローカル配信

```bash
npm run build
npm run serve
```

`serve`スクリプトはサーバー、静的build配信、ブラウザオープンをまとめて実行します。

### Electron実行およびパッケージング

```bash
npm run build
npm run electron
npm run package
npm run make
```

Electronパッケージングには`electron-forge`を使用し、Windows ZIP/Wix maker設定が含まれています。

## 外部実行環境

一部の機能には、ローカル実行ファイルまたは環境変数が必要です。

- `ffmpeg`: 音声の分割、変換、メタデータ照会に必要です。
- `yt-dlp`: `youtubei.js`によるダウンロードが失敗した場合、音声ダウンロードのfallbackとして使用されます。
- `MeCab`: 日本語形態素解析、読みの推薦、自動単語候補生成に必要です。
- `OPENAI_API_KEY`: OpenAIベースの音声認識補正、翻訳、意味推薦、AIチャットに使用されます。
- Ollama互換ローカルサーバー: OpenAIキーがない場合、`/ai/chat`のローカルチャットfallbackとして`localhost:11434`を参照します。

## 設計ポイント

- デスクトップアプリ内部でバックエンドサーバーを別プロセスとして実行し、メディア処理とファイルI/Oをフロントエンドから分離しています。
- YouTubeキャプション、ローカルWhisper、OpenAI Whisperをすべてサポートし、動画状態と実行環境に応じて下書き生成経路を選択できます。
- 音声波形をフレーム単位でサンプリングし、字幕編集に必要な細かな調整体験を提供します。
- 単語、表記、意味、漢字を分離したデータモデルにより、日本語学習用の単語帳と文の逆参照を実現しています。
- 共有URLには圧縮、範囲制限、軽量化戦略を適用し、ブラウザのURL長制限に対応します。
- DB整合性チェックと日次バックアップロジックをサーバールートに含め、ローカルファイルDBの破損可能性を下げています。

## プロジェクトの性格

このプロジェクトは単なる字幕エディタではなく、日本語動画学習に必要な反復作業を自動化するローカルファーストのデスクトップツールです。動画収集、音声認識、翻訳補正、タイムライン編集、単語帳構築、共有とエクスポートまで続く作業フローを、ひとつのアプリケーション内で処理できるよう設計されています。

## srcモジュール詳細

`src`は、画面ルート、機能ウィジェット、ドメインエンティティ、共通hookを分離する方式で構成されています。特に`shared/hooks`と各`widgets/*/api` hookがサーバーAPI呼び出しと画面更新フローを担当し、`widgets/*/ui`コンポーネントが実際のユーザー作業単位を構成します。

### app

| ファイル/フォルダ        | 役割                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `App.tsx`                | React Routerルーティング、Ant Designダークテーマ、Redux Provider、HotkeysProviderを組み立てる最上位コンポーネントです。 |
| `i18n.ts`                | `ko`、`ja` localeリソースをi18nextに登録し、localStorageの言語設定を初期化します。                                      |
| `reducers/store.tsx`     | Redux Toolkit storeを生成し、`reactPlayer`、`selection`、`timeline`、`refetch` sliceを結合します。                      |
| `reactPlayerReducer.tsx` | 動画再生時間、開始/終了マーカー、選択マーカー、現在再生マーカー時間を管理します。                                       |
| `selectionReducer.tsx`   | 文中のドラッグ選択、選択された文ID、選択offset、現在の単語登録状態、highlight情報を管理します。                         |
| `timelineReducer.tsx`    | サーバーから取得したタイムライン文リストをグローバル状態として保持します。                                              |
| `refetchReducer.tsx`     | 文/タイムラインのrefetchが進行中かどうかを表示し、選択状態とデータ同期を合わせます。                                    |

### pages

| コンポーネント | 役割                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `MainPage`     | サーバーのヘルスチェック後、動画一覧グリッド（`YoutubeGridComp`）をレンダリングします。                                      |
| `YoutubePage`  | 動画作業の中心ページです。プレイヤー、音声波形、タイムライン、翻訳、単語帳、AIチャット、辞書パネルをルート別に組み立てます。 |
| `DBPage`       | 全体の単語/文/動画DBを検索し、ページネーション付きテーブルで照会します。                                                     |
| `NotFoundPage` | 存在しないルートに対するfallback画面です。                                                                                   |

### shared

`shared`は、特定の画面に依存しないランタイム状態、API wrapper、日本語処理ユーティリティ、メディア制御hookを提供します。

| 区分    | 項目                                   | 役割                                                                  |
| ------- | -------------------------------------- | --------------------------------------------------------------------- |
| Context | `ServerContext`                        | API base URLを提供します。デフォルト値は`http://localhost:5000`です。 |
| Context | `VideoContext`                         | 現在の`videoId`とframeRateを下位コンポーネントへ渡します。            |
| Context | `AudioContext`, `FilteredDataContext`  | デコード済み音声バッファと波形サンプルデータを共有します。            |
| Context | `UnicodeContext`                       | 漢字、ひらがな、カタカナ判別用の正規表現範囲を提供します。            |
| Store   | `shared/store/index.ts`                | Redux action、selector、dispatch型を一箇所で再エクスポートします。    |
| Locale  | `locale/ko.ts`, `locale/ja.ts`         | UI文言リソースをコンポーネントnamespace単位で提供します。             |
| Font    | `fonts/jaText.tsx`, `fonts/koText.tsx` | PDF生成時にjsPDFへ埋め込む日本語/韓国語フォントデータを提供します。   |

#### shared hooks

| Hook                                              | 役割                                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `useAxiosGet/Post/Put/Delete`                     | `ServerContext`を基準にaxiosリクエストを実行する共通API hookです。pending状態とparameter stateをあわせて管理します。   |
| `useReactPlayerHook`                              | YouTube player src、再生状態、duration、currentTime、seek制御をReact stateとrefで管理します。                          |
| `useVideoPlayHook`                                | キーボード再生制御、フレーム移動、マーカー指定、区間リピート、スクラッチ再生、自動停止ロジックを担当します。           |
| `useAudioDecode`                                  | `/yts/audioStream`から受け取った音声arraybufferをWeb Audio APIでデコードし、frameRate基準の波形データへ正規化します。  |
| `useTimeline`                                     | `/db/timeline`を呼び出して現在動画のタイムラインを取得し、Redux `timeline.bunIds`へ保存します。                        |
| `useBunRefetch`                                   | 文別refetch callbackをref mapとして保持し、特定の文または全体の文/タイムラインを再取得します。                         |
| `useHandleKeyboard`                               | グローバルショートカットを動画制御関数へマッピングします。space、z/x/c/v、a/s/d/f、b/g/r/nなどの編集キーを処理します。 |
| `useHandleSelection`                              | 文DOMでドラッグ選択したテキスト、文ID、offsetを抽出し、Redux selection stateへ反映します。                             |
| `useHukumu`                                       | 現在の選択範囲がすでに登録済みの単語かどうかを`/db/hukumu/check`で検査し、highlight状態を更新します。                  |
| `useHukumuList`                                   | 選択された単語が現在動画の他の文に登場する一覧を照会します。                                                           |
| `useOsusumeList`                                  | まだ登録されていない選択テキストと一致する既存単語候補を、全体DBから推薦します。                                       |
| `useTangoList`                                    | 現在動画に登録された単語一覧を照会し、サイドリストと単語帳UIへ供給します。                                             |
| `useDebounce`, `useDebounceEffect`, `useThrottle` | 入力、選択、スクロール、API呼び出し頻度を制御する共通時間制御hookです。                                                |
| `useKirikae`, `useMultiKirikae`, `useMultiInput`  | 韓国語音価入力をひらがなへ変換し、漢字/送りがな構造に合わせて読み入力フィールドを分離します。                          |

#### shared lib

| Hook/Util       | 役割                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `useJaText`     | ハングル音価とひらがなの相互変換、日本語の韓国語発音変換、日本語文字種判別、表記/読みquery生成、文修正時の単語offset追跡を実行します。 |
| `useHuri`       | 表記と読みを基に、ふりがな配列と`TextData`構造を生成します。                                                                           |
| `useTimeStamp`  | 秒単位の時間を`HH:mm:ss.SSS`またはframe stamp形式へ変換し、frameRate基準の時間補正を実行します。                                       |
| `useLayoutMenu` | ルートtupleとメニューtupleを受け取り、Ant Design Menu itemと実際の移動pathを生成します。                                               |

### entities

`entities`は、ドメインデータを画面に表示する最小UI単位です。

| エンティティ  | 役割                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `Text`        | 一般的なテキスト断片をレンダリングする基本単位です。                                                   |
| `KanjiText`   | 漢字と読み情報を分離して表示するテキスト単位です。                                                     |
| `ComplexText` | `TextData[]`を基に、表記、ふりがな、offsetを持つ複合日本語テキストをレンダリングします。               |
| `Bun`         | 日本語文と含まれる単語のhighlightを表現する文エンティティです。                                        |
| `TimelineBun` | タイムライン一覧で、ひとつの文、開始/終了時間、移動/修正アクションをあわせて表示するエンティティです。 |

### features

`features`は、特定のユーザーアクションに焦点を当てたモーダルまたは制御単位です。

| Feature            | 主なコンポーネント/Hook                          | 役割                                                                                     |
| ------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `select-locale`    | `SelectLocaleComp`                               | UI言語を韓国語/日本語へ切り替え、i18n設定をlocalStorageへ反映します。                    |
| `bun-update-modal` | `UpdateBunJaTextModalComp`, `useUpdateHukumuBun` | 文テキスト修正時、既存の含まれる単語のoffset変更、削除、維持の有無をあわせて処理します。 |
| `bun-delete-modal` | `DeleteBunModal`, `useDeleteHukumuBun`           | タイムライン文を削除し、接続された含有単語/翻訳参照を整理します。                        |
| `hukumu-update`    | `ModalUpdateHukumu`, `useUpdateHukumu`           | 登録済みの含有単語の表記、読み、接続単語情報を修正します。                               |
| `hukumu-delete`    | `ModalDeleteHukumu`, `useDeleteHukumu`           | 選択された文中の単語登録情報を削除します。                                               |

### widgets

`widgets`は、実際の画面を構成する主要な作業パネルです。多くは`ui`、`api`、`lib`、`model`下位フォルダに分かれており、API hookはExpressルートと1:1に近い単位で接続されます。

| Widget                      | 主な構成                                                                              | 役割                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `layout`                    | `LayoutComp`                                                                          | メイン/DBページの共通サイドバーレイアウトを提供します。                                    |
| `layout-youtube`            | `LayoutYoutube`                                                                       | 動画作業ページのサイドメニュー、上部言語選択、共有モーダルを含むレイアウトです。           |
| `video-grid`                | `YoutubeGridComp`, `NewVideo`, `VideoItemList`, edit/delete modal                     | 動画登録、検索、修正、削除、直近編集基準の一覧照会を担当します。                           |
| `video`                     | `VideoComp`                                                                           | `ReactPlayer`と`AudioWaveComp`を結合し、動画再生と波形編集をひとつの画面に配置します。     |
| `audio-wave`                | `AudioWaveComp`, `useCanvas`, `useRange`, `HelpModal`                                 | 波形Canvasレンダリング、zoom/range制御、クリックseek、ドラッグマーカー指定を処理します。   |
| `timeline`                  | `TimelineComp`, `TimelineControlComp`, `MakeDraftComp`, `SelectPromptModal`           | タイムライン文一覧、文作成/修正、音声認識/キャプションベースの下書き生成を担当します。     |
| `timeline-carousel`         | `TimelineCarouselComp`                                                                | 現在/前/次の文を大きな単位で移動しながらタイムライン文を編集します。                       |
| `timeline-carousel-honyaku` | `TimelineCarouselHonyakuComp`, `useSelect`                                            | 翻訳作業画面で現在文の周辺を移動し、代表翻訳を確認します。                                 |
| `timeline-divide`           | `BunkatsuTimelineComp`, `useDivide`                                                   | 選択文を基準位置で2つの文に分割します。                                                    |
| `timeline-merge`            | `HeigouTimelineComp`, `useMerge`                                                      | 現在の文と次の文を結合します。                                                             |
| `honyaku`                   | `HonyakuComp`, `HonyakuController`, `HonyakuInput`, `HonyakuDropDown`                 | 韓国語翻訳の追加、修正、削除と翻訳候補選択UIを提供します。                                 |
| `honyaku-representive`      | `HonyakuRepresentive`, `useYTBun`                                                     | タイムライン文に表示する代表翻訳を照会し、変更します。                                     |
| `chat-ai`                   | `AiComp`, `useChat`, `useReplace`                                                     | SSEベースのAIチャットを提供し、文脈を引き継いだ翻訳/表現補助を実行します。                 |
| `dictionary`                | `DictionaryComp`                                                                      | 選択テキストに基づく辞書照会または外部検索パネルとして機能します。                         |
| `tango`                     | `TangoComp`, `getYomi`                                                                | 選択した日本語の表記と読みを入力し、単語登録フローへ接続します。                           |
| `tango-db-modal`            | `ModalTangoDB`, `TangoDB`, `AccordianTangoDB`, `useCheckTango`, `usePostNewTango`     | 既存単語DB検索、類似表記グループ分類、新規単語登録を処理します。                           |
| `tango-auto-modal`          | `TangoAutoModal`, `TangoCard`, `MatchedTangoList`, `TangoAutoControl`                 | MeCab解析結果を基に自動単語候補を作成し、既存単語または新規単語としてcommitします。        |
| `imi`                       | `ImiComp`, `ImiDropDown`, 意味API hooks                                               | 選択単語の韓国語意味を登録、修正、削除し、文中単語に意味を接続します。                     |
| `list-compound`             | `CompoundListComp`                                                                    | 含有文一覧、推薦単語、現在動画の単語リストをひとつのパネルにまとめます。                   |
| `list-hukumu`               | `HukumuList`, `HukumuItem`, `useCommit`                                               | 選択単語が含まれる他の文を表示し、単語登録をcommitします。                                 |
| `list-osusume`              | `OsusumeList`, `OsusumeItem`, `useCommit`                                             | 未登録の選択テキストと類似する既存単語候補を推薦し、登録します。                           |
| `list-tango`                | `TangoList`, `TangoItem`, `useMoveTo`                                                 | 現在動画の単語一覧を表示し、その単語が登場した文へ移動します。                             |
| `tangochou`                 | `TangochouComp`, `TangochouTableComp`, `TangoInfo`, `KanjiInfo`, searchコンポーネント | 動画単語帳を表形式で表示し、単語/漢字詳細、登場文、検索を提供します。                      |
| `pdf-modal`                 | `PdfModalComp`, `usePDF`                                                              | 単語帳データをPDFとしてプレビュー/保存し、日本語ふりがなと韓国語意味を含めます。           |
| `share-modal`               | `ShareModalComp`, `SharedRangeBun`, `useShare`, `useHandleShare`                      | 共有URL圧縮、選択範囲共有、軽量共有、JSON/SRT保存、外部short URLアップロードを処理します。 |
| `db`                        | `DBTable`, `DBSearch`, `DBSearchList`                                                 | 全体DB照会、検索、ページネーション、元動画への移動を行う管理画面を構成します。             |
| `input-dynamic`             | `DynamicInputComp`, `useAvailable`                                                    | 表記/読み入力で使用可能な値とフィールド状態を動的に制御します。                            |
| `input-multi-auto`          | `AutoMultiInput`, `AutoLengthInput`                                                   | 複数の断片に分かれた表記/読み入力を、自動長さ調整形式で提供します。                        |

# Legacy repository

[OxxO](https://github.com/OxxO98/OxxO)

YouTube機能だけを分離したもので、デザインと一部の改善事項が適用されています。
