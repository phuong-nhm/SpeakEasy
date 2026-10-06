"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import profileAccountService from "@/features/frontend/profile/services/profileAccountService";
import { AccountProfileDto } from "@/features/frontend/profile/types/profile";

type ProfileFormState = {
  userName: string;
  email: string;
  name: string;
  surname: string;
  phoneNumber: string;
  concurrencyStamp?: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyProfileState: ProfileFormState = {
  userName: "",
  email: "",
  name: "",
  surname: "",
  phoneNumber: "",
  concurrencyStamp: undefined,
};

const emptyPasswordState: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const toProfileForm = (profile: AccountProfileDto): ProfileFormState => ({
  userName: profile.userName ?? "",
  email: profile.email ?? "",
  name: profile.name ?? "",
  surname: profile.surname ?? "",
  phoneNumber: profile.phoneNumber ?? "",
  concurrencyStamp: profile.concurrencyStamp,
});

export function ProfileAccountSettings() {
  const [profile, setProfile] = useState<AccountProfileDto | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileState);
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(emptyPasswordState);

  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsProfileLoading(true);
      setProfileError(null);

      try {
        const me = await profileAccountService.getMyProfile();
        setProfile(me);
        setProfileForm(toProfileForm(me));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin tài khoản.";
        setProfileError(message);
      } finally {
        setIsProfileLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const canChangePassword = useMemo(
    () => Boolean(profile?.hasPassword) && !profile?.isExternal,
    [profile?.hasPassword, profile?.isExternal],
  );

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const updated = await profileAccountService.updateMyProfile({
        userName: profileForm.userName,
        email: profileForm.email,
        name: profileForm.name,
        surname: profileForm.surname,
        phoneNumber: profileForm.phoneNumber,
        concurrencyStamp: profileForm.concurrencyStamp,
      });

      setProfile(updated);
      setProfileForm(toProfileForm(updated));
      setProfileSuccess("Đã cập nhật thông tin tài khoản.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cập nhật thông tin thất bại.";
      setProfileError(message);
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!canChangePassword) {
      setPasswordError("Tài khoản hiện tại không hỗ trợ đổi mật khẩu.");
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới cần tối thiểu 6 ký tự.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsPasswordSaving(true);

    try {
      await profileAccountService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(emptyPasswordState);
      setPasswordSuccess("Đổi mật khẩu thành công.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại.";
      setPasswordError(message);
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Thông tin tài khoản</h2>
        <p className="mt-1 text-sm text-slate-500">
          Cập nhật tên hiển thị, email và số điện thoại của bạn.
        </p>

        {profileError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {profileError}
          </div>
        )}

        {profileSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {profileSuccess}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input
              value={profileForm.userName}
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  userName: event.target.value,
                }))
              }
              disabled={isProfileLoading || isProfileSaving}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  email: event.target.value,
                }))
              }
              disabled={isProfileLoading || isProfileSaving}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tên</label>
              <input
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                disabled={isProfileLoading || isProfileSaving}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Họ</label>
              <input
                value={profileForm.surname}
                onChange={(event) =>
                  setProfileForm((previous) => ({
                    ...previous,
                    surname: event.target.value,
                  }))
                }
                disabled={isProfileLoading || isProfileSaving}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
            <input
              value={profileForm.phoneNumber}
              onChange={(event) =>
                setProfileForm((previous) => ({
                  ...previous,
                  phoneNumber: event.target.value,
                }))
              }
              disabled={isProfileLoading || isProfileSaving}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProfileLoading || isProfileSaving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProfileSaving ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Đổi mật khẩu</h2>
        <p className="mt-1 text-sm text-slate-500">
          Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật bảo mật tài khoản.
        </p>

        {!canChangePassword && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Tài khoản này hiện không hỗ trợ đổi mật khẩu tại đây.
          </div>
        )}

        {passwordError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((previous) => ({
                  ...previous,
                  currentPassword: event.target.value,
                }))
              }
              disabled={!canChangePassword || isPasswordSaving}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((previous) => ({
                  ...previous,
                  newPassword: event.target.value,
                }))
              }
              disabled={!canChangePassword || isPasswordSaving}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((previous) => ({
                  ...previous,
                  confirmPassword: event.target.value,
                }))
              }
              disabled={!canChangePassword || isPasswordSaving}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canChangePassword || isPasswordSaving}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPasswordSaving ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
