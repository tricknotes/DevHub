# DevHub

プログラマの為の開発支援コミュニケーションツール。作業中メモをリアルタイム共有する。

![2015-08-19 23 56 39](https://cloud.githubusercontent.com/assets/754962/9359853/041673ee-46ce-11e5-9d72-553783f5247b.png)

## やりたいこと
* 開発中に開発メンバとの情報共有を促進したい
* URLとかをさくっと共有したい
* ソースの断片とかも気軽に共有したい
* チャットを書きこんでも緩めに通知したい
* Jenkins や SVN へのコミットの通知も一元化したい
* なんか使っていて楽しい感じにしたい
* みんな一緒に開発していて繋がっている感じを実感したい

## いまのところできること
* リアルタイムチャット(複数部屋)
* 共有リアルタイムメモ帳(複数枚)
* メモの履歴差分表示(最新のいくつか)
* メモのカレンダー表示
* 外部サービスからの通知API
* DBへチャット履歴の保存
* ファイルのドロップによるアップロード(画像は表示される)
* 共有メモをブログとして保存
* モバイル対応(フリックによるチャット⇔メモ切り替え)

## デモ
http://dev-hub.herokuapp.com/

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## インストール
必要なもの

* node 
* mongoDB 

<pre>
$ git clone git@github.com:volpe28v/DevHub.git
$ cd DevHub
$ npm install 
</pre>

## 起動

<pre>
$ node app.js -p 3000 -d devhub_db -t title
</pre>
* -p ポート番号(default 3000)
* -d データベース名(default devhub_db)
* -t タイトル(default '')

### Basic認証をかける
<pre>
$ BASIC_AUTH_USER=user BASIC_AUTH_PASS=pass node app.js -p 3000 -d devhub_db -t title
</pre>
* BASIC_AUTH_USER ユーザ名
* BASIC_AUTH_PASS パスワード

### HTTPS 通信を強制する
<pre>
$ node app.js --force-ssl
</pre>

もしくは
<pre>
$ FORCE_SSL=true node app.js
</pre>

## ビルド
jsやcssを変更した場合はビルドが必要
### 開発向け
```
$ npm run dev
```

### リリース向け
```
$ npm run rel
```

## e2eテスト
nightwatch を使用して代表的なユースケースを書いている
```
$ npm run e2e
```


## 操作ヒント
### チャット
* ユーザ名をクリックで宛先指定
* 画像、その他ファイルをドロップでアップロード
* 画像をクリップボードからペーストでアップロード
* 話題・チームによって部屋を使い分ける(設定から部屋数変更可能)
* /keyword でキーワード検索
* /@user でユーザ名指定検索
* /@user keyword keyword2 でユーザ指定のキーワードAND検索
* ユーザ名をShift+クリックで指定ユーザ発言の絞り込み
* m: でメンション絞り込み。 mo: でメンション＋自発言で絞り込み
* date:yyyy/mm/dd または date:yyyy-mm-dd で日付で絞り込み
* チャットタブのドラッグ＆ドロップで並び替え

### 共有メモ
* メモ欄の任意の場所をダブルクリックで指定箇所の編集開始
* 編集中に Ctrl-Enter またはダブルクリックで編集終了
* Markdown に一部対応
```
"#, ##, ###, ####" -> h1, h2, h3, h4
"- [ ]" -> チェックボックス
行末に #red -> 一行色付け
```
* 画像、その他ファイルをドロップでアップロード
* 画像をクリップボードからペーストでアップロード
* 見出しに日付形式が存在するとカレンダー上にマッピング
```
## 2016/05/24 凄い機能のリリース
### 5/25 打ち上げ
#### 5/25-27 旅に出る
```
* カレンダー上の任意日(複数可)を選択でイベント追加
* メモタブのドラッグ＆ドロップで並び替え

その他記法の詳細は[Wiki](https://github.com/volpe28v/DevHub/wiki/%E8%A8%98%E6%B3%95)参照

### ブログ機能
比較的長期に残したいメモや記事はブログとしてを簡単に保存できる

* 共有メモの編集モードからテキスト選択範囲内の記事をブログに移動
* 共有メモの目次をダブルクリックで選択目次範囲内の記事をブログに移動
* ブログページからブログを新規作成
* ブログの１行目にタグを含めることができる (`[tag]`)
* 作者、タグ名、任意の文字で全文検索できる

### 通知
* チャットメッセージをポップアップでデスクトップ表示
* Settings にて通知を有効にする

### アバター
* ユーザ名の代わりにお好きなアイコンを表示
* Settings にてアバターアイコンを設定する


## 外部連携
### Hubot
https://github.com/hashrock/hubot-devhub

### Redmine, GitHub, Gitlab, GitBucket
https://github.com/hashrock/DevhubHook

### ChromeExtension
[DevHubNotifier](https://chrome.google.com/webstore/detail/devhubnotifier/bieodlolkaahjlgebjijmafnmccgncdf)
* ログインなしに複数のDevHubからチャット通知を受けられる ChromeExtension.
* [GitHub](https://github.com/volpe28v/DevHubNotifier)

## 汎用通知API
### チャットへの通知
* クエリーとして以下が必須
* name : サービス名
* msg  : メッセージ
* avatar : アバター画像URL(省略可能)
* room_id : 部屋番号(1〜. 省略した場合は1)

#### Jenkins
* Post build task　プラグインをインストール
* 以下のスクリプトを実行するようにする

<pre>
RESULT=`curl ${BUILD_URL}api/xml | perl -le '$_=<>;print [/<result>(.+?)</]->[0]'`
wget http://XXXXX:3000/notify?name=Jenkins&msg="($JOB_NAME): $RESULT"
</pre>

#### Subversion
* hooks/post-commit に以下を記述する

<pre>
NAME=`svnlook author $REPOS -r $REV | nkf -w`
CHANGE=`svnlook changed $REPOS -r $REV | nkf -w`
LOG=`svnlook log $REPOS -r $REV | nkf -w`
wget http://XXXXX:3000/notify?name=SVN&msg="($NAME): $LOG"
</pre>

### メモへの通知
* name : サービス名
* text : 通知テキスト
* no : メモNo(省略した場合は No.1)
* line : 行数(省略した場合は先頭)

## その他Tips
### メニューバーにリンクを追加する
* よく行くサイトのリンクをDevhubの上部メニューに表示しておくことができる。
* /lib/menu_links.json を追加する。
* 要再起動

<pre>
[
  {"name": "Google", "url": "https://www.google.co.jp/"},
  {"name": "FaceBook", "url": "https://www.facebook.com/"}
]
</pre>

### 部屋名を変更する
チャットから、```room_name:部屋名``` を打ち込むと部屋名を変更できる。
部屋数は設定から変更可能。

### 組み込み bot を追加する
/lib/bots 配下に js ファイルを追加する。実装例は david.js を参照。
<pre>
var util = require('../util');
module.exports.action = function(data, callback){
  if (data.msg.match(/David/i)){ //自分の名前が呼ばれたら
    // 返答を生成
    var reply = {
      name: "David",
      date: util.getFullDate(new Date()),
      msg: "@" + data.name + "さん ん、なんか用かい？ 俺は今ホームパーティーで忙しいんだ。出来れば後にしてくれないか。"
    };

    // 1秒後に返答する
    setTimeout(function(){
      callback(reply);
    },1000);
  }
};
</pre>

## License
(The MIT License)

Copyright (c) 2012 Naoki KODAMA <naoki.koda@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

