# 「Zählt: Redline Performance」視覺系統與駕駛艙 UX 規格（代號 Redline / Cockpit）

> 設計哲學：**速度即是一切（Speed is Everything）**  
> 目標：把「工程師填表」重構成「駕駛艙操作」。  
> 本文件只定義**不可妥協的品牌規格**與**可落地的工程實作方式**（tokens / components / interactions）。

---

## 1) Redline：視覺設計系統（不可妥協）

### 1.1 形狀與線條（Shapes & Lines）
- **零圓角（NO Rounded Corners）**
  - 全站所有可互動 UI（Button / Card / Input / Badge / Modal / Table Row）
  - `border-radius: 0`（Tailwind：`rounded-none`）
- **銳利切角（Chamfered Edges）**
  - 使用 `clip-path` 做 45° 切角（機械零件語彙）
  - 建議做成 utility class：`.chamfer` / `.chamfer-sm` / `.chamfer-lg`
  - 建議做成可重用的「容器外框」而非每個元件各自處理（避免不一致）
- **速度傾角（Velocity Skew）**
  - 僅針對：Headings / 主要 CTA（避免整頁都斜造成閱讀疲勞）
  - `transform: skew(-10deg)`（建議搭配反向 skew 的內層文字校正以確保可讀性）

---

### 1.2 色彩計畫（Dark Mode）
> 原則：**瀝青黑底 + 賽道紅作為系統高亮 + 信號黃只用在警示/倒數/關鍵數據**。

- **Base Asphalt**：`#111111`、`#0F0F0F`
- **Racing Red**：`#FF1E1E`（或 `#E60000`，擇一固定）
- **Data White**：`#F0F0F0`
- **Signal Yellow**：`#FFD700`

#### Token 建議（用 CSS variables 或 Tailwind theme）
- `--bg-0: #0F0F0F`（背景）
- `--bg-1: #111111`（面板）
- `--fg-0: #F0F0F0`（主字）
- `--fg-1: rgba(240,240,240,.72)`（次字）
- `--line: rgba(240,240,240,.14)`（線框）
- `--red: #FF1E1E`
- `--yellow: #FFD700`
- `--ok: #40FF8A`（僅用在確認/成功印章，避免到處綠）

---

### 1.3 字體排印（Typography）
- **Headings（全域）**：`Chakra Petch`（Bold + Italic）
- **Telemetry（數據/內文）**：`Share Tech Mono`（或 `JetBrains Mono`；二擇一，建議前者更「機械」）

#### 排印規則（務必一致）
- Headings：大寫、字距拉開、傾角（skew）
- Telemetry：所有金額/點數/時間/狀態碼 → 走 mono + `tabular-nums`
- 禁止「普通內文字體」混入數據區（會瞬間掉價）

---

### 1.4 VFX（背景材質 / 互動）
- **背景材質**
  - Grid（細網格）+ Scanlines（掃描線）二層疊加
  - 不做花俏 3D，避免干擾讀數
- **按鈕 Hover 回饋（不只是變色）**
  - 方案 A（推薦）：**紅色填滿**（Fill Red）→ 像系統進入 Armed 狀態
  - 方案 B：**Glitch**（短暫雜訊位移 + 掃描線強化）→ 只用在主 CTA / CONFIRMED 印章

---

## 2) Cockpit：UX 與互動邏輯（駕駛艙體驗）

### 2.1 智慧儀表板（Context-Aware Dashboard）
- **有活動（近 24h）**
  - 顶部顯示「NEXT RACE」卡：
    - 倒數計時（T-xx:xx:xx）
    - 報到 QR（可快速切到全螢幕高亮）
    - 地點導航 CTA（Google Maps deep link）
- **平常（無近期活動）**
  - 顯示 HUD：
    - 巨大的「點數」像遙測讀數（Telemetry）
    - 等級進度：轉速表/紅線區（Redline zone）語彙
- **禁忌**
  - 不顯示「Welcome, User」之類廢話
  - 不要讓使用者自己找票、找 QR、找地點

---

### 2.2 極速報名（Frictionless Action）
- **Auto-fill**
  - 已登入：姓名/電話/email 全程預填
  - 預設唯讀，若允許改 → 需要明確「解除鎖定」操作（避免誤改）
- **One-Tap**
  - 點數足夠/免費：按下立即報名，**跳過確認頁**
- **Feedback**
  - 報名成功：機械「咬合」動畫（短）+ `CONFIRMED` 印章（強）
- **Low Fuel**
  - 點數不足：顯示「LOW FUEL」並提供儲值 CTA（不中斷流程）

---

### 2.3 數位賽照（The Paddock Pass）
- 設計成「金屬識別證」：硬線條、切角、證件照式資訊佈局
- 點 QR：進入全螢幕高亮 + 雷射掃描動畫（確保掃描器一次讀到）

---

### 2.4 導航（Navigation）
- Mobile：底部導航（像撥桿開關 / toggle）
- Desktop：側邊欄（像 cockpit switches）
- 選中狀態：紅光 Glow（但要克制，避免全站發光）

---

## 3) 工程落地規格（如何在現有 codebase 實作）

### 3.1 Setup（tokens / fonts / utilities）
> 這一步是「外觀地基」。做得正確，後面替換元件會非常快。

- **字體**
  - `Chakra Petch`、`Share Tech Mono` 以 Next font 導入（全域）
- **tokens**
  - `globals.css` 定義 Redline tokens（覆蓋現有 palette）
  - `--radius: 0`（或乾脆刪除 radius tokens，避免漏網）
- **utilities**
  - `.scanlines`、`.grid`、`.glow-red`
  - `.chamfer`（clip-path）
  - `.skew-cta` / `.skew-title`

---

### 3.2 Components（共用元件：只做三個就能替換全站）
> 目標：把「工程師的 div/button/input」替換成一致的駕駛艙語彙。

- **`RacingButton`**
  - 默認：線框 + 暗底
  - Hover：Fill Red（主 CTA）/ Fill White（次要）
  - Disabled：像「系統未解鎖」而不是單純灰掉
- **`DataCard`**
  - 切角外框 + 內層 grid/scanlines
  - Header 區像儀表 label（小、mono、間距大）
- **`TelemetryText`**
  - 專門用於數據：`tabular-nums`、mono、可選 glow

#### 替換策略
- 先替換「最常見」三元件（Button/Card/Text）
- 再替換 Input/Badge/Table（可沿用相同外框容器）

---

### 3.3 Dashboard Refactor（首頁）
- 改成狀態決策器：
  - 未登入：品牌 + 加入/登入 CTA
  - 有活動（24h）：Next Race Card（倒數 + QR + 導航）
  - 無活動：HUD（點數/等級/紅線區）

---

### 3.4 Polish（微動畫與材質）
- 200ms 以上 loading 必有回饋（避免「當機感」）
- `CONFIRMED`：只用在成功狀態（別濫用）

---

## 4) 驗收點（你可以用這份 checklist 直接驗）

### 4.1 視覺（Redline）
- [ ] 全站圓角 = 0（Button/Card/Input/Badge/Table）
- [ ] 主要容器皆有切角（chamfer）
- [ ] Headings/CTA 有速度傾角（skew），但內文可讀
- [ ] Hover 有強回饋（Fill Red / Glitch），不是只有顏色變淡
- [ ] 背景有 grid/scanlines，但不干擾讀數

### 4.2 互動（Cockpit）
- [ ] 首頁能判斷：24h 內活動 → 直接顯示 QR + 倒數 + 導航
- [ ] 無活動 → HUD 顯示點數/等級進度（數據優先、無廢話）
- [ ] 報名一鍵執行（點數足夠/免費）→ 直接成功票券 + CONFIRMED
- [ ] 低點數（Low Fuel）有儲值 CTA，流程不中斷

---

## 5) 先做核心邏輯，還是先做美感？（我的判斷）

### 結論（建議順序）
**先做核心邏輯重構（@docs/ux-core-logic-refactor-plan.md 的 Phase 1），但在開始前先做「最小 Redline Setup」**。

換句話說：
- **先做：Setup（tokens + fonts + 基礎 utilities）** → 這是低風險、高回報、也能讓後續頁面一改就「像同一個系統」  
- **接著立刻做：核心邏輯（首頁情境 + 活動前台 + 一鍵報名）** → 這是體驗的引擎，不先做會導致你只是在做 skin
- **最後才：全站元件替換與 polish** → 有了真實流程與狀態後再全面換皮，才不會返工

### 為什麼不是「先全站美感重構」？
- 你要的是「駕駛」而不是「看起來快」：沒有情境決策、沒有一鍵報名、沒有票券/QR 的捷徑，視覺再 Redline 都只是在包裝表單。
- 全站先換皮會遇到大量返工：邏輯/版面改動（新增 `/events`、新增 ticket/QR HUD）會讓先前做的卡片/版型推倒重來。

### 最少返工的實作路線（你可以直接照做）
1. **最小 Setup**：字體 + tokens + chamfer/skew/scanlines utilities（1 次到位）
2. **Phase 1 核心邏輯**：首頁情境 + `/events` + 報名一鍵 + 成功票券（先把引擎做出來）
3. **Components 全面替換**：RacingButton / DataCard / TelemetryText（加速全站一致化）
4. **Polish**：glitch / CONFIRMED / loading skeleton（把「速度感」做成肌肉記憶）

