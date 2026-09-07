# 🧱 俄羅斯方塊｜五關挑戰版

這是一款可以直接放到 GitHub Pages 執行的純 HTML / CSS / JavaScript 俄羅斯方塊遊戲。

## 遊戲特色

- ⬆️ 上鍵：旋轉方塊
- ⬅️ ➡️ 左右鍵：移動
- ⬇️ 下鍵：加速下降
- 空白鍵：直接落下
- P：暫停／繼續
- ⭐ 五個關卡
- ⚡ 關卡越高，下降速度越快
- 🏆 第 5 關完成後顯示過關訊息
- 💾 自動保存最高分（瀏覽器 Local Storage）
- 📱 支援手機／平板的響應式版面

## 五個關卡

| 關卡 | 達成條件 | 下降速度 |
|---|---:|---:|
| 第 1 關 | 開始遊戲 | 800 ms |
| 第 2 關 | 消除 5 行 | 650 ms |
| 第 3 關 | 消除 12 行 | 500 ms |
| 第 4 關 | 消除 20 行 | 350 ms |
| 第 5 關 | 消除 30 行 | 220 ms |

## 放到 GitHub 執行

1. 在 GitHub 建立一個新的 Repository，例如 `tetris-game`
2. 上傳：
   - `index.html`
   - `style.css`
   - `script.js`
3. 進入 Repository 的 **Settings → Pages**
4. Source 選擇 **Deploy from a branch**
5. Branch 選 `main`，資料夾選 `/ (root)`
6. 儲存後等待 GitHub Pages 部署
7. 開啟 GitHub 提供的網址即可玩

## 注意

這個版本不需要 Node.js、Unity 或資料庫，直接由瀏覽器執行，因此很適合放在 GitHub Pages。
