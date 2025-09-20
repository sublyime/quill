import { User } from '@/app/users/columns';

export interface PasswordResetRequest {
  currentPassword: string;
  newPassword: string;
}

// Add these types to user-api.ts
export interface UserRole {
  id?: number;
  name: string;
  permissions?: string[];
}

export interface UserProfile extends Omit<User, 'roles'> {
  phone?: string;
  roles: UserRole[];
  permissions?: string[];
  lastLogin?: string;
  createdAt: string;  // Made required to match User type
  updatedAt: string;  // Made required to match User type
}