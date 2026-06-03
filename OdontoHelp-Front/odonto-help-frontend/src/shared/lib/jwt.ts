export function decodeJWT(token: string): { exp?: number; [key: string]: any } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload?.exp || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000;
}

export function isTokenExpired(token: string, offsetMs = 0): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() + offsetMs >= expiry;
}
