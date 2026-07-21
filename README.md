# 旅行ルート・周辺スポット検索

出発地点と目的地を入力すると、交通手段ごとのルート・所要時間・距離・概算料金と、
ルート沿いのおすすめスポットをまとめて確認できる Web アプリ（ポートフォリオ作品）。

## 機能（予定）

- 出発地・目的地の入力（住所・駅名・スポット名）
- 複数ルートの提示（交通手段別）
- 所要時間・距離・概算料金の表示
- ルート沿いのおすすめスポット検索・表示
- 地図上でのルート・スポットの可視化

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js 16, React 19, TypeScript |
| スタイリング | Tailwind CSS 4 |
| 地図・ルート | Google Maps Platform（Directions / Places / Maps JavaScript API） |
| デプロイ | Vercel（予定） |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` に Google Maps Platform の API キーを設定してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## Google Maps Platform API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 以下の API を有効化
   - Maps JavaScript API
   - Directions API
   - Places API
   - Geocoding API
3. 「認証情報」から API キーを作成
4. キーに HTTP リファラー制限（`localhost:3000/*` など）を設定

## ライセンス

MIT
