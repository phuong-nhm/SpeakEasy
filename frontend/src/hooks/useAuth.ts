"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  clearStoredAuth,
  mockLoginApi,
  mockRegisterApi,
  readStoredAuth,
  writeStoredAuth,
} from "@/mock/mockAuth";
import { AuthResponse, FormError, User } from "@/types/auth";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

  const persistAuthSession = useCallback((response: AuthResponse) => {
    writeStoredAuth({
      user: response.user,
      accessToken: response.accessToken,
    });

    setCurrentUser(response.user);
    setAccessToken(response.accessToken);
  }, []);

  const initializeAuth = useCallback(() => {
    const stored = readStoredAuth();
    if (!stored) return;

    setCurrentUser(stored.user);
    setAccessToken(stored.accessToken);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const validateLoginForm = useCallback((): boolean => {
    const newErrors: FormError = {};

    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không hợp lệ";
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
        const response = await mockLoginApi(email, password);
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
        const response = await mockRegisterApi(surname, name, email, password);
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
    clearStoredAuth();
    setCurrentUser(null);
    setAccessToken(null);
    setErrors({});
    router.push("/");
  }, [router]);

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
