# Zählt × 平交道咖啡｜API 規格（REST：端點 / 權限 / Schema 摘要）

> 版本：v1.0｜日期：2025-12-31  
> 目標：讓前後端可以並行開發；端點以「首日必備」為主，並預留後續發票/物流/廣告位擴充。

---

### 0) 共通約定

- **Base URL**：`/api/v1`
- **Auth**
  - 會員：`Authorization: Bearer <member_jwt>`
  - 後台：`Authorization: Bearer <admin_or_staff_jwt>`
  - Sales：`Authorization: Bearer <sales_jwt>`
- **回應格式**
  - 成功：`{ "data": ... }`
  - 失敗：`{ "error": { "code": "...", "message": "...", "details": ... } }`
- **冪等**
  - 建議所有「建立交易/付款/核銷」類端點支援 `Idempotency-Key` header
- **時間**：ISO8601（UTC 或明確時區）

---

### 1) Auth（會員：LINE + Email）

#### 1.1 LINE Login

- **GET** `/auth/line/login-url`
  - **權限**：Public
  - **用途**：取得 LINE OIDC 導向 URL（含 state）

- **POST** `/auth/line/callback`
  - **權限**：Public
  - **輸入**：`{ code, state }`
  - **輸出**：`{ member_token, member }`

#### 1.2 Email Login（OTP）

- **POST** `/auth/email/request-otp`
  - **權限**：Public
  - **輸入**：`{ email }`
  - **輸出**：`{ request_id, expires_at }`

- **POST** `/auth/email/verify-otp`
  - **權限**：Public
  - **輸入**：`{ request_id, otp }`
  - **輸出**：`{ member_token, member }`

#### 1.3 帳號綁定（用戶自行綁定）

- **POST** `/me/identities/link-email/request-otp`
  - **權限**：Member
  - **輸入**：`{ email }`
  - **輸出**：`{ request_id, expires_at }`

- **POST** `/me/identities/link-email/verify-otp`
  - **權限**：Member
  - **輸入**：`{ request_id, otp }`
  - **輸出**：`{ member }`
  - **備註**：寫入 `audit_logs(LINK_IDENTITY)`

---

### 2) Member（會員中心）

- **GET** `/me`
  - **權限**：Member
  - **輸出**：會員資料（姓名/手機/Email/可選欄位）、tier、points_balance

- **PATCH** `/me`
  - **權限**：Member
  - **輸入**：可更新欄位（例如生日、車牌、地址）

- **GET** `/me/member-card`
  - **權限**：Member
  - **輸出**：`{ qr_payload, expires_at? }`
  - **備註**：會員卡 QR 可採「長效 + 伺服器查詢」或「短效 token」；若要做現場核銷建議短效

---

### 3) Points（點數）

- **GET** `/me/points/balance`
  - **權限**：Member
  - **輸出**：`{ balance }`

- **GET** `/me/points/ledger`
  - **權限**：Member
  - **查詢**：`?from=&to=&type=&page=`
  - **輸出**：流水列表

- **POST** `/admin/points/adjust`
  - **權限**：Admin
  - **輸入**：`{ member_id, points_delta, reason_code, note }`
  - **輸出**：`{ ledger_entry, new_balance }`
  - **備註**：必寫 audit log

---

### 4) Catalog / Content（官網與型錄）

- **GET** `/public/pages/:slug`
  - **權限**：Public

- **GET** `/public/catalogs`
  - **權限**：Public

- **GET** `/public/catalogs/:id`
  - **權限**：Public

---

### 5) Events（活動）

- **GET** `/public/events`
  - **權限**：Public

- **GET** `/public/events/:id`
  - **權限**：Public

- **POST** `/me/events/:id/register`
  - **權限**：Member
  - **輸出**：`{ registration }`（含 status、qr_token 或 member_qr 使用方式）

- **POST** `/staff/events/:id/checkin`
  - **權限**：Staff/Admin
  - **輸入**：`{ qr_token | member_qr_payload }`
  - **輸出**：`{ registration, checked_in_at }`
  - **冪等**：同一 token 重送返回同結果，不重複記錄

- **POST** `/admin/events`
  - **權限**：Admin

- **PATCH** `/admin/events/:id`
  - **權限**：Admin

- **GET** `/admin/events/:id/registrations`
  - **權限**：Admin

---

### 6) Redemptions（兌換/核銷）

- **GET** `/me/redemptions`
  - **權限**：Member

- **POST** `/me/redemptions`
  - **權限**：Member
  - **輸入**：`{ item_id }`
  - **輸出**：`{ redemption, qr_token }`

- **POST** `/staff/redemptions/redeem`
  - **權限**：Staff/Admin
  - **輸入**：`{ qr_token }`
  - **輸出**：`{ redemption, redeemed_at }`
  - **冪等**：同 token 重送返回同結果

- **POST** `/admin/redemption-items`
  - **權限**：Admin

---

### 7) Ecommerce（電商：首日必備）

#### 7.1 商品

- **GET** `/public/products`
  - **權限**：Public

- **GET** `/public/products/:id`
  - **權限**：Public

- **POST** `/admin/products`
  - **權限**：Admin

#### 7.2 訂單

- **POST** `/orders`（訪客下單）
  - **權限**：Public
  - **輸入（摘要）**
    - `items: [{ sku_id, qty }]`
    - `shipping: { name, phone, email, address }`
    - `points_to_redeem?`（訪客預設不可用點；若日後開放，需明確規則）
  - **輸出**：`{ order }`（含 `order_number`）
  - **冪等**：用 `Idempotency-Key` 避免重複下單

- **POST** `/me/orders`
  - **權限**：Member（若未來要支援訪客購買，另開 guest 流程）
  - **輸入（摘要）**
    - `items: [{ sku_id, qty }]`
    - `shipping: { name, phone, address }`
    - `points_to_redeem?`
  - **輸出**：`{ order }`
  - **冪等**：用 `Idempotency-Key` 避免重複下單

- **GET** `/me/orders`
  - **權限**：Member

- **GET** `/me/orders/:id`
  - **權限**：Member

- **POST** `/orders/lookup`
  - **權限**：Public
  - **用途**：訪客查詢訂單（不需登入）[[memory:12722575]]
  - **輸入**：`{ order_number, email }`
  - **輸出**：`{ order }`（需遮罩敏感資料）

- **PATCH** `/admin/orders/:id/status`
  - **權限**：Admin
  - **用途**：推進 FULFILLING/SHIPPED/COMPLETED；COMPLETED 會觸發「服務完成」分潤成立

#### 7.3 付款（綠界）

- **POST** `/me/orders/:id/payments/ecpay`
  - **權限**：Member
  - **輸出**：`{ payment, redirect_url | form_html }`
  - **備註**：依綠界規格提供導向

- **POST** `/payments/ecpay/callback`
  - **權限**：Public（由綠界打回）
  - **輸入**：綠界 callback payload
  - **行為（必須冪等）**
    - 更新 `payments.status`
    - 推進 `orders.status` 至 PAID（成功）
    - 寫入相關流水（點數/分潤 PENDING）

---

### 8) Attribution & Payout（業務歸因 / 分潤）

- **GET** `/public/s/:code`
  - **權限**：Public
  - **用途**：Sales 入口 landing（設定 attribution token；last-touch）
  - **輸出**：導向前台頁面（或回傳前台所需資料）

- **GET** `/sales/me/payouts`
  - **權限**：Sales
  - **查詢**：`?from=&to=&status=`

- **POST** `/admin/sales`
  - **權限**：Admin

- **POST** `/admin/sales/:id/links`
  - **權限**：Admin
  - **輸出**：`{ code, qr_url }`

- **POST** `/admin/payouts/settle`
  - **權限**：Admin
  - **輸入**：`{ from, to, sales_id? }`
  - **輸出**：結算結果與匯出檔案 id（或直接回傳 CSV）

---

### 9) Reports（報表）

- **GET** `/admin/reports/overview`
  - **權限**：Admin
  - **輸入**：`?from=&to=`
  - **輸出**：會員/點數/活動/電商/分潤核心指標

---

### 10) 錯誤碼（建議最小集合）

- `AUTH_UNAUTHORIZED`
- `AUTH_FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `IDEMPOTENCY_CONFLICT`
- `QR_TOKEN_EXPIRED`
- `QR_TOKEN_ALREADY_REDEEMED`
- `PAYMENT_CALLBACK_SIGNATURE_INVALID`
- `PAYMENT_ALREADY_PROCESSED`

