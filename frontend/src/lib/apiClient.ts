// frontend/src/lib/apiClient.ts
// Lớp trung gian gọi API backend ABP - tự đính Bearer token, xử lý lỗi tập trung

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:44326"
).replace(/\/+$/, "");
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  // NẾU ĐÃ LÀ LINK TUYỆT ĐỐI (http:// hoặc https://) -> TRẢ VỀ LUÔN, KHÔNG GẮN LOCALHOST VÀO NỮA
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${path}`;
}
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

  const requestUrl = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(requestUrl, {
      ...rest,
      headers: finalHeaders,
    });
  } catch (error) {
    throw new Error(
      `Không thể kết nối API (${requestUrl}). Hãy kiểm tra backend đang chạy và HTTPS certificate local đã được trust.`,
      { cause: error },
    );
  }

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
    const apiError = new Error(message) as Error & {
      status?: number;
      code?: string;
    };
    apiError.status = res.status;
    apiError.code = errorBody?.error?.code;
    throw apiError;
  }

  // 204 No Content (DeleteAsync thường trả kiểu này)
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
export function decodeJwtRoles(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload["role"] ?? payload["roles"] ?? [];
    return Array.isArray(role) ? role : [role];
  } catch {
    return [];
  }
}
