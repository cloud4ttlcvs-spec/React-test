# TTL Bio-Tech React 商品列表沙盒 v1

這是一個可直接部署到 GitHub Pages 的 Vite + React + Tailwind 專案包。

## 這份專案包包含什麼
- React + Vite 前端骨架
- Tailwind v4 的 Vite plugin 設定
- GitHub Pages 自動部署 workflow
- 使用 `public/merged-feed.json` 載入商品資料
- 商品列表沙盒：搜尋、分類、熱門標籤、比較列、話術抽屜

## 本機啟動
```bash
npm install
npm run dev
```

## 正式 build
```bash
npm run build
npm run preview
```

## GitHub Pages 部署
### 最簡單做法
1. 建立一個新的 GitHub repo
2. 把這整包檔案上傳到 repo 根目錄
3. 到 `Settings -> Pages`
4. `Build and deployment -> Source` 選 `GitHub Actions`
5. 推送到 `main` 分支
6. 等待 Actions 跑完後，網站就會上線

## 路徑設定說明
這份專案預設會在 GitHub Actions 中自動把 `VITE_BASE_PATH` 設為：

```txt
/<repository-name>/
```

所以一般 GitHub Pages 專案網址：
```txt
https://<username>.github.io/<repository-name>/
```

通常不需要再手改 `vite.config.js`。

## 如果你要綁自訂網域
1. 到 GitHub Pages 設定裡加上 Custom domain
2. 在 workflow 中把 `VITE_BASE_PATH` 改為 `/`
3. 視需要加入 `public/CNAME`

## 注意
- GitHub Pages 適合這種靜態前端站
- 若未來要接登入、白名單、訂單寫回、管理權限，仍建議保留 GAS / API 後端
