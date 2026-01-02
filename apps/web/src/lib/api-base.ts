export function getApiBase() {
  // 優先使用 NEXT_PUBLIC_API_BASE_URL（開發時最不容易誤指到其他環境）
  // 若沒有再 fallback 到 API_BASE_URL（可用於 server-only 設定）
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL ??
    'http://localhost:3001/api/v1';
  return base.replace(/\/+$/, '');
}

