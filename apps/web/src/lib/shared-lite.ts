// Minimal shared constants/functions duplicated from @zahit/shared
// to avoid Cloudflare build issues with workspace:* dependencies under npm tooling.

export const TIERS = {
  GUEST: 'GUEST',
  PRO: 'PRO',
  ELITE: 'ELITE',
  Z_MASTER: 'Z-MASTER',
} as const;

export type Tier = (typeof TIERS)[keyof typeof TIERS];

export const TIER_THRESHOLDS: Record<Tier, number> = {
  [TIERS.GUEST]: 0,
  [TIERS.PRO]: 1000,
  [TIERS.ELITE]: 10000,
  [TIERS.Z_MASTER]: 50000,
};

export function getNextTier(currentTier: string) {
  if (currentTier === TIERS.GUEST) return { next: TIERS.PRO, target: TIER_THRESHOLDS[TIERS.PRO] };
  if (currentTier === TIERS.PRO) return { next: TIERS.ELITE, target: TIER_THRESHOLDS[TIERS.ELITE] };
  if (currentTier === TIERS.ELITE) return { next: TIERS.Z_MASTER, target: TIER_THRESHOLDS[TIERS.Z_MASTER] };
  return { next: null, target: TIER_THRESHOLDS[TIERS.Z_MASTER] };
}

export const TIER_BENEFITS: Record<Tier, string[]> = {
  [TIERS.GUEST]: ['瀏覽官方任務', '公開預約功能'],
  [TIERS.PRO]: ['專屬任務參加權', '消費累積信用點'],
  [TIERS.ELITE]: ['特定任務優先權', '專屬推廣碼權限', '精選軍械庫 95 折'],
  [TIERS.Z_MASTER]: ['終極任務參加權', '全站精選軍械庫 9 折', '一對一技術支援'],
};

