# UX 核心邏輯重構計畫表（Don't Make Me Think / Speed is a Feature）

> 目標：重構「業務邏輯」與「使用者流程」，以**消除摩擦**為優先；視覺美化不是本輪主目標。
>
> 本計畫優先處理兩條核心路徑：**(1) 首頁智慧情境判斷**、**(2) 活動報名流程**。

---

## 0. 現況盤點（以 codebase 為準）

### 0.1 已存在的關鍵資料來源（後端）
- **會員中心資料**：`GET /me` 會回傳
  - `points_balance`、`tier`、`total_spent`
  - `registrations[]`（包含 `qr_token` 與 `event { title, event_date, location }`）
- **活動（後端）能力**：後端已有 events 模組（包含 public list / register / checkin 等），但前台頁面尚未完整串起。

### 0.2 目前站內所有 `form` 提交流程（需要逐一套用「預填 / 一鍵 / loading / error」原則）
> 先列出檔案清單（後續會按優先序改寫）。

- **前台**
  - `apps/web/src/app/checkout/page.tsx`（結帳建立訂單）
  - `apps/web/src/app/checkout/atm/page-client.tsx`（ATM 轉帳頁 / 回報）
  - `apps/web/src/app/orders/lookup/page.tsx`（訪客查訂單）
  - `apps/web/src/app/login/login-client.tsx`（會員 Email OTP）
- **後台**
  - `apps/web/src/app/admin/login/page-client.tsx`
  - `apps/web/src/app/admin/orders/page.tsx`（搜尋/篩選）
  - `apps/web/src/app/admin/members/[id]/page-client.tsx`（調整點數）
  - `apps/web/src/app/admin/events/page-client.tsx`（建立活動）
  - `apps/web/src/app/admin/events/[id]/page-client.tsx`（活動報到/核銷）

### 0.3 重要缺口（會影響你指定的兩條核心路徑）
- **前台活動頁缺口**：目前 `apps/web/src/app/` 沒有 `/events`（活動列表）與 `/events/[id]`（活動詳情/報名）頁面。
- **首頁是靜態行銷頁**：尚未依登入/活動狀態做「智慧情境」渲染。
- **Header 尚無點數即時顯示**：也沒有共享的「Identity/Wallet」狀態層，無法做到報名後即時更新。

---

## 1. 里程碑（Milestones）與驗收標準（Acceptance Criteria）

## 1A. 智慧情境首頁（Context-Aware Dashboard）— 核心優先

### 需求拆解
- **邏輯 A（有活動，且在 24 小時內）**
  - 首屏直接顯示：**報到 QR Code** + **地點導航 CTA**
  - 不需要使用者再去找「我的活動」或進會員中心
- **邏輯 B（無活動）**
  - 顯示：**下一場推薦賽事**（若有公開活動）或 **會員等級進度 / 還差多少升級**
- **邏輯 C（未登入）**
  - 顯示：加入/登入 CTA + 品牌（不顯示空儀表板）

### 技術設計（預計）
- **首頁改成「情境決策器」**：Server Component 優先（快、可 SEO、避免閃爍）
  - 若有 `auth_token`：server 端打 `GET /me`
  - 依 `registrations` 找出「現在 ~ 24h」內最接近的一筆活動
  - 渲染 A/B；若沒 token 或 Unauthorized → 渲染 C（維持行銷 Hero）
- **QR Code 生成**
  - 方案 1（推薦）：前端用 SVG QR（輕量、快、無 canvas 問題）
  - 方案 2：Server 端生成 data URL（需要額外 lib）
- **地點導航 CTA**
  - 若 `location` 是地址：提供 Google Maps 深連結（mobile-first）
  - 若未提供 location：CTA 退化成「查看活動資訊」

### 驗收標準
- **A**：會員在活動門口打開首頁，**一眼看到 QR**，不用點第二下。
- **B**：無近期活動時，首頁不空；有「下一場活動」或「升級差額」提示。
- **C**：未登入時，首頁是強引導（加入/登入），不出現會員儀表板資訊。
- **效能**：首頁不允許「先顯示空白 → 再跳內容」的閃爍（避免 client-only gating）。

### 預計影響檔案
- `apps/web/src/app/page.tsx`（首頁邏輯重寫）
- 新增：`apps/web/src/components/dashboard/*`（情境卡片：UpcomingEventCard / TierProgressCard）

---

## 1B. 極速報名流程（Frictionless Registration）— 核心優先

### 需求拆解
- **預填（Auto-Prefill）**
  - 只要已登入：姓名/電話/Email 必須自動帶入
  - 預設唯讀；若要允許修改，需明確「編輯」行為（避免誤觸）
- **一鍵決策（One-Click Decision）**
  - **本輪決策（C：先不扣點/不付費）**：按「加入」→ 直接呼叫後端報名 → 進「成功票券」畫面（跳過確認頁）
  - **後續擴充（A/B：付費或扣點）**：才需要點數/付款判斷與不可逆操作防呆
- **Smart Error Handling（本輪範圍）**
  - 報名失敗（額滿/已報名/系統錯誤）要給可理解的原因 + 下一步（返回列表/聯繫）
  - **Low Fuel（點數不足）**：保留為後續擴充（本輪不扣點所以不會發生）

### 技術設計（預計）
> 因目前缺少前台活動頁，本里程碑包含「建立活動前台」與「報名 UI/流程」。

- **新增前台頁**
  - `/events`：活動列表（public）
  - `/events/[id]`：活動詳情（public），含「加入」動作（登入後可報名）
- **新增 Next BFF API proxies（避免在 client 帶 JWT）**
  - `apps/web/src/app/api/events/public/route.ts` → proxy `GET /events/public`
  - `apps/web/src/app/api/events/public/[id]/route.ts` → proxy `GET /events/public/:id`（本輪新增後端 endpoint）
  - `apps/web/src/app/api/events/[id]/register/route.ts` → proxy `POST /events/:id/register`
    - **會員一鍵報名**：由 server 端用 `auth_token` 先取 `/me` 拿到 `memberId/name/phone/email`，再呼叫後端 register（避免 client 重新輸入 & 避免 client 帶 JWT）
- **報名成功後的「票券」**
  - 直接顯示：QR token、活動時間、地點導航、狀態（REGISTERED/PAID…）
  - 允許一鍵加入行事曆（可選，非必需）
- **不可逆操作防呆（後續擴充：若報名會扣點/扣款）**
  - 以「長按確認 / 滑動解鎖」替代二次確認頁（更快、也更防誤觸）

### 驗收標準
- 已登入使用者在活動頁按「加入」：
  - **不需要**重新輸入姓名/電話/email
  - **不需要**額外確認頁（符合條件時）
  - 看到成功票券（含 QR 與導航）
- 點數不足（後續擴充）：
  - 不顯示冷冰冰 Error；顯示「燃料不足」+ 直接可點「去儲值」（本輪先導到 `/services`）。
- Loading/回饋：
  - API 超過 0.2 秒：顯示 skeleton 或 loading 狀態；不可讓按鈕像當機。

### 預計影響檔案
- 新增：
  - `apps/web/src/app/events/page.tsx`
  - `apps/web/src/app/events/[id]/page.tsx`
  - `apps/web/src/app/events/[id]/loading.tsx`（骨架屏）
  - `apps/web/src/app/api/events/public/route.ts`
  - `apps/web/src/app/api/events/public/[id]/route.ts`
  - `apps/web/src/app/api/events/[id]/register/route.ts`

---

## 1C. Identity & Wallet（狀態持久化 / Header 即時點數）

### 需求拆解
- **狀態持久化（State Persistence）**
  - 目標：切換分頁/回來不會突然被登出（避免 token 過期造成 UX 斷裂）
- **即時回饋（Real-time Feedback）**
  - 報名後點數變化：Header 的點數顯示不用 refresh 也會更新（Optimistic）

### 技術設計（預計）
- **建立 client-side 身分/錢包狀態層**
  - `useMe()`：集中管理 `me`（points_balance / tier / upcoming registration）
  - 使用 SWR 或簡易 polling（先用快、穩的做法）
- **更新策略**
  - 報名成功：先 optimistic 扣點/更新 registrations，再 background revalidate `GET /me`
- **Token Refresh（分階段）**
  - Phase 1：延長 cookie 有效期 + 每次重要操作失敗時導向重新登入（先穩）
  - Phase 2：加入 refresh endpoint（若後端支援/可增）做 silent refresh

### 驗收標準
- 報名成功後：
  - Header 的點數/狀態**立刻**反映（不刷新）
  - `/me` 的活動列表與首頁也一致（後台 revalidate 後一致）

### 預計影響檔案
- `apps/web/src/components/site-header.tsx`（新增點數顯示區）
- 新增：`apps/web/src/components/me/me-provider.tsx` 或 `apps/web/src/lib/use-me.ts`

---

## 1D. 導航與防呆（Back / Scroll Preservation / Empty State）

### 需求拆解
- 深層頁（活動詳情、票券頁）提供明確「返回」
- 返回後保留原 scroll 位置（避免跳頂）
- 空狀態要能引導（例如：沒有活動 → 引導去活動列表）

### 技術設計（預計）
- 新增 `BackLink` 元件：
  - 優先 `router.back()`；若無 history 則 fallback 到指定路徑
- Scroll Position Preservation：
  - 以 `sessionStorage` 記錄列表頁 scrollY（key = pathname+search）
  - 返回列表頁時 restore（並避免干擾首次進入）
- Empty state 模板化：
  - `EmptyState` 元件（含標題、描述、主要 CTA）

### 驗收標準
- 從 `/events` 點進 `/events/[id]` 再返回：停在原位置，不跳頂。
- `/me` 活動/訂單為空：出現清楚引導與 CTA（不是 No Data）。

---

## 1E. Loading / Feedback（>0.2s 必有回饋）

### 需求拆解
- 任何 API 呼叫 >0.2s：顯示 skeleton / loading
- 重要操作（報名扣點）要有儀式與防誤觸（長按/滑動）

### 技術設計（預計）
- Client action buttons：
  - 用「延遲顯示 loading」（200ms threshold）避免閃爍
  - disabled + inline spinner + 成功/失敗 toast（或 inline message）
- Segment `loading.tsx`：
  - 活動詳情/活動列表提供 skeleton（不靠全頁白屏）

---

## 2. 執行順序（Implementation Order）

> 以「最短路徑提升核心體驗」排序。

### Phase 1（最高優先）
- **首頁智慧情境**：用 `/me.registrations` 驅動 A/B/C
- **前台活動列表/詳情**：補齊 `/events` 與 `/events/[id]`
- **一鍵報名**：register 直接成功票券

### Phase 2（同週完成）
- Identity/Wallet 狀態層：Header 點數即時更新 + 報名後 optimistic
- Loading skeleton：events list/detail + register button threshold loading
- Empty states：`/me` 與 `/events`

### Phase 3（後續）
- Token refresh（更完整的 session 穩定策略）
- 長按/滑動確認（針對扣點或不可逆操作）
- 全站其他 `form` 流程套用同一套 UX（checkout、lookup、admin tools）

---

## 3. 驗收清單（給你逐條勾）

### 3.1 首頁（Dashboard）
- [ ] 未登入：顯示加入/登入 CTA（不出現會員儀表板）
- [ ] 已登入且 24h 內有活動：首屏顯示 QR + 導航 CTA
- [ ] 已登入無近期活動：顯示下一場活動或升級差額

### 3.2 活動報名
- [ ] 活動頁按「加入」直接完成報名（符合條件時跳過確認頁）
- [ ] 已登入預填姓名/電話/email（預設唯讀）
- [ ] 點數不足顯示「燃料不足」+ 去儲值深連結
- [ ] >0.2s 有 loading/skeleton

### 3.3 身分與錢包
- [ ] 報名後 Header 點數即時更新（不刷新）
- [ ] `/me` 與首頁狀態一致（revalidate 後一致）

### 3.4 導航防呆
- [ ] 列表→詳情→返回：保留 scroll 位置
- [ ] 空狀態有引導 CTA（不是 No Data）

---

## 4. 風險與決策點（需要你確認/我會先用最穩做法）

- **本輪已確認的決策（避免衝突）**
  - 活動付費規則：**C（本輪先不扣點/不付費）**
  - 儲值 deep link：**`/services`**（後續若要錢包再新增 `/wallet`）
  - 首頁登入定義：**只把 MEMBER 當作儀表板登入者**（Admin/Staff/Sales 回首頁仍視為一般訪客 landing）
  - QR 內容：**只用 `qr_token`**
- **本輪新增/調整（為了讓前台活動頁可落地）**
  - 後端需補 public 活動單筆詳情：`GET /events/public/:id`（否則前台 `/events/[id]` 只能用列表資料硬找，資料不完整且不穩）

