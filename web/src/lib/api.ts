import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";
import type { TFunction, TranslationKey } from "@/lib/i18n";

/**
 * Resolve the API origin.
 *
 * An explicit `NEXT_PUBLIC_API_URL` always wins (set this in production where the
 * API lives on its own domain). Otherwise, in the browser we talk to the API on
 * the *same host the page was opened from* — so the app works no matter how it's
 * reached (localhost, clamshell.local, a LAN IP, ...) without rebuilding.
 */
function resolveApiUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return explicit;
  if (typeof window !== "undefined") {
    const port = process.env.NEXT_PUBLIC_API_PORT ?? "4000";
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }
  // SSR / build-time fallback (no real requests are made from here).
  return "http://localhost:4000";
}

export const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/auth/refresh`,
      {},
      { withCredentials: true }
    );
    useAuthStore.getState().setSession(data.data.accessToken, data.data.user);
    return data.data.accessToken;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    const isAuthEndpoint = original?.url?.startsWith("/auth/") ?? false;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !isAuthEndpoint &&
      useAuthStore.getState().accessToken
    ) {
      original._retried = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Resolve an API error into a localized message.
 *
 * The server attaches a machine `code` (+ optional `params`) to every error; we
 * translate it via `t("errors.<CODE>", params)`. Pass the `t` from `useT()` and,
 * optionally, a fallback translation key. Validation (`details`) field errors
 * fall back to the server-provided string, and finally to `fallbackKey`.
 */
export function apiErrorMessage(
  error: unknown,
  t: TFunction,
  fallbackKey: TranslationKey = "errors.generic"
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return t("errors.network");
    const data = error.response?.data as
      | {
          code?: string;
          params?: Record<string, string | number>;
          message?: string;
          details?: Record<string, string[]>;
        }
      | undefined;
    if (data?.code) {
      const key = `errors.${data.code}` as TranslationKey;
      const translated = t(key, data.params);
      // `t` echoes the key back when it's unknown — fall through if so.
      if (translated !== key) return translated;
    }
    if (data?.details) {
      const first = Object.values(data.details).flat()[0];
      if (first) return first;
    }
    if (data?.message) return data.message;
  }
  return t(fallbackKey);
}

/** Resolve a server success/status `code` to a localized string (for toasts). */
export function apiStatusMessage(
  data: { code?: string; message?: string } | undefined,
  t: TFunction,
  fallbackKey: TranslationKey
): string {
  if (data?.code) {
    const key = `status.${data.code}` as TranslationKey;
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return t(fallbackKey);
}

/** Resolve relative upload URLs against the API origin. */
export function fileUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Already-absolute URLs pass through untouched: remote http(s) assets and
  // in-browser object/data URLs (e.g. URL.createObjectURL for upload previews).
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  return `${API_URL}${url}`;
}
