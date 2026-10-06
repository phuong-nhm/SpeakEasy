import { apiClient } from "@/lib/apiClient";
import {
  AccountProfileDto,
  ChangePasswordInput,
  UpdateAccountProfileDto,
} from "../types/profile";

export const profileAccountService = {
  getMyProfile: async (): Promise<AccountProfileDto> => {
    return apiClient<AccountProfileDto>("/api/account/my-profile", {
      method: "GET",
    });
  },

  updateMyProfile: async (
    payload: UpdateAccountProfileDto,
  ): Promise<AccountProfileDto> => {
    return apiClient<AccountProfileDto>("/api/account/my-profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  changePassword: async (payload: ChangePasswordInput): Promise<void> => {
    await apiClient<void>("/api/account/my-profile/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export default profileAccountService;
