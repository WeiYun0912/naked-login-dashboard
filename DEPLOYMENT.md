# GitHub Pages 部署指南

本文件說明如何將 YouTube Dashboard 部署到 GitHub Pages。

## 📋 前置準備

1. 已將專案推送到 GitHub repository
2. 擁有 Google Cloud Console 專案和相關 API 金鑰
3. 已啟用 GitHub Pages

---

## 🔐 步驟 1：設定 GitHub Secrets

前往你的 GitHub repository：
```
https://github.com/WeiYun0912/naked-login-dashboard/settings/secrets/actions
```

點擊「New repository secret」新增以下 secrets：

| Secret 名稱 | 值 | 說明 |
|------------|---|------|
| `VITE_YOUTUBE_API_KEY` | 你的 YouTube Data API Key | 從 Google Cloud Console 取得 |
| `VITE_YOUTUBE_CHANNEL_ID` | 你的 YouTube 頻道 ID | 例如：UC-XXXXXXXXX |
| `VITE_GOOGLE_CLIENT_ID` | 你的 Google OAuth Client ID | 從 Google Cloud Console 取得 |

⚠️ **重要**：這些 secrets 只有在 GitHub Actions build 時會被使用，不會出現在 repository 中。

---

## 🔧 步驟 2：更新 Google Cloud Console 設定

### 2.1 更新 OAuth 2.0 重新導向 URI

前往 [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)

找到你的 OAuth 2.0 用戶端 ID，編輯並新增：

**已授權的 JavaScript 來源：**
```
https://weiyun0912.github.io
```

**已授權的重新導向 URI：**
```
https://weiyun0912.github.io/naked-login-dashboard/callback
```

點擊「儲存」。

### 2.2 限制 YouTube Data API Key（推薦）

為了安全性，建議限制 API Key 只能從你的網域呼叫：

1. 前往 [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. 找到你的 API Key，點擊編輯
3. 在「應用程式限制」選擇「HTTP referrer (網站)」
4. 新增允許的 referrer：
   ```
   https://weiyun0912.github.io/naked-login-dashboard/*
   ```
5. 點擊「儲存」

這樣即使有人看到你的 API Key，也無法從其他網域使用。

---

## 🚀 步驟 3：啟用 GitHub Pages

1. 前往 repository 的 Settings > Pages
2. 在「Build and deployment」區塊：
   - Source: 選擇「GitHub Actions」
3. 儲存設定

---

## 📦 步驟 4：觸發部署

### 方式 1：推送到 main 分支（自動觸發）

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

推送後，GitHub Actions 會自動執行部署流程。

### 方式 2：手動觸發

1. 前往 repository 的「Actions」頁面
2. 選擇「Deploy to GitHub Pages」workflow
3. 點擊「Run workflow」

---

## ✅ 步驟 5：驗證部署

1. 前往 Actions 頁面查看部署狀態
2. 等待部署完成（約 2-3 分鐘）
3. 訪問你的網站：
   ```
   https://weiyun0912.github.io/naked-login-dashboard/
   ```

---

## 🔍 除錯

### 問題 1：Build 失敗

檢查 GitHub Actions logs，確認：
- 所有 GitHub Secrets 都已正確設定
- npm dependencies 安裝成功

### 問題 2：OAuth 登入失敗

確認：
- Google Cloud Console 的 redirect URI 設定正確
- OAuth consent screen 已設定完成
- 你的 Google 帳號已加入測試使用者名單

### 問題 3：API Key 無效

確認：
- YouTube Data API v3 已啟用
- API Key 的 referrer 限制設定正確
- GitHub Secret 中的 API Key 沒有多餘的空格

### 問題 4：頁面顯示空白

檢查瀏覽器 Console 是否有錯誤訊息：
- 確認 `vite.config.ts` 的 `base` 路徑正確
- 檢查路由是否正常運作

---

## 📝 本地測試

在推送到 GitHub 前，建議先在本地測試 production build：

```bash
# 設定環境變數（Windows）
set NODE_ENV=production
set VITE_YOUTUBE_API_KEY=your_key
set VITE_YOUTUBE_CHANNEL_ID=your_channel_id
set VITE_GOOGLE_CLIENT_ID=your_client_id
set VITE_OAUTH_REDIRECT_URI=http://localhost:4173/callback

# Build
npm run build

# Preview
npm run preview
```

訪問 `http://localhost:4173/naked-login-dashboard/` 確認運作正常。

---

## 🔒 安全性說明

### 環境變數暴露風險

即使使用 GitHub Secrets，以下資訊仍會被打包進前端 JavaScript：
- ✅ `VITE_GOOGLE_CLIENT_ID` - **安全**（OAuth Client ID 本來就是公開的）
- ⚠️ `VITE_YOUTUBE_API_KEY` - **部分安全**（建議設定 HTTP referrer 限制）
- ✅ `VITE_YOUTUBE_CHANNEL_ID` - **安全**（公開資訊）

### 已移除的安全性風險

- ❌ `VITE_GOOGLE_CLIENT_SECRET` - 已從程式碼中移除
  - 改用 **Implicit Flow**，不需要 Client Secret
  - 缺點：token 會在 1 小時後過期，需重新登入

### 建議做法

1. **務必設定 API Key 的 HTTP referrer 限制**
2. 在 OAuth consent screen 只允許測試使用者
3. 定期檢查 API 使用量

---

## 🔄 更新部署

每次推送到 main 分支，GitHub Actions 會自動重新部署。

如果需要更新環境變數：
1. 更新 GitHub Secrets
2. 手動觸發 workflow 或推送新的 commit

---

## 📞 需要協助？

如遇到問題，請檢查：
1. GitHub Actions logs
2. 瀏覽器 Console 錯誤訊息
3. Google Cloud Console 的 API 使用量和錯誤日誌
