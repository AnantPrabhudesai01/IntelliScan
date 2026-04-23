const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const TOKEN_COOKIE = 'intelliscan_token';
const USER_COOKIE = 'intelliscan_user';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function safeLocalStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeLocalStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const prefix = `${name}=`;
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const item of parts) {
    if (item.startsWith(prefix)) {
      return decodeURIComponent(item.slice(prefix.length));
    }
  }
  return '';
}

function setCookie(name, value, maxAgeSeconds = COOKIE_MAX_AGE_SECONDS) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

function removeCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function encodeUserCookie(user) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(user || {}))));
  } catch {
    return '';
  }
}

function decodeUserCookie(raw) {
  try {
    const decoded = decodeURIComponent(escape(atob(raw)));
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  try {
    return safeLocalStorageGet(TOKEN_KEY) || 
           sessionStorage.getItem(TOKEN_KEY) || 
           getCookie(TOKEN_COOKIE) || '';
  } catch {
    return getCookie(TOKEN_COOKIE) || '';
  }
}

export function safeReadStoredUser() {
  let localRaw = safeLocalStorageGet(USER_KEY);
  if (!localRaw) {
    try { localRaw = sessionStorage.getItem(USER_KEY); } catch(e) {}
  }

  if (localRaw) {
    try {
      const parsed = JSON.parse(localRaw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      safeLocalStorageRemove(USER_KEY);
    }
  }

  const cookieRaw = getCookie(USER_COOKIE);
  if (!cookieRaw) return null;
  return decodeUserCookie(cookieRaw);
}

export function setStoredAuth({ token, user }) {
  const normalizedToken = String(token || '').trim();
  if (normalizedToken) {
    safeLocalStorageSet(TOKEN_KEY, normalizedToken);
    try { sessionStorage.setItem(TOKEN_KEY, normalizedToken); } catch(e) {}
    setCookie(TOKEN_COOKIE, normalizedToken);
  }

  if (user && typeof user === 'object') {
    const userJson = JSON.stringify(user);
    safeLocalStorageSet(USER_KEY, userJson);
    try { sessionStorage.setItem(USER_KEY, userJson); } catch(e) {}
    const encoded = encodeUserCookie(user);
    if (encoded) setCookie(USER_COOKIE, encoded);
  }
}

export function setStoredUser(user) {
  if (!user || typeof user !== 'object') return;
  const userJson = JSON.stringify(user);
  safeLocalStorageSet(USER_KEY, userJson);
  const encoded = encodeUserCookie(user);
  if (encoded) setCookie(USER_COOKIE, encoded);
}

export function resolveHomeRoute(user) {
  const role = user?.role || 'anonymous';
  if (role === 'super_admin') return '/admin/dashboard';
  if (role === 'business_admin') return '/workspace/dashboard';
  if (role === 'user') return '/dashboard/scan';
  return '/sign-in';
}

export function clearStoredAuth() {
  safeLocalStorageRemove(TOKEN_KEY);
  safeLocalStorageRemove(USER_KEY);
  // Clear scan cache
  safeLocalStorageRemove('intelliscan_cached_scan');
  safeLocalStorageRemove('intelliscan_cached_image');
  safeLocalStorageRemove('discoveryCode');
  // Clear cookies
  removeCookie(TOKEN_COOKIE);
  removeCookie(USER_COOKIE);
}

export function tryDecodeJwtPayload(token) {
  try {
    const raw = String(token || '').trim();
    if (!raw) return null;
    const parts = raw.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
