> [!NOTE]
> 現在、日本語への対応が可能になりました。もし、翻訳が間違っている所があったら、教えてくださると有り難い限りです。
> 近いうちに、README の内容も翻訳していく予定です。

# Quick Start

1. `npm install` でパッケージをインストール

2. `npm run serve` で実行

3. `localhost:3000` に接続 (自動でブラウザーが開かない場合)

4. 翻訳する映像を追加して、字幕を付けた後、URL でシェア出来ます。

5. シェアするリンクは一般的に`8192`まで可能です。（URL 制限のため）

   > 範囲を選んでシャアしたり、`ruby`を除いてシェアしたりできます。

   > もしくは、公開にアップロードして短縮された`URL`でシェアできます。

# Legacy repository

[OxxO](https://github.com/OxxO98/OxxO)

ユーチューブ機能だけ分離したもので、デザインと一部の改善事項が反映されました。

# Demo repository

[oxxo-youtube-share](https://github.com/OxxO98/oxxo-youtube-share)

# Demo

[demo1](http://oxxo.ddns.net/?l=S4RfEYAlZAnZSWZI)

[demo2](http://oxxo.ddns.net/?l=dOkCBlotfP2bpTIb)

# OxxO_YOUTUBE

[한국어](README.md) | [日本語]

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)

## 目次

[プロジェクト紹介](#プロジェクト紹介)

[重要機能](#重要機能)

[その他の機能](#その他の機能)

[機能紹介](#機能紹介)

[これからの改善事項](#これからの改善事項)

## 개발 환경

- Front-end
  - React, Typescript
  - scss
- back-end
  - NodeJS, Express.js
  - OracleCloud
- Database
  - OracleDB(AutonomousDatabase)

# プロジェクト紹介

日本語翻訳を楽しめる人のためのウェブアプリケーション。

## 機能

- 메인기능
  - 단어 DB 관리 기능
  - 번역 버전 관리 기능
  - 단어 검색 기능
- 서브 기능
  - 유튜브 문장 내보내기 기능

## 重要機能

- 유튜브 링크를 등록해 번역할 수 있습니다.

> 오디오 파형을 가져오지 못하는 경우, **적당한 파형**이 표시됩니다.

> [!NOTE]
> 日本語の対応が可能になりました。 일본어 지원이 가능해졌습니다.

### シェア機能

- URL을 통해 공유할 수 있습니다. 데이터가 URL에 저장되며, 기본적으로 `원문`, `번역문`, `읽기 정보`가 포함됩니다.

### URL 長さ制限を超える場合

- `범위를 지정`해서 일부만 공유할 수 있습니다.

- 혹은, `읽기 정보`를 제외하고 공유하거나, `번역문`과 `원문`중 한가지만 공유할 수 있습니다.

- 또는 `공개적으로 업로드`하여 공유할 수 있습니다. `축약된 URL`을 얻을 수 있으며, 이를 통해 공유할 수 있습니다.

### 書き出し機能

- 내보내기 기능이 추가되었습니다. json파일로 저장하거나, youtube자막 형식으로 저장이 가능합니다. json 파일의 경우 추후 프리미어 프로에서 사용하는 `Extend script` 리포지터리에서 사용합니다.

> [!CAUTION]
> 全角空白が漢字一文字のサイズと一致しているフォントにて、望む通りに表示できます。

- Adobe PremierePro の mogrt(モーショングラフィックステンプレート)ファイルで作動を念頭に入れて作られた機能であります。原文と振り仮名の文字列を書き出します。

- 近いうちに配布予定である mogrt ファイルに入力すると、振り仮名が該当する漢字の上に表視されます。

### 単語帳を PDF 形式で書き出し機能

- 단어장을 pdf로 변환이 가능해졌습니다.

- 단어만 내보내는 경우, 해당 단어가 포함된 문장 및 번역, 단어 다른 읽기 정보가 포함됩니다.

- 한자만 내보내는 경우, 해당 한자가 포함되는 단어가 옆에 나열됩니다.

### 単語

文章をドラッグして単語を登録することができます。現在`漢字`や`漢字と平仮名`の組み合わせのみ登録ができます。

한번 단어를 등록한 후에는, 등록된 단어를 드래그 시, 해당 표기를 기준으로 모든 문장이 검색됩니다. 검색된 문장을 통해 현재 등록된 단어정보로 바로 등록이 가능합니다. 또는, 드래그된 부분(단어가 등록되지 않은 경우)이 이미 등록된 단어의 표기가 있는 경우 바로 추가가능한 단어들이 목록에 표시됩니다.

読み方は平仮名にして入力が望まれます。

一回単語を登録した場合、便利に追加する機能があります。

### 翻訳

基本的な文章の追加や修正、バージョン管理が可能です。保存された翻訳文の中に代表に表示する文章を選ぶことができます。

# これからの改善事項

- 단어 뜻 활용 방안 모색
