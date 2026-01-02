# Zählt × 平交道咖啡｜ERD（文字版：資料表 / 關聯 / 索引）

> 版本：v1.0｜日期：2025-12-31  
> 目的：提供可直接落 DB 的資料骨架，強調 **可稽核（流水）**、**可冪等（金流/核銷）**、**可擴充（廣告位/物流/發票）**。

---

### 0) 命名與共通欄位約定（建議）

- 所有表建議包含：`id (uuid)`、`created_at`、`updated_at`
- 所有「事件/流水」表建議額外包含：`occurred_at`、`actor_type/actor_id`、`ref_type/ref_id`、`metadata(json)`
- 枚舉欄位：用 string code（避免整數 magic number）

---

### 1) 會員與身份（登入 / 合併綁定）

#### 1.1 `members`

- **PK**：`id`
- **欄位（首日）**
  - `name`（必填）
  - `phone`（必填）
  - `email`（必填）
  - `birthday`（可選）
  - `vehicle_info`（可選：車種/車牌）
  - `address`（可選；若首日要寄送則提升必填）
  - `status`（ACTIVE/BLOCKED）
- **索引**
  - `uniq(email)`（若採大小寫不敏感需做 normalize）
  - `uniq(phone)`（若要避免重複註冊）

#### 1.2 `member_identities`

- 用於一個 member 綁多個登入身份（LINE + EMAIL）
- **PK**：`id`
- **FK**：`member_id -> members.id`
- **欄位**
  - `provider`（LINE/EMAIL）
  - `subject`（LINE: line_user_id；EMAIL: email_normalized）
  - `is_verified`（Email 必須為 true 才可用於登入/綁定完成）
- **索引**
  - `uniq(provider, subject)`
  - `idx(member_id)`

#### 1.3 `member_merge_logs`（建議）

- 記錄合併行為（可稽核）
- **PK**：`id`
- **欄位**
  - `from_member_id`、`to_member_id`
  - `initiated_by_member_id`
  - `method`（SELF_SERVICE）
  - `reason`
- **索引**
  - `idx(from_member_id)`、`idx(to_member_id)`

#### 1.4 `audit_logs`

- **PK**：`id`
- **欄位**
  - `action`（LINK_IDENTITY/UNLINK_IDENTITY/ADMIN_ADJUST_POINTS/...）
  - `actor_type`（MEMBER/STAFF/ADMIN/SYSTEM）
  - `actor_id`
  - `target_type/target_id`
  - `before(json)`、`after(json)`、`ip`、`user_agent`
- **索引**
  - `idx(actor_type, actor_id, created_at)`
  - `idx(target_type, target_id, created_at)`

---

### 2) 等級（Bronze/Silver/Gold）

#### 2.1 `tiers`

- **PK**：`code`（BRONZE/SILVER/GOLD）
- **欄位**：`name`、`benefits(json)`、`rules(json)`、`is_active`

#### 2.2 `member_tier_status`

- **PK**：`member_id`（1:1）
- **FK**：`member_id -> members.id`
- **欄位**
  - `current_tier_code -> tiers.code`
  - `progress(json)`（例如累計消費/點數/次數）
  - `last_evaluated_at`
- **索引**：`idx(current_tier_code)`

#### 2.3 `tier_change_logs`（建議）

- **PK**：`id`
- **欄位**：`member_id`、`from_tier`、`to_tier`、`reason_code`、`occurred_at`
- **索引**：`idx(member_id, occurred_at)`

---

### 3) 點數（流水為主）

#### 3.1 `point_rules`

- **PK**：`id`
- **欄位**
  - `earn_rules(json)`（各 ref_type 發點規則）
  - `redeem_rules(json)`（折抵範圍/上限/最小金額等）
  - `expiry_policy(json)`（有效期與延長條件：哪些 ref_type 算消費）
  - `is_active`

#### 3.2 `point_ledger`（append-only）

- **PK**：`id`
- **FK**：`member_id -> members.id`
- **欄位**
  - `type`（EARN/REDEEM/ADJUST/EXPIRE/REVERSAL）
  - `points_delta`（正負）
  - `reason_code`
  - `ref_type`（ORDER/PAYMENT/EVENT/REDEMPTION/AD_SLOT/...）
  - `ref_id`
  - `created_by_type`（SYSTEM/ADMIN/STAFF）
  - `created_by_id`
  - `occurred_at`
- **索引**
  - `idx(member_id, occurred_at)`
  - `idx(ref_type, ref_id)`

#### 3.3 `point_balances`（快取，可選但建議）

- **PK**：`member_id`
- **欄位**：`balance`、`updated_at`

---

### 4) 活動（報名 / 候補 / 報到）

#### 4.1 `events`

- **PK**：`id`
- **欄位**
  - `title`、`description`
  - `start_at`、`end_at`
  - `capacity`
  - `fee_amount`（0 代表免費）
  - `status`（DRAFT/PUBLISHED/CLOSED/ARCHIVED）
  - `settings(json)`（是否候補、限制等級/標籤等）
- **索引**
  - `idx(status, start_at)`

#### 4.2 `event_registrations`

- **PK**：`id`
- **FK**：`event_id -> events.id`、`member_id -> members.id`
- **欄位**
  - `status`（REGISTERED/UNPAID/PAID/CHECKED_IN/CANCELLED/WAITLIST）
  - `qr_token`、`qr_expires_at`、`checked_in_at`
  - `payment_id`（可選，若付費）
- **索引**
  - `uniq(event_id, member_id)`（避免重複報名）
  - `idx(event_id, status)`
  - `uniq(qr_token)`

#### 4.3 `event_checkin_logs`

- **PK**：`id`
- **欄位**：`registration_id`、`actor_staff_id`、`occurred_at`、`device_id`、`metadata`
- **索引**：`idx(registration_id, occurred_at)`

---

### 5) 兌換（券/商品）與核銷

#### 5.1 `redemption_items`

- **PK**：`id`
- **欄位**：`name`、`type`（VOUCHER/PRODUCT）、`points_cost`、`stock`、`validity(json)`、`is_active`

#### 5.2 `redemptions`

- **PK**：`id`
- **FK**：`member_id -> members.id`、`item_id -> redemption_items.id`
- **欄位**
  - `status`（ISSUED/REDEEMED/VOID）
  - `qr_token`、`qr_expires_at`
  - `redeemed_at`、`redeemed_by_staff_id`
- **索引**
  - `idx(member_id, created_at)`
  - `uniq(qr_token)`

#### 5.3 `redemption_redeem_logs`

- **PK**：`id`
- **欄位**：`redemption_id`、`actor_staff_id`、`occurred_at`、`metadata`

---

### 6) 電商（首日：下單→付款→出貨）

#### 6.1 `products`

- **PK**：`id`
- **欄位**：`name`、`description`、`is_active`

#### 6.2 `skus`

- **PK**：`id`
- **FK**：`product_id -> products.id`
- **欄位**：`sku_code`、`price`、`member_price`、`stock`、`attributes(json)`
- **索引**：`uniq(sku_code)`、`idx(product_id)`

#### 6.3 `orders`

- **PK**：`id`
- **FK**：`member_id -> members.id`（可選：若允許訪客購買則需 guest 方案）
- **欄位**
  - `status`（CREATED/UNPAID/PAID/FULFILLING/SHIPPED/COMPLETED/CANCELLED/REFUNDING/REFUNDED）
  - `order_number`（對外顯示用，供訪客查詢；建議不可猜測）
  - `subtotal_amount`、`discount_amount`、`points_redeemed`、`total_amount`
  - `shipping_name`、`shipping_phone`、`shipping_email`、`shipping_address`
  - `attribution_session_id`（可選：分潤歸因）
  -（可選）`claimed_at`（訪客訂單後續歸戶時間）
- **索引**
  - `idx(member_id, created_at)`
  - `idx(status, created_at)`
  - `uniq(order_number)`
  - `idx(shipping_email, created_at)`

#### 6.4 `order_items`

- **PK**：`id`
- **FK**：`order_id -> orders.id`、`sku_id -> skus.id`
- **欄位**：`qty`、`unit_price`、`total_price`
- **索引**：`idx(order_id)`

#### 6.5 `payments`

- **PK**：`id`
- **FK**：`order_id -> orders.id`
- **欄位**
  - `provider`（ECPAY）
  - `status`（INITIATED/PENDING/SUCCEEDED/FAILED/CANCELLED/REFUNDED）
  - `merchant_trade_no`（冪等鍵）
  - `provider_trade_no`（金流回傳）
  - `paid_at`
  - `raw_callback(json)`
- **索引**
  - `uniq(provider, merchant_trade_no)`
  - `idx(order_id)`

#### 6.6 `shipments`（首日可人工出貨）

- **PK**：`id`
- **FK**：`order_id -> orders.id`
- **欄位**：`carrier`、`tracking_no`、`shipped_at`、`status`
- **索引**：`idx(order_id)`

#### 6.7 `invoices`（延後啟用）

- **PK**：`id`
- **FK**：`order_id -> orders.id`
- **欄位**：`provider`、`status`、`invoice_no`、`issued_at`、`raw(json)`

---

### 7) 分潤（Sales / 歸因 / 流水）

#### 7.1 `sales_users`

- **PK**：`id`
- **欄位**：`name`、`status`

#### 7.2 `affiliate_links`

- **PK**：`id`
- **FK**：`sales_id -> sales_users.id`
- **欄位**：`code`、`landing_path`、`is_active`
- **索引**：`uniq(code)`、`idx(sales_id)`

#### 7.3 `attribution_sessions`

- **PK**：`id`
- **欄位**
  - `token`（寫 cookie/localStorage 或短期存放）
  - `sales_id`
  - `expires_at`（7 天）
  - `last_touch_at`
- **索引**：`uniq(token)`、`idx(sales_id, last_touch_at)`

#### 7.4 `payout_rules`

- **PK**：`id`
- **欄位**：`item_type`（SKU/EVENT/...)、`rule(json)`（固定/百分比/階梯）、`is_active`

#### 7.5 `payout_ledger`（append-only 或可反向）

- **PK**：`id`
- **FK**：`sales_id -> sales_users.id`
- **欄位**
  - `status`（PENDING/ELIGIBLE/PAID/REVERSED）
  - `amount`
  - `ref_type`（ORDER/ORDER_ITEM/EVENT_REG/...）
  - `ref_id`
  - `occurred_at`
  - `reason_code`（SERVICE_COMPLETED/REFUND/...)
- **索引**
  - `idx(sales_id, occurred_at)`
  - `idx(ref_type, ref_id)`

---

### 8) 推播與分眾

#### 8.1 `member_tags` / `member_tag_links`

- 標籤表與關聯表（多對多）

#### 8.2 `push_campaigns` / `push_messages`

- 活動/推播活動與發送紀錄（含目標分群條件快照）

