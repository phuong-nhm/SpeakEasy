import { apiClient, clearToken, setToken } from "@/lib/apiClient";
import { User } from "@/features/frontend/auth/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:44300";

const CLIENT_ID = "EnglishLearningApp_App";
const DEFAULT_SCOPE = "EnglishLearningApp";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface RegisterPayload {
  surname: string;
  name: string;
  email: string;
  password: string;
  userName?: string;
}

interface MyProfileResponse {
  id?: string;
  userName?: string;
  email?: string;
  emailAddress?: string;
  name?: string;
  surname?: string;
}

const mapProfileToUser = (profile: MyProfileResponse): User => {
  const email = profile.email ?? profile.emailAddress ?? "";

  return {
    id: profile.id ?? "",
    userName: profile.userName ?? email,
    email,
    name: profile.name ?? "",
    surname: profile.surname ?? "",
  };
};

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const body = new URLSearchParams({
      grant_type: "password",
      username: email,
      password,
      client_id: CLIENT_ID,
      scope: DEFAULT_SCOPE,
    });

    const response = await fetch(`${API_BASE_URL}/connect/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        error?: string;
        error_description?: string;
      } | null;

      const message =
        errorBody?.error_description ||
        errorBody?.error ||
        "Đăng nhập thất bại";

      throw new Error(message);
    }

    const tokenData = (await response.json()) as TokenResponse;

    if (!tokenData.access_token) {
      throw new Error("Không nhận được access_token từ máy chủ.");
    }

    setToken(tokenData.access_token);

    return authService.getCurrentUser();
  },

  register: async (payload: RegisterPayload): Promise<void> => {
    await apiClient<void>("/api/account/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        userName: payload.userName ?? payload.email,
        emailAddress: payload.email,
        password: payload.password,
        appName: "EnglishLearningApp",
        name: payload.name,
        surname: payload.surname,
      }),
    });
  },

  logout: (): void => {
    clearToken();
  },

  getCurrentUser: async (): Promise<User> => {
    const profile = await apiClient<MyProfileResponse>(
      "/api/account/my-profile",
      {
        method: "GET",
      },
    );

    return mapProfileToUser(profile);
  },
};
