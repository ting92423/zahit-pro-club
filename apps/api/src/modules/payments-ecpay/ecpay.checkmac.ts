import crypto from 'crypto';

function dotNetUrlEncode(input: string) {
  // 近似綠界官方的 .NET UrlEncode 規則
  return encodeURIComponent(input)
    .replace(/%20/g, '+')
    .replace(/%21/g, '!')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%2a/gi, '*')
    .replace(/%2d/gi, '-')
    .replace(/%2e/gi, '.')
    .replace(/%5f/gi, '_');
}

export function computeCheckMacValue(params: Record<string, unknown>, hashKey: string, hashIv: string) {
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (k === 'CheckMacValue') continue;
    filtered[k] = String(v);
  }

  const sortedKeys = Object.keys(filtered).sort((a, b) => a.localeCompare(b));
  const query = sortedKeys.map((k) => `${k}=${filtered[k]}`).join('&');
  const raw = `HashKey=${hashKey}&${query}&HashIV=${hashIv}`;
  const encoded = dotNetUrlEncode(raw).toLowerCase();
  return crypto.createHash('md5').update(encoded).digest('hex').toUpperCase();
}

export function verifyCheckMacValue(params: Record<string, unknown>, hashKey: string, hashIv: string) {
  const expected = computeCheckMacValue(params, hashKey, hashIv);
  const provided = String(params.CheckMacValue ?? '');
  return expected === provided;
}

