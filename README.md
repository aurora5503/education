# 精神科個人化衛教平台 MVP

以 `React + TypeScript + Vite` 打造的前端 MVP，聚焦在精神科門診後的個人化衛教輸出。

## 目前功能

- 內容編輯模式：單一使用者可直接在前端新增、刪除、修改症況、藥物與衛教模組文字，變更自動存到瀏覽器 localStorage。
- 醫師端單頁 composer：選擇診斷、藥物類別、心理與生活模組，立即生成 A4 預覽。
- 病人端公開主題頁：供 QR code 延伸閱讀，不含個別病人資料。
- HIS 預填模擬器：支援 `postMessage` 與 query-string fallback，方便未來接入院內 Edge 宿主頁。
- 結構化內容庫：診斷、藥物、生活/心理模組與 handout template 全部以 TypeScript schema 管理，前端可覆寫預設內容。

## 路由

- `/doctor/content`
- `/doctor/create`
- `/patient/topic/:slug`
- `/dev/prefill-demo`

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

## 資料保存方式

- 編輯內容會自動保存到目前瀏覽器的 `localStorage`
- 沒有後端、沒有登入、沒有多人同步
- 若要備份目前版本，可在內容編輯頁使用「複製目前 JSON」

## 預填協定

宿主頁可送入：

```ts
type PrefillPayload = {
  diagnosisIds?: string[]
  medicationIds?: string[]
  selectedModuleIds?: string[]
  visitContext?: {
    careStage?: string
    followUpPlan?: string
    emphasis?: string
  }
  sourceSystem?: string
}
```

`postMessage` envelope：

```ts
{
  type: 'psyedu.prefill',
  payload: PrefillPayload
}
```
