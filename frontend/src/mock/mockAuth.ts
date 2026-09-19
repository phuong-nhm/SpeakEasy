import {
  AuthResponse,
  AuthSession,
  User,
} from "@/features/frontend/auth/types/auth";

export const AUTH_STORAGE_KEY = "english-journey-auth";

const MOCK_ABP_USER: User = {
  id: "c8e1a1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
  userName: "student@example.com",
  email: "student@example.com",
  name: "A",
  surname: "Nguyễn Văn",
};

export const readStoredAuth = (): AuthSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.user || !parsed?.accessToken) return null;

    return parsed;
  } catch {
    return null;
  }
};

export const writeStoredAuth = (session: AuthSession): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredAuth = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const mockLoginApi = (
  email: string,
  pass: string,
): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "student@example.com" && pass === "123456") {
        resolve({
          user: MOCK_ABP_USER,
          accessToken: "mock-jwt-token-from-abp-backend",
        });
      } else {
        reject(
          new Error(
            "Email hoặc mật khẩu không chính xác! (Thử: student@example.com / 123456)",
          ),
        );
      }
    }, 600);
  });
};

export const mockRegisterApi = (
  surname: string,
  name: string,
  email: string,
  pass: string,
): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "student@example.com") {
        reject(
          new Error("Email này đã được sử dụng! Vui lòng chọn email khác."),
        );
        return;
      }

      const newUser: User = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}`,
        userName: email,
        email,
        name,
        surname,
      };

      resolve({
        user: newUser,
        accessToken: "mock-jwt-token-from-abp-backend-new-user",
      });
    }, 700);
  });
};
