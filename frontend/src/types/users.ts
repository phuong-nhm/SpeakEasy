export interface IdentityRoleLookupDto {
  id: string;
  name: string;
}

export interface IdentityUserDto {
  id: string;
  userName: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  lockoutEnabled: boolean;
  creationTime: string;
  roleNames: string[];
}

export interface CreateIdentityUserDto {
  userName: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  isActive: boolean;
  lockoutEnabled: boolean;
  roleNames: string[];
}

export interface UpdateIdentityUserDto {
  userName: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  isActive: boolean;
  lockoutEnabled: boolean;
  roleNames: string[];
}
