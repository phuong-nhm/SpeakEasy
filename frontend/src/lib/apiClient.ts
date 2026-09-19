// frontend/src/lib/apiClient.ts
// Lớp trung gian gọi API backend ABP - tự đính Bearer token, xử lý lỗi tập trung

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:44300";
const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null; // tránh lỗi khi chạy Server Component
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean; // dùng cho API [AllowAnonymous] không cần token
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      (finalHeaders as Record<string, string>)["Authorization"] =
        `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: finalHeaders,
  });

  // Token hết hạn/sai -> xoá token, đá về login
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    // ABP trả lỗi dạng { error: { message, details } }
    const errorBody = await res.json().catch(() => null);
    const message = errorBody?.error?.message || `API error: ${res.status}`;
    throw new Error(message);
  }

  // 204 No Content (DeleteAsync thường trả kiểu này)
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
