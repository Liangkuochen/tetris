# 國中英文單字冒險 🎮📚

一個可以直接放到 GitHub Pages 執行的手機版英文單字遊戲。

## 遊戲內容

- 開始畫面選擇單字開頭字母：A～F
- 共 5 個關卡
- 每關 10 題
- 每題 10 分，滿分 100 分
- 手機大按鈕設計，適合觸控
- 每關不同背景
- 每關有不同的遊戲音效
- 第 4 關使用瀏覽器英文語音朗讀
- 第 5 關要求輸入指定數量的英文字母
- 不需要後端、不需要資料庫、不需要安裝套件

## 五個關卡

1. 中文 → 選英文
2. 英文 → 選中文
3. 英文 → 選詞性
4. 聽英文發音 → 選英文
5. 中文 → 拼英文，並提示需要幾個字母

## 如何放到 GitHub

1. 在 GitHub 建立一個新的 Repository，例如 `english-word-game`
2. 將 `index.html`、`style.css`、`game.js`、`README.md` 上傳
3. 進入 Repository 的 **Settings → Pages**
4. Source 選擇 **Deploy from a branch**
5. Branch 選 `main`，資料夾選 `/ (root)`
6. 儲存後等待 GitHub Pages 部署
7. 開啟 GitHub 提供的網址即可用手機遊玩

## 修改單字

打開 `game.js` 最上方的 `WORDS`，每個字的格式：

```js
["apple", "蘋果", "n."]
```

依序是：

```text
英文單字、中文意思、詞性
```

目前先提供 A～F，每個字母 10 個單字，方便測試五個關卡。

## 注意

第 4 關使用瀏覽器內建的 `SpeechSynthesis`，不同手機/瀏覽器使用的英文聲音可能不同。

遊戲音效使用 Web Audio API 即時產生，所以不需要另外上傳 mp3。
