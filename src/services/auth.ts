const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:5173/callback';

const SCOPES = [
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ');

const AUTH_STORAGE_KEY = 'youtube_dashboard_auth';

export interface AuthTokens {
  accessToken: string;
  expiresAt: number;
}

// Generate random string for state parameter (CSRF protection)
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getAuthUrl(): string {
  const state = generateRandomString(32);
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token', // Implicit Flow - returns access token directly
    scope: SCOPES,
    state: state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Parse tokens from URL hash (for implicit flow)
export function parseTokensFromHash(): AuthTokens | null {
  const hash = window.location.hash.substring(1);
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');
  const state = params.get('state');

  // Verify state parameter
  const savedState = sessionStorage.getItem('oauth_state');
  if (state !== savedState) {
    console.error('State mismatch - potential CSRF attack');
    return null;
  }

  if (!accessToken || !expiresIn) {
    return null;
  }

  const tokens: AuthTokens = {
    accessToken,
    expiresAt: Date.now() + parseInt(expiresIn, 10) * 1000,
  };

  saveTokens(tokens);
  sessionStorage.removeItem('oauth_state');

  // Clear hash from URL
  window.history.replaceState(null, '', window.location.pathname);

  return tokens;
}

export function saveTokens(tokens: AuthTokens): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
}

export function getStoredTokens(): AuthTokens | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthTokens;
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem('oauth_state');
}

export function isTokenExpired(tokens: AuthTokens): boolean {
  return Date.now() >= tokens.expiresAt - 60000; // 1 minute buffer
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  if (isTokenExpired(tokens)) {
    clearTokens();
    return null;
  }

  return tokens.accessToken;
}
