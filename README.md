# OxxO YouTube

한국어 | [日本語](README_jpn.md)

OxxO YouTube는 일본어 YouTube 영상을 학습, 번역, 자막화하기 위한 데스크톱 애플리케이션입니다. YouTube 오디오와 캡션을 수집해 타임라인 초안을 만들고, 문장 단위 편집, 한국어 번역, 후리가나/단어장 관리, 공유 URL 및 PDF/SRT/JSON 내보내기까지 하나의 작업 흐름으로 묶습니다.

이 프로젝트는 React 기반 프론트엔드, Express 기반 로컬 API 서버, Electron 데스크톱 런타임을 함께 구성한 풀스택 데스크톱 앱입니다. 데이터는 기본적으로 로컬 JSON DB에 저장되며, 패키징된 Electron 환경에서는 사용자 데이터 경로의 `Asset` 디렉터리를 사용합니다.

## Demo Github Repository

[oxxo-youtube-share](https://github.com/OxxO98/oxxo-youtube-share)

## Demo Site

[demo-stay-with-me](http://oxxo.ddns.net/?l=z8Yuez8RJCRUfTpp)

[demo](http://oxxo.ddns.net/?l=nQl0UMG0JyQvfH0G)

## 기술 스택

| 영역           | 사용 기술                                                        |
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

## 주요 기능

### 영상 프로젝트 관리

- YouTube 영상 URL과 제목을 등록하고, 최근 편집 시간 기준으로 프로젝트를 정렬합니다.
- 태그 기반 검색과 영상 숨김 처리 기능을 제공합니다.

### 오디오 기반 타임라인 편집

- `react-player`로 YouTube 영상을 재생하고, 서버에서 받은 오디오 스트림을 Web Audio API로 디코딩합니다.
- 오디오 샘플을 프레임 단위로 정규화한 뒤 Canvas 파형으로 렌더링합니다.
- 키보드 단축키와 마커 조작으로 1초/1프레임 이동, 시작/종료 지점 지정, 구간 반복, 스크래치 재생을 지원합니다.
- `rc-virtual-list`를 사용해 긴 자막 타임라인도 가볍게 렌더링합니다.

### 자막 초안 생성

- YouTube 캡션이 존재하면 `youtubei.js`로 일본어 또는 자동 생성 일본어 캡션을 가져옵니다.
- 캡션이 없거나 더 정교한 인식이 필요한 경우 오디오를 WAV로 캐싱하고 Whisper 기반 음성 인식을 수행합니다.
- `OPENAI_API_KEY`가 있으면 OpenAI 음성 인식 및 GPT 기반 보정/번역 흐름을 사용할 수 있습니다.
- API 키가 없는 환경에서는 로컬 `nodejs-whisper` 경로를 사용합니다.
- 긴 오디오는 일정 구간으로 분할 처리한 뒤 결과를 다시 병합해 긴 영상도 처리할 수 있게 설계되어 있습니다.

### 문장, 번역, 단어장 편집

- 타임라인의 일본어 문장과 한국어 번역을 독립된 엔티티로 저장하고 대표 번역을 선택할 수 있습니다.
- 일본어 문장 안에서 선택한 구간을 단어 또는 표현으로 등록합니다.
- 표기, 읽기, 의미, 한자 정보를 분리해 저장해 같은 단어의 여러 표기와 여러 의미를 관리합니다.
- MeCab 기반 형태소 분석으로 후보 단어와 읽기를 추천하고, 필요 시 OpenAI로 한국어 의미를 보강합니다.
- 단어장 화면에서 단어, 표기, 한자, 포함 문장을 역추적할 수 있습니다.

### 공유와 내보내기

- 타임라인 데이터를 `lz-string`으로 압축해 URL 파라미터로 공유합니다.
- URL 길이 제한을 고려해 전체 공유, 선택 범위 공유, 경량 텍스트 공유, 외부 단축 업로드 공유를 분리했습니다.
- 편집 결과를 JSON, YouTube/SRT 자막 형식, PDF 단어장으로 내보낼 수 있습니다.
  > [!CAUTION]
  > JSON 형식으로 내보내서, Premiere Pro에서 활용할 시, 해당 일본어 폰트에서 전각 공백이 한자 한글자의 크기와 일치하는 폰트에서 원활히 표시 됩니다.
- 일본어를 한국어 발음으로 내보낼 수 있습니다.
- PDF 생성 시 일본어/한국어 폰트를 jsPDF에 임베드해 후리가나와 번역이 포함된 학습 자료를 구성합니다.

## 애플리케이션 구조

```text
.
+-- electron/           # Electron 메인 프로세스, 로딩 창, 프리로드 브리지
+-- server/             # Express API 서버와 lowdb 데이터 처리
+-- src/
|   +-- app/            # 앱 진입점, Redux store, i18n, 전역 스타일
|   +-- pages/          # 라우트 단위 페이지
|   +-- widgets/        # 화면 단위 기능 모듈
|   +-- features/       # 모달/선택 등 사용자 액션 단위 기능
|   +-- entities/       # 문장, 텍스트, 한자 등 도메인 UI 엔티티
|   +-- shared/         # 공통 hooks, context, locale, store, util
+-- public/             # CRA 정적 리소스
+-- forge.config.js     # Electron 패키징 설정
```

프론트엔드는 `app/pages/widgets/features/entities/shared`로 계층을 나누어 기능을 배치했습니다. 라우팅은 `src/app/App.tsx`에서 관리하며, 핵심 작업 화면은 `/video/:videoId/*` 하위 라우트로 `MARKING`, `TIMELINE`, `HONYAKU`, `TANGOCHOU` 모드를 전환합니다.

상태 관리는 두 축으로 나뉩니다.

- Redux Toolkit: 플레이어 시간, 선택 영역, 타임라인, 리패치 트리거처럼 여러 컴포넌트가 공유하는 상호작용 상태
- React Context: 현재 영상 ID, 프레임레이트, 오디오 버퍼, 파형 데이터처럼 화면 범위에서 필요한 런타임 데이터

## 백엔드 구조

주요 API 그룹은 다음과 같습니다.

| Prefix                 | 역할                                  |
| ---------------------- | ------------------------------------- |
| `/api`                 | 헬스 체크                             |
| `/yts`                 | YouTube 오디오 스트림, 캡션 수집      |
| `/ai`                  | 채팅, 전체/부분 음성 인식             |
| `/db`                  | 영상, 타임라인, 공유, 전체 DB 조회    |
| `/db/bun`              | 문장 생성, 수정, 삭제, 분할, 병합     |
| `/db/translate`        | 번역 추가, 수정, 삭제, 대표 번역 선택 |
| `/db/hukumu`           | 문장 내 포함 단어 등록/수정/삭제      |
| `/db/tango`, `/db/imi` | 단어와 의미 조회/관리                 |
| `/db/list`             | 현재 문맥 기준 단어 후보와 추천 목록  |
| `/db/tangochou`        | 단어장, 한자 정보, PDF 데이터         |
| `/db/auto`             | MeCab/OpenAI 기반 자동 단어 후보 생성 |
| `/db/integrity`        | DB 무결성 검사 및 백업                |

## 데이터 모델

로컬 DB는 `lowdb`로 관리되는 JSON 파일입니다. Electron 실행 시 `app.getPath('userData')/Asset/db/db.json`을 사용하고, 개발 서버 단독 실행 시에는 `server/Asset/db/db.json`을 기본 경로로 사용합니다.

핵심 테이블은 다음과 같습니다.

| 컬렉션   | 설명                                 |
| -------- | ------------------------------------ |
| `videos` | 영상 메타데이터, 태그, 타임라인 배열 |
| `jaBuns` | 일본어 문장                          |
| `koBuns` | 한국어 번역문                        |
| `hukumu` | 문장 내 단어 포함 위치와 단어 참조   |
| `hyouki` | 표기, 읽기, 후리가나 분해 정보       |
| `imi`    | 한국어 의미                          |
| `tango`  | 단어의 논리적 묶음                   |
| `komu`   | 표기와 한자 간 매핑                  |
| `kanji`  | 한자 단위 정보                       |

문장, 번역, 단어를 직접 문자열로만 묶지 않고 ID 기반으로 연결해 같은 단어가 여러 문장에 등장하거나 하나의 단어가 여러 표기/의미를 가질 때 재사용할 수 있도록 구성했습니다.

## 실행 방법

### 개발 실행

```bash
npm install
npm run start
```

`npm run start`는 Express 서버와 CRA 개발 서버를 동시에 실행합니다.

### 빌드 후 로컬 서빙

```bash
npm run build
npm run serve
```

`serve` 스크립트는 서버, 정적 build 서빙, 브라우저 오픈을 함께 수행합니다.

### Electron 실행 및 패키징

```bash
npm run build
npm run electron
npm run package
npm run make
```

Electron 패키징은 `electron-forge`를 사용하며, Windows ZIP/Wix maker 설정이 포함되어 있습니다.

## 외부 실행 환경

일부 기능은 로컬 실행 파일 또는 환경 변수가 필요합니다.

- `ffmpeg`: 오디오 분할, 변환, 메타데이터 조회에 필요합니다.
- `yt-dlp`: `youtubei.js` 다운로드가 실패할 경우 오디오 다운로드 fallback으로 사용됩니다.
- `MeCab`: 일본어 형태소 분석, 읽기 추천, 자동 단어 후보 생성에 필요합니다.
- `OPENAI_API_KEY`: OpenAI 기반 음성 인식 보정, 번역, 의미 추천, AI 채팅에 사용됩니다.
- Ollama 호환 로컬 서버: OpenAI 키가 없을 때 `/ai/chat`의 로컬 채팅 fallback으로 `localhost:11434`를 참조합니다.

## 설계 포인트

- 데스크톱 앱 내부에서 백엔드 서버를 별도 프로세스로 실행해 미디어 처리와 파일 I/O를 프론트엔드에서 분리했습니다.
- YouTube 캡션, 로컬 Whisper, OpenAI Whisper를 모두 지원해 영상 상태와 실행 환경에 따라 초안 생성 경로를 선택할 수 있습니다.
- 오디오 파형을 프레임 단위로 샘플링해 자막 편집에 필요한 미세 조정 경험을 제공합니다.
- 단어, 표기, 의미, 한자를 분리한 데이터 모델로 일본어 학습용 단어장과 문장 역참조를 구현했습니다.
- 공유 URL은 압축, 범위 제한, 경량화 전략을 적용해 브라우저 URL 길이 제한에 대응합니다.
- DB 무결성 검사와 일일 백업 로직을 서버 라우트에 포함해 로컬 파일 DB의 손상 가능성을 낮춥니다.

## 프로젝트 성격

이 프로젝트는 단순한 자막 편집기가 아니라 일본어 영상 학습에 필요한 반복 작업을 자동화하는 로컬 퍼스트 데스크톱 도구입니다. 영상 수집, 음성 인식, 번역 보정, 타임라인 편집, 단어장 구축, 공유와 내보내기까지 이어지는 작업 흐름을 하나의 애플리케이션 안에서 처리하도록 설계되어 있습니다.

## src 모듈 상세

`src`는 화면 라우트, 기능 위젯, 도메인 엔티티, 공통 hook을 분리하는 방식으로 구성되어 있습니다. 특히 `shared/hooks`와 각 `widgets/*/api` hook이 서버 API 호출과 화면 갱신 흐름을 담당하고, `widgets/*/ui` 컴포넌트가 실제 사용자 작업 단위를 구성합니다.

### app

| 파일/폴더                | 역할                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `App.tsx`                | React Router 라우팅, Ant Design 다크 테마, Redux Provider, HotkeysProvider를 조립하는 최상위 컴포넌트입니다. |
| `i18n.ts`                | `ko`, `ja` locale 리소스를 i18next에 등록하고 localStorage의 언어 설정을 초기화합니다.                       |
| `reducers/store.tsx`     | Redux Toolkit store를 생성하고 `reactPlayer`, `selection`, `timeline`, `refetch` slice를 결합합니다.         |
| `reactPlayerReducer.tsx` | 영상 재생 시간, 시작/종료 마커, 선택 마커, 현재 재생 마커 시간을 관리합니다.                                 |
| `selectionReducer.tsx`   | 문장 내 드래그 선택, 선택된 문장 ID, 선택 offset, 현재 단어 등록 상태, highlight 정보를 관리합니다.          |
| `timelineReducer.tsx`    | 서버에서 가져온 타임라인 문장 목록을 전역 상태로 유지합니다.                                                 |
| `refetchReducer.tsx`     | 문장/타임라인 refetch가 진행 중인지 표시해 선택 상태와 데이터 동기화를 맞춥니다.                             |

### pages

| 컴포넌트       | 역할                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `MainPage`     | 서버 헬스 체크 후 영상 목록 그리드(`YoutubeGridComp`)를 렌더링합니다.                                                     |
| `YoutubePage`  | 영상 작업의 중심 페이지입니다. 플레이어, 오디오 파형, 타임라인, 번역, 단어장, AI 채팅, 사전 패널을 라우트별로 조립합니다. |
| `DBPage`       | 전체 단어/문장/영상 DB를 검색하고 페이지네이션 테이블로 조회합니다.                                                       |
| `NotFoundPage` | 존재하지 않는 라우트에 대한 fallback 화면입니다.                                                                          |

### shared

`shared`는 특정 화면에 종속되지 않는 런타임 상태, API wrapper, 일본어 처리 유틸리티, 미디어 제어 hook을 제공합니다.

| 구분    | 항목                                   | 역할                                                                 |
| ------- | -------------------------------------- | -------------------------------------------------------------------- |
| Context | `ServerContext`                        | API base URL을 제공합니다. 기본값은 `http://localhost:5000`입니다.   |
| Context | `VideoContext`                         | 현재 `videoId`와 frameRate를 하위 컴포넌트에 전달합니다.             |
| Context | `AudioContext`, `FilteredDataContext`  | 디코딩된 오디오 버퍼와 파형 샘플 데이터를 공유합니다.                |
| Context | `UnicodeContext`                       | 한자, 히라가나, 가타카나 판별용 정규식 범위를 제공합니다.            |
| Store   | `shared/store/index.ts`                | Redux action, selector, dispatch 타입을 한 곳에서 재수출합니다.      |
| Locale  | `locale/ko.ts`, `locale/ja.ts`         | UI 문구 리소스를 컴포넌트 namespace 단위로 제공합니다.               |
| Font    | `fonts/jaText.tsx`, `fonts/koText.tsx` | PDF 생성 시 jsPDF에 임베드할 일본어/한국어 폰트 데이터를 제공합니다. |

#### shared hooks

| Hook                                              | 역할                                                                                                                    |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `useAxiosGet/Post/Put/Delete`                     | `ServerContext`를 기준으로 axios 요청을 수행하는 공통 API hook입니다. pending 여부와 parameter state를 함께 관리합니다. |
| `useReactPlayerHook`                              | YouTube player src, 재생 상태, duration, currentTime, seek 제어를 React state와 ref로 관리합니다.                       |
| `useVideoPlayHook`                                | 키보드 재생 제어, 프레임 이동, 마커 지정, 구간 반복, 스크래치 재생, 자동 정지 로직을 담당합니다.                        |
| `useAudioDecode`                                  | `/yts/audioStream`에서 받은 오디오 arraybuffer를 Web Audio API로 디코딩하고 frameRate 기준 파형 데이터로 정규화합니다.  |
| `useTimeline`                                     | `/db/timeline`을 호출해 현재 영상의 타임라인을 가져오고 Redux `timeline.bunIds`에 저장합니다.                           |
| `useBunRefetch`                                   | 문장별 refetch callback을 ref map으로 보관하고, 특정 문장 또는 전체 문장/타임라인을 다시 불러옵니다.                    |
| `useHandleKeyboard`                               | 전역 단축키를 영상 제어 함수에 매핑합니다. space, z/x/c/v, a/s/d/f, b/g/r/n 등의 편집 키를 처리합니다.                  |
| `useHandleSelection`                              | 문장 DOM에서 드래그 선택한 텍스트, 문장 ID, offset을 추출하고 Redux selection state로 반영합니다.                       |
| `useHukumu`                                       | 현재 선택 영역이 이미 등록된 단어인지 `/db/hukumu/check`로 검사하고 highlight 상태를 갱신합니다.                        |
| `useHukumuList`                                   | 선택된 단어가 현재 영상의 다른 문장에 등장하는 목록을 조회합니다.                                                       |
| `useOsusumeList`                                  | 아직 등록되지 않은 선택 텍스트와 일치하는 기존 단어 후보를 전체 DB에서 추천합니다.                                      |
| `useTangoList`                                    | 현재 영상에 등록된 단어 목록을 조회해 사이드 리스트와 단어장 UI에 공급합니다.                                           |
| `useDebounce`, `useDebounceEffect`, `useThrottle` | 입력, 선택, 스크롤, API 호출 빈도를 제어하는 공통 시간 제어 hook입니다.                                                 |
| `useKirikae`, `useMultiKirikae`, `useMultiInput`  | 한국어 음가 입력을 히라가나로 변환하고, 한자/오쿠리가나 구조에 맞춰 읽기 입력 필드를 분리합니다.                        |

#### shared lib

| Hook/Util       | 역할                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useJaText`     | 한글 음가와 히라가나 상호 변환, 일본어 한국어 발음 변환, 일본어 문자 종류 판별, 표기/읽기 query 생성, 문장 수정 시 단어 offset 추적을 수행합니다. |
| `useHuri`       | 표기와 읽기를 기반으로 후리가나 배열과 `TextData` 구조를 생성합니다.                                                                              |
| `useTimeStamp`  | 초 단위 시간을 `HH:mm:ss.SSS` 또는 frame stamp 형식으로 변환하고, frameRate 기준 시간 보정을 수행합니다.                                          |
| `useLayoutMenu` | 라우트 tuple과 메뉴 tuple을 받아 Ant Design Menu item과 실제 이동 path를 생성합니다.                                                              |

### entities

`entities`는 도메인 데이터를 화면에 표시하는 최소 UI 단위입니다.

| 엔티티        | 역할                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| `Text`        | 일반 텍스트 조각을 렌더링하는 기본 단위입니다.                                           |
| `KanjiText`   | 한자와 읽기 정보를 분리해 표시하는 텍스트 단위입니다.                                    |
| `ComplexText` | `TextData[]`를 기반으로 표기, 후리가나, offset을 가진 복합 일본어 텍스트를 렌더링합니다. |
| `Bun`         | 일본어 문장과 포함 단어 highlight를 표현하는 문장 엔티티입니다.                          |
| `TimelineBun` | 타임라인 목록에서 한 문장, 시작/종료 시간, 이동/수정 액션을 함께 표시하는 엔티티입니다.  |

### features

`features`는 특정 사용자 액션에 초점을 둔 모달 또는 제어 단위입니다.

| Feature            | 주요 컴포넌트/Hook                               | 역할                                                                                 |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `select-locale`    | `SelectLocaleComp`                               | UI 언어를 한국어/일본어로 전환하고 i18n 설정을 localStorage에 반영합니다.            |
| `bun-update-modal` | `UpdateBunJaTextModalComp`, `useUpdateHukumuBun` | 문장 텍스트 수정 시 기존 포함 단어의 offset 변경, 삭제, 유지 여부를 함께 처리합니다. |
| `bun-delete-modal` | `DeleteBunModal`, `useDeleteHukumuBun`           | 타임라인 문장을 삭제하고 연결된 포함 단어/번역 참조를 정리합니다.                    |
| `hukumu-update`    | `ModalUpdateHukumu`, `useUpdateHukumu`           | 등록된 포함 단어의 표기, 읽기, 연결 단어 정보를 수정합니다.                          |
| `hukumu-delete`    | `ModalDeleteHukumu`, `useDeleteHukumu`           | 선택된 문장 내 단어 등록 정보를 삭제합니다.                                          |

### widgets

`widgets`는 실제 화면을 구성하는 주요 작업 패널입니다. 대부분 `ui`, `api`, `lib`, `model` 하위 폴더로 나뉘며, API hook은 Express 라우트와 1:1에 가까운 단위로 연결됩니다.

| Widget                      | 주요 구성                                                                         | 역할                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `layout`                    | `LayoutComp`                                                                      | 메인/DB 페이지의 공통 사이드바 레이아웃을 제공합니다.                                        |
| `layout-youtube`            | `LayoutYoutube`                                                                   | 영상 작업 페이지의 사이드 메뉴, 상단 언어 선택, 공유 모달을 포함한 레이아웃입니다.           |
| `video-grid`                | `YoutubeGridComp`, `NewVideo`, `VideoItemList`, edit/delete modal                 | 영상 등록, 검색, 수정, 삭제, 최근 편집 기준 목록 조회를 담당합니다.                          |
| `video`                     | `VideoComp`                                                                       | `ReactPlayer`와 `AudioWaveComp`를 결합해 영상 재생과 파형 편집을 한 화면에 배치합니다.       |
| `audio-wave`                | `AudioWaveComp`, `useCanvas`, `useRange`, `HelpModal`                             | 파형 Canvas 렌더링, zoom/range 제어, 클릭 seek, 드래그 마커 지정을 처리합니다.               |
| `timeline`                  | `TimelineComp`, `TimelineControlComp`, `MakeDraftComp`, `SelectPromptModal`       | 타임라인 문장 목록, 문장 생성/수정, 음성 인식/캡션 기반 초안 생성을 담당합니다.              |
| `timeline-carousel`         | `TimelineCarouselComp`                                                            | 현재/이전/다음 문장을 큰 단위로 이동하며 타임라인 문장을 편집합니다.                         |
| `timeline-carousel-honyaku` | `TimelineCarouselHonyakuComp`, `useSelect`                                        | 번역 작업 화면에서 현재 문장 주변을 이동하고 대표 번역을 확인합니다.                         |
| `timeline-divide`           | `BunkatsuTimelineComp`, `useDivide`                                               | 선택 문장을 기준 위치에서 두 문장으로 분할합니다.                                            |
| `timeline-merge`            | `HeigouTimelineComp`, `useMerge`                                                  | 현재 문장과 다음 문장을 병합합니다.                                                          |
| `honyaku`                   | `HonyakuComp`, `HonyakuController`, `HonyakuInput`, `HonyakuDropDown`             | 한국어 번역 추가, 수정, 삭제와 번역 후보 선택 UI를 제공합니다.                               |
| `honyaku-representive`      | `HonyakuRepresentive`, `useYTBun`                                                 | 타임라인 문장에 표시할 대표 번역을 조회하고 변경합니다.                                      |
| `chat-ai`                   | `AiComp`, `useChat`, `useReplace`                                                 | SSE 기반 AI 채팅을 제공하고, 문맥을 이어 번역/표현 보조를 수행합니다.                        |
| `dictionary`                | `DictionaryComp`                                                                  | 선택 텍스트를 바탕으로 사전 조회 또는 외부 검색 패널 역할을 합니다.                          |
| `tango`                     | `TangoComp`, `getYomi`                                                            | 선택한 일본어 표기와 읽기를 입력하고 단어 등록 흐름으로 연결합니다.                          |
| `tango-db-modal`            | `ModalTangoDB`, `TangoDB`, `AccordianTangoDB`, `useCheckTango`, `usePostNewTango` | 기존 단어 DB 검색, 유사 표기 그룹 분류, 새 단어 등록을 처리합니다.                           |
| `tango-auto-modal`          | `TangoAutoModal`, `TangoCard`, `MatchedTangoList`, `TangoAutoControl`             | MeCab 분석 결과를 기반으로 자동 단어 후보를 만들고 기존 단어 또는 신규 단어로 commit합니다.  |
| `imi`                       | `ImiComp`, `ImiDropDown`, 의미 API hooks                                          | 선택 단어의 한국어 의미를 등록, 수정, 삭제하고 문장 내 단어에 의미를 연결합니다.             |
| `list-compound`             | `CompoundListComp`                                                                | 포함 문장 목록, 추천 단어, 현재 영상 단어 리스트를 한 패널로 묶습니다.                       |
| `list-hukumu`               | `HukumuList`, `HukumuItem`, `useCommit`                                           | 선택 단어가 포함된 다른 문장을 보여주고 단어 등록을 commit합니다.                            |
| `list-osusume`              | `OsusumeList`, `OsusumeItem`, `useCommit`                                         | 미등록 선택 텍스트와 유사한 기존 단어 후보를 추천하고 등록합니다.                            |
| `list-tango`                | `TangoList`, `TangoItem`, `useMoveTo`                                             | 현재 영상의 단어 목록을 보여주고 해당 단어가 등장한 문장으로 이동합니다.                     |
| `tangochou`                 | `TangochouComp`, `TangochouTableComp`, `TangoInfo`, `KanjiInfo`, search 컴포넌트  | 영상 단어장을 표 형태로 보여주고 단어/한자 상세, 등장 문장, 검색을 제공합니다.               |
| `pdf-modal`                 | `PdfModalComp`, `usePDF`                                                          | 단어장 데이터를 PDF로 미리보기/저장하며 일본어 후리가나와 한국어 의미를 포함합니다.          |
| `share-modal`               | `ShareModalComp`, `SharedRangeBun`, `useShare`, `useHandleShare`                  | 공유 URL 압축, 선택 범위 공유, 경량 공유, JSON/SRT 저장, 외부 short URL 업로드를 처리합니다. |
| `db`                        | `DBTable`, `DBSearch`, `DBSearchList`                                             | 전체 DB 조회, 검색, 페이지네이션, 원본 영상으로 이동하는 관리 화면을 구성합니다.             |
| `input-dynamic`             | `DynamicInputComp`, `useAvailable`                                                | 표기/읽기 입력에서 사용 가능한 값과 필드 상태를 동적으로 제어합니다.                         |
| `input-multi-auto`          | `AutoMultiInput`, `AutoLengthInput`                                               | 여러 조각으로 나뉜 표기/읽기 입력을 자동 길이 조정 형태로 제공합니다.                        |

# Legacy repository

[OxxO](https://github.com/OxxO98/OxxO)

유튜브 기능만 분리 한 것으로, 디자인과 일부 개선사항이 적용되었습니다.
