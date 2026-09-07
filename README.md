# 俄羅斯方塊 Tetris

純 HTML + CSS + JavaScript 製作，不需要後端或任何套件。

## 功能
- 經典 10×20 俄羅斯方塊
- 七種基本方塊
- 左右移動、旋轉、加速下降、瞬間落下
- 下一個方塊預覽
- 分數、消除行數、等級
- 最高分儲存在瀏覽器 localStorage
- 隨等級提升自動加快速度
- 幽靈方塊提示落點
- 電腦與手機瀏覽器皆可開啟

## 放到 GitHub Pages

1. 在 GitHub 建立一個新的 Repository，例如 `tetris-game`。
2. 上傳 `index.html`、`style.css`、`script.js`。
3. 進入 Repository 的 **Settings → Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**。
5. Branch 選 `main`，資料夾選 `/ (root)`，按 Save。
6. 等待 GitHub Pages 部署完成後，即可從 Pages 網址遊玩。

## 操作
- ← →：左右移動
- ↑：旋轉
- ↓：加速下降
- 空白鍵：瞬間落下
- P：暫停 / 繼續
