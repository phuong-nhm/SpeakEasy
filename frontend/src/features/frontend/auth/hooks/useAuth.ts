"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/apiClient";
import { FormError, User } from "@/features/frontend/auth/types/auth";
import { authService } from "@/features/frontend/auth/services/authService";
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const AUTH_STATE_CHANGED_EVENT = "auth-state-changed";

export function useAuth() {
  const router = useRouter();

  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormError>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const notifyAuthChanged = useCallback(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
  }, []);

  const persistAuthSession = useCallback(
    (user: User) => {
      setCurrentUser(user);
      setAccessToken(getToken()); // đọc lại token vừa được authService lưu
      notifyAuthChanged();
    },
    [notifyAuthChanged],
  );

  const syncAuthState = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setCurrentUser(null);
      setAccessToken(null);
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      setAccessToken(token);
    } catch {
      setCurrentUser(null);
      setAccessToken(getToken());
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isMounted) return;

      await syncAuthState();
    };

    const handleAuthStateChanged = () => {
      void initializeAuth();
    };

    void initializeAuth();

    if (typeof window !== "undefined") {
      window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    }

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener(
          AUTH_STATE_CHANGED_EVENT,
          handleAuthStateChanged,
        );
      }
    };
  }, [syncAuthState]);
  const validateLoginForm = useCallback((): boolean => {
    const newErrors: FormError = {};

    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const validateRegisterForm = useCallback((): boolean => {
    const newErrors: FormError = {};

    if (!surname.trim()) {
      newErrors.surname = "Họ không được để trống";
    }

    if (!name.trim()) {
      newErrors.name = "Tên không được để trống";
    }

    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải từ 6 ký tự trở lên";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận lại mật khẩu";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [confirmPassword, email, name, password, surname]);

  const clearForm = useCallback(() => {
    setSurname("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateLoginForm()) return;

      setIsLoading(true);
      setErrors({});

      try {
        const response = await authService.login(email, password);
        persistAuthSession(response);
        clearForm();
        router.push("/dashboard");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không xác định";

        setErrors({ general: message });
      } finally {
        setIsLoading(false);
      }
    },
    [clearForm, email, password, persistAuthSession, router, validateLoginForm],
  );

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateRegisterForm()) return;

      setIsLoading(true);
      setErrors({});

      try {
        await authService.register({ surname, name, email, password });
        const response = await authService.login(email, password);
        persistAuthSession(response);
        clearForm();
        router.push("/dashboard");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không xác định";

        setErrors({ general: message });
      } finally {
        setIsLoading(false);
      }
    },
    [
      clearForm,
      email,
      name,
      password,
      persistAuthSession,
      router,
      surname,
      validateRegisterForm,
    ],
  );

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setAccessToken(null);
    setErrors({});
    notifyAuthChanged();
    router.push("/");
  }, [notifyAuthChanged, router]);

  return {
    surname,
    setSurname,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    errors,
    currentUser,
    accessToken,
    isAuthenticated: Boolean(currentUser && accessToken),
    handleLogin,
    handleRegister,
    logout,
  };
}
