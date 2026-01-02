# Zählt / Zahit Redline — Day & Night Color System (Spec)

> 目標：把目前「tokens + semantic classes + hardcoded zinc」混用的狀態，收斂成一套**可控、可維護、可驗收**的配色規格。  
> 本文件**先定義顏色與用法**（Day / Night 兩套），**暫不改任何 UI 程式碼**。待你確認後再套用到全站。

---

## 1) 核心原則（不可妥協）

- **可讀性優先**：所有正文、狀態提示、表單 label/placeholder 在各種螢幕都必須清晰。  
  - 目標：正文最少達到 WCAG AA（一般文字 4.5:1，粗體/大字 3:1）。
- **語意化用色**：頁面不應直接寫 `text-zinc-400`、`bg-zinc-900/40` 這類「色階實作細節」。  
  - 改用語意 tokens：`--background`、`--card`、`--muted-foreground`、`--border`、`--accent`…
- **Redline 的色彩角色**：
  - **Racing Red（紅）**：只用在「主要行動 / Armed 狀態 / 重要提示」  
  - **Signal Yellow（黃）**：只用在「倒數 / 警示 / 需要注意的關鍵數據」  
  - **Green（綠）**：只用在「成功印章」；避免到處綠色造成掉價
- **Day / Night 是兩套完整系統**：不是把背景變白就叫 day。Day（Editorial）要像高質感型錄：留白乾淨、層次細、紅色克制但精準。

---

## 2) Palette Tokens（Day / Night）

> 這些 tokens 對應目前 `apps/web/src/app/globals.css` 的 CSS variables（`--background`…）。  
> 後續實作建議用 `data-theme="day|night"` 或 `.dark` 來切換，但**這裡先只規格**。

### 2.1 Night（黑夜 / Cockpit — V13 Approved ✅）

| Token | Value (V13) | 用途 | 狀態 |
|---|---:|---|---|
| `--background` | `#000000` | 全站底色（純黑） | 已核准 |
| `--foreground` | `#FFFFFF` | 主文字 (純白) | 已核准 |
| `--card` | `#111111` | 面板/卡片底色 | 已核准 |
| `--card-foreground` | `#FFFFFF` | 面板主文字 | 已核准 |
| `--muted` | `#1A1A1A` | 次要區塊底 | 已核准 |
| `--muted-foreground` | `#A1A1AA` | 次要文字 (Zinc-400) | **核心修復**：確保 100% 可見度 |
| `--border` | `#333333` | 分隔線 | 已核准 |
| `--accent` | `#FF1E1E` | 主要行動 (紅) | 已核准 |
| `--accent-2` | `#FFCC00` | 警示 (亮黃) | 已核准 |
| `--accent-3` | `#32D74B` | 成功 (鮮綠) | 已核准 |

**Night 的可讀性規則**
- **正文**：`--foreground`（純白）。
- **描述/副標**：`--muted-foreground`（Zinc-400），保證在黑底上清晰可見。

### 2.2 Day（白天 / Editorial — V13 Approved ✅）

| Token | Value (V13) | 用途 | 狀態 |
|---|---:|---|---|
| `--background` | `#F5F5F5` | 全站底色 (淺灰白) | 已核准 |
| `--foreground` | `#111111` | 主文字 (油墨黑) | 已核准 |
| `--card` | `#FFFFFF` | 面板/卡片底色 (純白) | 已核准 |
| `--card-foreground` | `#111111` | 面板主文字 | 已核准 |
| `--muted` | `#EDEDED` | 次要區塊底 | 已核准 |
| `--muted-foreground` | `#737373` | 次要文字 (Zinc-500) | **核心修復**：型錄級別對比度 |
| `--border` | `#D1D1D1` | 分隔線 | 已核准 |
| `--accent` | `#B4000B` | 主要行動 (精品紅) | 已核准 |
| `--accent-2` | `#9A6A12` | 警示 (赭金) | 已核准 |
| `--accent-3` | `#1E6B3A` | 成功 (深綠) | 已核准 |

**Editorial Day 的版面氣質規則（配色相關）**
- 不做大面積 glow：Day 版的紅色只用在「按鈕、重要標籤、選中狀態」，不要把整塊背景染紅。  
- Hover/selected 以「淡底 + 細線」為主：`--muted` + `--border`，用更精緻的層次取代高飽和特效。  
- 圖像/內容優先：Day 版讓商品、照片、內容成為主角，UI 退一步但仍精準。

---

## 3) Semantic Roles（把顏色角色固定下來）

> 下面是「每個 UI 部位該用哪個 token」的固定對照，避免各頁自由發揮。

### 3.1 Layout / Background
- **Page background**：`--background`
- **Backdrop / overlay（彈窗遮罩）**：`background: color-mix(in oklab, var(--background) 80%, transparent)`  
- **Texture（grid / scanlines / carbon fiber）**：只允許用 `--border` 或低 opacity 的 `--foreground`，不能引入新的灰階

### 3.2 Surfaces（卡片 / 面板）
- **Card surface**：`--card`
- **Card border**：`--border`
- **Card header label**：`--muted-foreground`
- **Card body text**：`--foreground`

### 3.3 Typography（文字）
- **Title / headline**：`--foreground`
- **Subtitle / description**：`--muted-foreground`
- **Microcopy（10–12px）**：仍用 `--muted-foreground`，但避免再疊 opacity

### 3.4 Controls（輸入 / 按鈕）
- **Input bg**：`--card`
- **Input text**：`--foreground`
- **Input placeholder**：`--muted-foreground`
- **Primary button**：bg/hover 走 `--accent`；文字固定白（Night/Day 都可）
- **Secondary button**：bg 走 `--card`/`--muted`；border 走 `--border`
- **Ghost button**：透明底 + `--muted` hover

### 3.5 Status Colors（狀態）
- **Success**：`--accent-3`（只做「印章」/「已確認」）
- **Warning**：`--accent-2`
- **Danger**：沿用 `--accent` 或另設 `--danger`（若要更深可用 `color-mix(in oklab, var(--accent) 85%, black)`）

### 3.6 Functional White（功能性白色）
有些區塊必須「就是白」才好用（例如 QR code 容器、列印/掃描場景）。
- **允許白底的唯一情境**：QR/票券掃描區  
  - Night：`#FFFFFF` + 明確 border（避免刺眼外溢）  
  - Day：`#FFFFFF` + 淺 border

---

## 4) Inventory：目前哪些地方「需要配色決策」

> 這一段是「盤點」，用來確定後續套用 palette 的修改面範圍（你可直接用它做驗收 checklist）。

### 4.1 全域 Tokens / Background（1 處）
- `apps/web/src/app/globals.css`
  - `:root` 的 tokens（`--background` / `--foreground` / `--card` / `--muted-foreground` / `--border`…）
  - `body` 背景（vignette / 紋理）
  - `.surface`, `.surface-hover`, `.scanlines`, `.hairline-grid`, `.carbon-fiber`

### 4.2 UI Primitives（顏色一致性的核心）
- `apps/web/src/components/ui/button.tsx`
  - variants：`primary/secondary/ghost/danger` 的 border/bg/hover/text
- `apps/web/src/components/ui/input.tsx`
  - bg/text/placeholder/focus ring/auto-fill
- `apps/web/src/components/ui/card.tsx`
  - `surface` + `scanlines` 疊加（卡片是否過暗、是否需要 day 版對應）
- `apps/web/src/components/ui/badge.tsx`
  - `accent/muted/success/warning/danger` 的底色與文字

### 4.3 Navigation / System UI（常駐元素）
- `apps/web/src/components/site-header.tsx`
  - header 背景 `bg-background/70`、nav link hover `bg-muted`
  - 品牌副標 `text-muted-foreground`
- `apps/web/src/components/mobile-nav.tsx`
  - active 狀態 `bg-accent/10 text-accent`
  - SYS overlay `bg-background/95`
- `apps/web/src/components/command-menu.tsx`
  - overlay `bg-background/80`
  - selected state `bg-accent/10 text-accent`
  - placeholder `text-muted-foreground`

### 4.4 Pages（會直接影響「你看到的可讀性」）

**Home / Dashboard**
- `apps/web/src/app/page.tsx`
  - Next Race 區塊背景 `bg-background/30` + radial gradient
  - `text-muted-foreground` 的資訊列（時間/地點/labels）
  - QR 容器目前有 `bg-white`（屬於 Functional White，需明確規格化）

**Events**
- `apps/web/src/app/events/page.tsx`
  - 空狀態卡（目前用 `bg-transparent` + `text-muted-foreground`，這就是你截圖中「看不到」的主因）
- `apps/web/src/app/events/[id]/page.tsx`
- `apps/web/src/app/events/[id]/register-client.tsx`

**Checkout / Orders**
- `apps/web/src/app/checkout/page.tsx`
  - label/desc 使用了硬編碼 `text-zinc-300/400/500`（需改成 tokens）
  - payment method selector 用 `border-accent bg-accent/10`（需 day/night 定義一致）
- `apps/web/src/app/orders/lookup/page.tsx`
  - label/desc 同樣混用 `text-zinc-*`
  - error panel 的紅色系（danger token 需規格化）

**Auth / Me / Admin（略，待套用時逐頁核對）**
- `apps/web/src/app/login/*`
- `apps/web/src/app/me/page.tsx`
- `apps/web/src/app/admin/**`

---

## 5) 建議的落地方式（等你核准後才做）

### 5.1 Theme 切換方式（建議）
- **方案 A**：`data-theme="night|day"`（最清晰、最好控）
- **方案 B**：沿用 `.dark`（需補 day 版 tokens，且避免被系統偏好干擾）

### 5.2 工程規則（避免再走回頭路）
- **禁止**：在 page 裡新增 `text-zinc-*`、`bg-zinc-*` 作為長期解法  
- **允許**：極少數「功能白」場景（QR/票券）
- **一切以 tokens 驅動**：要調亮/調暗，只改 tokens，不逐頁手動 patch

---

## 6) 你要我怎麼配（需要你一句話定調）

你已選擇：**C. Editorial Day（更像高質感型錄）** ✅  
我已完成 Day tokens 的 Editorial 版本（Night 版維持 Cockpit）。

**你已定稿（Final）✅**
- **Day Accent**：**C1 精品酒紅** → `--accent: #B4000B`
- **Day Background**：**Warm paper 暖紙白** → `--background: #F7F6F3`

---

## 7) 下一步（等你一句「開始套用」才會動程式碼）

當你回覆「開始套用」後，我會依本文件把全站配色收斂到 tokens（並移除頁面中的硬編碼 `zinc-*` 顏色），套用範圍依 **4) Inventory** 逐項進行，並在每一類（Global / Primitives / Nav / Pages）完成後給你截圖/對照讓你快速驗收。

