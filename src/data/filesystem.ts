import type { FolderItem } from '../types';

export const initialFilesystem: FolderItem[] = [
  {
    id: 'folder-game',
    name: 'GAME',
    type: 'folder',
    locked: false,
    children: [
      {
        id: 'game-event-planning',
        name: 'event_planning.txt',
        type: 'txt',
        content: `オンラインのリスナー参加型カスタム『なまかす』を開催しよう。

企画内容：
- 参加者募集フォームを用意する
- 当日の流れを決める
- 紹介映像を冒頭に流す
- 配信設定を事前に確認しておく

楽しいイベントにしよう！`,
      },
      {
        id: 'game-st6-luke',
        name: 'ST6_luke_combo_list.txt',
        type: 'txt',
        content: `マスター行けて嬉しいな。ルークのコンボをもう一回整理しよう。

【ルーク コンボリスト】

■ 基本コンボ
214HP → 236LP → 236LP (OD) → 214HP → SA3

■ 確反コンボ
4HP → 236LP → 236LP → SA3

■ 画面端
214HP → 236LP → 236LP → 214HP × 2 → SA3

■ Vシフト後
Vシフト → 4HP → 236LP → SA3

マスターまでの道のり、長かったけど報われた。
ST6 面白いな。`,
      },
      {
        id: 'game-namakasu',
        name: 'なまカス.txt',
        type: 'txt',
        content: `次回なまカスの開催日は11月22日に決定。参加者紹介映像でもつくって盛り上げよう。

アイデアメモ：
- 参加者のゲーマータグと使用キャラをスライドで紹介
- BGMはゲームっぽいやつで
- 時間は1〜2分くらいで
- テロップのフォントはポップなやつがいいかな

Introduce_namayanscustom.mp4 として書き出し予定。`,
      },
    ],
  },
  {
    id: 'folder-movie',
    name: 'MOVIE',
    type: 'folder',
    locked: false,
    children: [
      {
        id: 'movie-event-log',
        name: 'Event_Log.md',
        type: 'md',
        content: `# バレーオフ会 Vlog 編集メモ

『バレーオフ会』のVlog素材の編集大変やな たのしかったから頑張ろう

## 素材チェックリスト

- [x] 集合シーン（午前中）
- [x] 試合1本目
- [x] ランチタイム
- [ ] 試合2本目（手ブレ多い、要補正）
- [ ] 打ち上げシーン
- [ ] エンディング

## 編集メモ

BGM候補：
- オープニング → アップテンポ系
- 試合シーン → エキサイティングなやつ
- エンディング → ゆったり系

カット割りはテンポよく。
楽しかったから絶対いい動画になる、頑張ろう！`,
      },
      {
        id: 'movie-introduce-mp4',
        name: 'Introduce_namayanscustom.mp4',
        type: 'mp4',
        metadata: {
          title: 'Introduce_namayanscustom',
          duration: '1:47',
          resolution: '1920x1080',
          fps: '60',
          codec: 'H.264',
          createdAt: '2026-09-10',
          size: '284 MB',
          description: 'なまカス参加者紹介映像',
        },
      },
      {
        id: 'movie-stream-setup',
        name: 'stream_setup.txt',
        type: 'txt',
        content: `なまカスの紹介映像、Introduce_namayanscustom.mp4として書き出し完了。
カスタムの開催日の21時、冒頭から流せるように配信設定しとかなきゃ。

【配信設定チェック】
- OBSシーン切替：待機画面 → 本編
- 紹介映像：冒頭再生 ON
- マイク：本編開始まで MUTE
- 配信ステータス：ON にすること（忘れると放送事故る）

開始時刻：21:00（厳守）
映像尺：約1分47秒
映像再生後、速やかにゲーム画面へ切替。`,
      },
      {
        id: 'movie-dog-memo',
        name: 'dog_video_memo.txt',
        type: 'txt',
        content: `0616。三つ子の誕生日祝いの映像。

長男は夜中に帰ってくると番犬面して玄関に座ってこっち見てくるのがかわいいんだよな。

次男と三男はソファで寝てた。

せっかくだから誕生日の映像、ちゃんと残しておきたい。
ドローン持ってるし、記念に空撮でも撮ってあげようかな。`,
      },
      {
        id: 'movie-inu-mp4',
        name: '犬.mp4',
        type: 'mp4',
        metadata: {
          title: '犬',
          duration: '3:22',
          resolution: '4K (3840x2160)',
          fps: '30',
          codec: 'H.265',
          createdAt: '0616',
          size: '1.2 GB',
          description: '三つ子の誕生日祝い映像',
        },
      },
    ],
  },
  {
    id: 'folder-drone',
    name: 'DRONE',
    type: 'folder',
    locked: false,
    children: [
      {
        id: 'drone-dualorbit',
        name: 'DUALORBIT.txt',
        type: 'txt',
        content: `西田さんとあとばる、しちめんちょうにスリューも加わった。みんなでがんばっていこう。

ドローンのファイルも今後増えるだろうから管理しやすいようにDOをつけて管理するか。

【DO管理ルール】
- ファイル名の先頭に「DO_」をつける
- 日付は MMDD 形式で記録
- 撮影場所と内容をメタデータに記録

これからどんどんコンテンツ増やしていくぞ。`,
      },
      {
        id: 'drone-invoice',
        name: 'DO_請求書.pdf',
        type: 'pdf',
        content: `# DO_請求書

## 福島県 撮影遠征費用

| 項目 | 金額 |
|------|------|
| 温泉撮影・宿泊費 | ¥20,000 |
| 高速道路 | ¥10,000 |
| ガソリン | ¥3,800 |
| **合計** | **¥33,800** |

---

撮影日：2026年8月2日
撮影場所：福島県 某温泉地
担当：DUALORBIT`,
      },
      {
        id: 'drone-office-mp4',
        name: 'DO_Office.mp4',
        type: 'mp4',
        metadata: {
          title: 'DO_Office',
          duration: '5:14',
          resolution: '4K (3840x2160)',
          fps: '60',
          codec: 'H.265',
          createdAt: '0802',
          size: '3.7 GB',
          description: 'オフィス周辺空撮映像',
        },
      },
    ],
  },
  {
    id: 'folder-community',
    name: 'COMMUNITY',
    type: 'folder',
    locked: true,
    lockType: 'numeric',
    lockAnswer: '112221',
    lockHint: '【アクセス制限】次回コミュニティイベントの開始日時（MMDDHH）を入力せよ',
    children: [
      {
        id: 'community-dog-tree',
        name: 'dog_family_tree.png',
        type: 'png',
        content: 'placeholder',
        metadata: {
          description: '三つ子の長男：だいず',
        },
      },
      {
        id: 'community-family-intro',
        name: 'family_intro.md',
        type: 'md',
        content: `# 三つ子の誕生日🎂

0616は我が家の三つ子の誕生日！記念に自分のドローンでお祝いの映像とっとこ。

## 三つ子プロフィール

| 名前 | 順番 | 特徴 |
|------|------|------|
| だいず | 長男 | 夜中に玄関で出迎えてくれる番犬スタイル |
| えだまめ | 次男 | ソファ大好き、のんびり屋 |
| とうふ | 三男 | 一番甘えん坊 |

みんな本当にかわいいな。
毎年この日が来るのが楽しみ。

記念映像、しっかり撮ってあげるよ！`,
      },
      {
        id: 'community-live-config',
        name: 'Live_Config.json',
        type: 'json',
        content: `{
  "Target_Server": "Namayanz_Custom",
  "Stream_Status": "ON",
  "Mic_Mute": "OFF"
}

// memo: 待機画面から本編に切り替える時、必ずStream_StatusをONにすること。
// 忘れると放送事故る。`,
      },
    ],
  },
  {
    id: 'folder-goods',
    name: 'GOODS',
    type: 'folder',
    locked: true,
    lockType: 'text',
    lockAnswer: 'だいず',
    lockQuestion: '夜中、玄関でいつも出迎えてくれるアイツの名前は？',
    children: [
      {
        id: 'goods-system-override',
        name: 'System_Override.exe',
        type: 'exe',
        content: 'SYSTEM OVERRIDE EXECUTABLE',
      },
    ],
  },
];
