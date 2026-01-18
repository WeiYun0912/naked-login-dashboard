# YouTube Dashboard

一個美觀的 YouTube 頻道數據儀表板，使用 React + TailwindCSS + Framer Motion 打造。

## ✨ 功能特色

- 📊 **頻道總覽** - 訂閱人數、總觀看數、影片數量、頻道年齡
- 📈 **趨勢圖表** - 訂閱數與觀看數的歷史趨勢（過去 30 天）
- 🎥 **影片列表** - 顯示最新影片及互動數據（觀看、按讚、留言）
- 👥 **每部影片訂閱數** - 顯示每部影片帶來的訂閱增長
- 🔐 **OAuth 登入** - 安全的 Google OAuth 2.0 認證
- 🎨 **精緻設計** - Linear/Modern 風格，動態背景與毛玻璃效果

## 🚀 快速開始

### 本地開發

1. Clone 專案：
```bash
git clone https://github.com/WeiYun0912/naked-login-dashboard.git
cd naked-login-dashboard
```

2. 安裝依賴：
```bash
npm install
```

3. 設定環境變數：
```bash
cp .env.example .env
```

編輯 `.env` 填入你的 API 金鑰：
```env
VITE_YOUTUBE_API_KEY=your_api_key
VITE_YOUTUBE_CHANNEL_ID=your_channel_id
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/callback
```

4. 啟動開發伺服器：
```bash
npm run dev
```

訪問 `http://localhost:5173`

## 📦 部署到 GitHub Pages

詳細部署步驟請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

線上 Demo：https://weiyun0912.github.io/naked-login-dashboard/

## 🔧 技術棧

- **框架**: Vite + React 18 + TypeScript
- **樣式**: TailwindCSS 4
- **動畫**: Framer Motion
- **圖表**: Recharts
- **路由**: React Router
- **API**: YouTube Data API v3 + YouTube Analytics API

## 📁 專案結構

```
src/
├── components/
│   ├── ui/           # 基礎 UI 元件 (Card, Button, AnimatedNumber)
│   ├── layout/       # 佈局元件 (Background, Container)
│   ├── stats/        # 統計卡片元件
│   ├── charts/       # 圖表元件 (訂閱/觀看趨勢)
│   ├── videos/       # 影片列表元件
│   └── auth/         # 登入元件
├── hooks/            # Custom React Hooks
├── services/         # API 服務層
├── pages/            # 頁面元件
└── types/            # TypeScript 型別定義
```

## 🔐 API 設定

### 1. 建立 Google Cloud 專案

前往 [Google Cloud Console](https://console.cloud.google.com)

### 2. 啟用 API

- YouTube Data API v3
- YouTube Analytics API

### 3. 建立 API Key

用於存取公開的頻道資料。

### 4. 建立 OAuth 2.0 憑證

用於存取 Analytics API（需要使用者授權）。

設定重新導向 URI：
- 開發環境：`http://localhost:5173/callback`
- 生產環境：`https://weiyun0912.github.io/naked-login-dashboard/callback`

詳細步驟請參考專案中的 API 設定指南。

## 🔒 安全性

- 使用 **OAuth 2.0 Implicit Flow**（不需要 Client Secret）
- API Key 可設定 **HTTP Referrer 限制**
- 環境變數透過 **GitHub Secrets** 管理

## 📝 授權

MIT License

## 🙏 致謝

- [YouTube Data API](https://developers.google.com/youtube/v3)
- [YouTube Analytics API](https://developers.google.com/youtube/analytics)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [TailwindCSS](https://tailwindcss.com/)
