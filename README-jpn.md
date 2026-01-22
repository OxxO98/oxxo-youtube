> [!NOTE]
> 現在、日本語への対応が可能になりました。もし、翻訳が間違っている所があったら、教えてくださると有り難い限りです。

# OxxO_YOUTUBE

[한국어](README.md) | [日本語]

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)

# Quick Start

> [!CAUTION]
> mecab機能を使用するためにはインストールと環境変数の設定が必要になります。
> https://shogo82148.github.io/mecab/

> [!CAUTION]
> 環境変数に OpenAI api keyが設定されている場合、open aiを使う機能が可能になります。

```bash
npm install
npm run serve
```

1. `npm install` でパッケージをインストール

2. `npm run serve` で実行

3. `localhost:3000` に接続 (自動でブラウザーが開かない場合)

4. 翻訳する映像を追加して、字幕を付けた後、URL でシェア出来ます。

5. シェアするリンクは一般的に`8192`まで可能です。（URL 制限のため）

   > もしくは、公開にアップロードして短縮された`URL`でシェアできます。

# Demo repository

[oxxo-youtube-share](https://github.com/OxxO98/oxxo-youtube-share)

# Demo

[demo](http://oxxo.ddns.net/?l=nQl0UMG0JyQvfH0G)

# 目次

# 開発環境

- Front-end
  - React, Typescript
- back-end
  - NodeJS, Express.js
  - OracleCloud
- Database
  - lowdb
  - OracleDB(AutonomousDatabase)

# 開発の背景

原文が分からない日本語の動画の翻訳を楽にするため、個人的使用を目的で開発したものです。

# 機能

- Youtubeリンクを登録して、該当の動画を翻訳できます。

## タイムライン作成

- `nodejs-whisper`ライブラリーを通じて`認識した音声`で初稿を作成できます。

- 該当の動画に字幕がある場合、`字幕情報`を使って作成できます。

- 字幕と音声認識の結果を比較して見れます。クリックしてその部分を再生できます。

- OPENAI_API_KEYが環境変数に登録登録されている場合、openAIの`whisper`モデルを使って音声を認識します。

- もし、該当の動画の台本がある場合には、テキストを入力し、`音声認識の結果を補正`することができます。

## 単語登録

文章をドラッグして単語を登録することができます。現在`漢字`や`漢字と平仮名`の組み合わせのみ登録ができます。

一回単語を登録した場合、便利に追加する機能があります。

- 登録された単語をドラックする、該当する表記が含まれる文章が検索されます。

- 登録されない部分をドラックする場合、該当する表記の単語を直ちに登録できます。

読み方は平仮名にして入力が望まれます。

### 自動で単語登録

- 動画に登録した単語がない場合、`mecab`を通じて自動で単語を登録できます。

- OPENAI_API_KEYが環境変数に登録されている場合、単語の`意味情報`も一緒に登録できます。

## 翻訳

基本的な文章の追加や修正、バージョン管理が可能です。保存された翻訳文の中に代表に表示する文章を選ぶことができます。

## シェア機能

- URLを使ってシェアできます。データがURLに保存され、基本的には`原文`、`翻訳文`、`読み`が含まれます。

### URL 長さ制限を超える場合

- `範囲を選択`して一部だけシェアできます。

- もしくは、`読み`を除外してシェアしたり、`原文`と`翻訳文`の一方だけシェアすることもできます。　

- または、`公開してアップロード`してシェアできます。`縮約されたURL`を得られ、そのURLを使ってシェアできます。

### 書き出し機能

- 書き出し機能が追加されました。`jsonファイル`で保存したり、`youtube字幕形式`に保存ができます。`jsonファイル`の場合、後にPremiereProで使える`Extend script`で使用する予定です。

> [!CAUTION]
> 全角空白が漢字一文字のサイズと一致しているフォントにて、望む通りに表示できます。

- Adobe PremierePro の mogrt(モーショングラフィックステンプレート)ファイルで作動を念頭に入れて作られた機能であります。原文と振り仮名の文字列を書き出します。

- 近いうちに配布予定である mogrt ファイルに入力すると、振り仮名が該当する漢字の上に表視されます。

## 単語帳を PDF 形式で書き出し機能

- 単語帳をpdf形式で書き出す機能が可能になりました。

- 単語だけ書き出す場合、該当の単語を`含む文章`または、`翻訳文`、`単語の他の読み情報`が含まれます。

- 漢字だけ書き出す場合、該当の漢字を`含む単語`が隣に並べます。

## 付加機能

### ハングル -> ひらがな変換機能

利用し、大体な所でひらがな入力が必要になり、これを使うため、ユーザーが反復的なキーボード転換が不便なため、ハングルをひらがなに変換する機能を追加しました。

ハングルと一番近いひらがなに変換し、兆音は`-`文字または、前のひらがなに合わせて変換されます。

この機能は単語登録の時の`読み入力`、`単語帳の検索`などの機能で支援されます。

### ひらがな -> ハングル変換機能

- DBページでハングルで読み方を提供するため、制限的に使用されています。

### DBページ

- 今まで登録された単語を見れるページでございます。

- 該当の単語の表記、単語が含まれている動画に連れて分類され、検索は`表記`または、`読み`で探せます。

# これからの改善事項

- 単語の意味をもっと活用する方法を探しています。

# アップデート事項

- レンダリングが改善されました。

- オーディオの波形選択部分がスライダー形式に変わりました。

# Legacy repository

[OxxO](https://github.com/OxxO98/OxxO)

以前のリポジトリからユーチューブ機能だけ分離するもので、デザインと改善が行われました。
