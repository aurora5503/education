# 精神科個人化衛教平台 MVP

以 `React + TypeScript + Vite` 打造的前端 MVP，聚焦在精神科門診後的個人化衛教輸出。

## 目前功能

- 內容編輯模式：單一使用者可直接在前端新增、刪除、修改症況、藥物與衛教模組文字，變更自動存到瀏覽器 localStorage。
- 醫師端單頁 composer：選擇診斷、藥物類別、心理與生活模組，立即生成 A4 預覽。
- 病人端公開主題頁：供 QR code 延伸閱讀，不含個別病人資料。
- 結構化內容庫：診斷、藥物、生活/心理模組與 handout template 全部以 TypeScript schema 管理，前端可覆寫預設內容。

## 路由

- `/doctor/content`
- `/doctor/create`
- `/patient/topic/:slug`

## 開發

```bash
npm install
npm run dev
```

啟動後建議先進入 `/doctor/content` 編輯內容，再到 `/doctor/create` 檢查列印版效果。

## 驗證

```bash
npm run lint
npm run build
```

## 部署

### Cloudways

- 使用一般 build：`npm run build`
- 將 `dist/` 內容部署到網站根目錄
- `public/.htaccess` 會一起進入輸出，用來讓 `BrowserRouter` 在 Cloudways 重新整理子路徑時回到 `index.html`
- 若要更新正式內容，覆蓋 `public/content/content-pack.json` 後重新部署

### GitHub Pages

- 使用 `BrowserRouter`，並透過 `404.html` fallback 處理重新整理子路徑
- 這個專案目前預設發布到 `https://aurora5503.github.io/education/`
- `.env.production` 已經預先設定：
  - `VITE_APP_BASE=/education/`
  - `VITE_PUBLIC_APP_URL=https://aurora5503.github.io/education/`
- 因此正式 build 直接跑 `npm run build` 即可
- `public/content/content-pack.json` 會一起進入輸出，作為 GitHub Pages 上的基準內容
- 列印頁的 QR code 會優先使用 `VITE_PUBLIC_APP_URL` 當公開網址；部署到 GitHub Pages 時，建議設成完整站點位址，例如 `https://username.github.io/your-repo-name/`
- QR 會附上列印當下的內容版本；如果病人之後掃到的是新版內容，病人頁會提示「這份衛教內容已更新」，避免舊紙本和新版網站混淆

## 資料保存方式

- 網站啟動時會優先讀取伺服器上的 [public/content/content-pack.json](/C:/Users/snes5/Dropbox/project/education/public/content/content-pack.json)
- 瀏覽器 `localStorage` 只保存這台電腦的個人暫存；若伺服器 JSON 更新，本機舊暫存不會覆蓋新基準
- 可在內容編輯頁使用「下載 JSON」備份，並在另一台電腦用「匯入 JSON」還原
- 若部署到 Cloudways，可用 SFTP 更新 `public/content/content-pack.json` 作為正式版本
