# Zählt × 平交道咖啡｜流程與狀態機（文字版）

> 版本：v1.0｜日期：2025-12-31  
> 對應文件：`docs/pro-club-prd.md`、`docs/pro-club-dev-plan.md`

---

### 0) 共通設計原則（這些要先定，才不會越做越亂）

- **冪等（Idempotency）**：金流 callback、核銷、點數調整、分潤回沖都必須可重送不重複入帳
- **append-only 流水**：點數、分潤、付款事件、核銷事件皆以流水紀錄，狀態欄位僅作為「當前視圖」
- **QR Token**：一次性 + 有效期 + 綁定用途（event_checkin / redemption / benefit）
- **狀態變更事件化**：每次狀態改變都記錄 `event_type`、`ref_type/ref_id`、`actor`、`occurred_at`

---

### 1) 旅程 1：加入（LINE / Email）→ 會員建檔 → 會員卡 QR

#### 1.1 登入/註冊主流程

- **LINE 登入**
  - 客戶端發起 LINE Login（OIDC）
  - 後端建立/查找 `MemberAuthIdentity(provider=LINE, subject=line_user_id)`
  - 若無對應 member：建立 `Member`（先最小資料）
  - 導向「補齊資料」：姓名/手機/Email（Email 需要驗證）

- **Email 登入**
  - 建議採 **Email OTP**（一次性驗證碼）或 Email magic link
  - 驗證成功後建立/查找 `MemberAuthIdentity(provider=EMAIL, subject=email)`

#### 1.2 帳號綁定/合併（已定案：允許合併、用戶自行綁定）

- **綁定流程（從已登入的任一方開始）**
  - Step A：使用者在「帳號綁定」頁輸入欲綁定的 Email（或啟動 LINE 綁定）
  - Step B：系統發送 Email OTP / 驗證信
  - Step C：驗證成功後，將對應 `MemberAuthIdentity` 指向同一個 `member_id`
  - Step D：寫入 `AuditLog(action=LINK_IDENTITY, before/after, actor=member)`

- **衝突規則（避免誤合併）**
  - 若 Email 已綁定另一個 member：要求二次驗證（OTP）+ 明確提示「將合併資料」
  - 合併後，保留原 member 的流水（點數/分潤/訂單）並做映射（或做 member merge record）

---

### 2) 旅程 2：消費/交易 → 自動累點 → 等級自動升級

#### 2.1 點數入帳（EARN）

- 觸發來源（`ref_type`）
  - POS/現場消費（若有串接，或由後台補登）
  - 活動付費
  - 電商訂單付款成功
  - 廣告位付款成功（若啟用）
- **入帳方式**
  - 建立 `PointLedger(type=EARN, points_delta=+N, reason_code, ref_type/ref_id)`
  - 更新 `PointBalance`（若有快取）
  - 觸發等級評估：更新 `MemberTierStatus.progress/current_tier`

#### 2.2 等級自動升級

- 由排程或事件觸發（建議：交易入帳後立即評估）
- 升級時寫入 `TierChangeLog`（或以 `AuditLog` 記錄）

---

### 3) 旅程 3：點數使用（折抵/兌換）— 規則引擎

#### 3.1 折抵（在結帳時）

- 可配置參數（後台）
  - `allowed_ref_types`（哪些交易可用點）
  - `max_discount_percent`
  - `max_discount_amount`
  - `min_order_amount`（若需要）
- 流程
  - 訂單計算可折抵上限
  - 建立 `PointLedger(type=REDEEM, points_delta=-N, ref_type=ORDER, ref_id=order_id)`
  - 若付款失敗/取消：建立反向流水（或 `VOID` 機制，但建議以反向流水保持 append-only）

#### 3.2 兌換（券/商品）

- 兌換成功時：
  - 扣點：`PointLedger(type=REDEEM, -N, ref_type=REDEMPTION)`
  - 建立 `Redemption(status=ISSUED, qr_token, expires_at)`
- 核銷時（Staff 掃碼）：
  - 驗證 token（用途/有效期/一次性）
  - `Redemption.status=REDEEMED` + `RedemptionRedeemLog`

---

### 4) 旅程 4：活動（報名→提醒→現場報到核銷）

#### 4.1 活動狀態（Event）

- DRAFT → PUBLISHED → CLOSED → ARCHIVED

#### 4.2 報名狀態（EventRegistration）

- **免費活動**
  - REGISTERED → CHECKED_IN / CANCELLED
- **付費活動（可調整，預設付款成功才算報名成功）**
  - REGISTERED → UNPAID → PAID → CHECKED_IN / CANCELLED
- **候補（可調整）**
  - WAITLIST →（名額釋出）→ REGISTERED（通知 LINE/Email）

#### 4.3 現場報到（Staff 掃碼）

- 輸入：會員 QR 或 報名 QR token
- 驗證：
  - token 用途正確（event_checkin）
  - 未核銷、未過期、未被撤銷
- 產出：
  - `EventRegistration.status=CHECKED_IN`
  - `EventCheckinLog(actor=staff, device_id?, occurred_at)`

---

### 5) 電商：下單→付款（綠界）→ 出貨→ 完成（首日必備）

#### 5.0 訪客結帳（Guest Checkout）— 首日包含

- 訪客可直接下單，不需登入
- 訪客下單必填：姓名/手機/Email/收件地址（避免無法出貨/聯繫）
- 訂單查詢（訪客）：以 **`order_number + email`** 查詢狀態（不需登入）[[memory:12722575]]
- 訂單歸戶（可調整，建議首日就預留）
  - 若訪客後續以同 Email 完成登入/驗證，可將訂單綁定到 `member_id`
  - 綁定成功後可選擇補點（以 append-only 流水記錄）

#### 5.1 訂單狀態（Order）

- CREATED（建立）  
- UNPAID（待付款）
- PAID（已付款）
- FULFILLING（備貨中）
- SHIPPED（已出貨）
- COMPLETED（完成）
- CANCELLED（取消）
- REFUNDING（退款中）
- REFUNDED（已退款）

> 建議：`Order` 與 `Payment` 分表，避免把金流狀態塞進訂單欄位造成混亂。

#### 5.2 付款狀態（Payment）

- INITIATED（已建立付款）
- PENDING（等待金流回呼）
- SUCCEEDED（付款成功）
- FAILED（付款失敗）
- CANCELLED（付款取消）
- REFUNDED（已退款）

#### 5.3 綠界 callback 冪等

- 以 `merchant_trade_no` 或 `payment_id` 做冪等鍵
- callback 重送時不得重複：
  - 改 `Order` 狀態
  - 寫 `PointLedger`
  - 寫 `PayoutLedger`

#### 5.4 出貨（首日閉環）

- 若首日先不串物流：以後台人工填寫出貨單號/承運商
- 訂單進入 SHIPPED 時寫入 `ShipmentLog`

---

### 6) 分潤（Sales QR 歸因）— 成立於「服務完成」

#### 6.1 歸因 token（last-touch，7 天）

- Sales 產生 `AffiliateLink(code)` 與對應 landing URL
- 客人開啟 landing：
  - 寫入 `AttributionSession(token, sales_id, expires_at)`
  - 若 7 天內成交，以最後一次 token 為準

#### 6.2 分潤狀態（PayoutLedger）

- PENDING（已歸因但尚未成立）
- ELIGIBLE（服務完成，達成立條件）
- PAID（已結算）
- REVERSED（回沖）

#### 6.3 服務完成事件（成立時點）

- 來源可能是：
  - 電商：管理員將訂單標為 COMPLETED（或服務完成）
  - 服務型商品：後台建立 `ServiceCompletion` 事件
- 成立時：
  - 將對應 `PayoutLedger` 由 PENDING → ELIGIBLE

#### 6.4 退款/取消自動回沖（已定案）

- 若訂單退款/取消：
  - 產生反向分潤流水或將原流水標記為 REVERSED（需保留原因與參照退款單）
  - 同步修正報表聚合

