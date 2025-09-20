'use client';

import { User } from '@/app/users/columns';
import { UserProfile } from './user-types';

const API_BASE_URL = 'http://localhost:8080/api';

// Fetch all users
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id' | 'status'>): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      roles: userData.roles,
      status: 'ACTIVE',
      password: 'tempPassword123', // This should be handled securely in production
      phone: userData.phone
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  return response.json();
};

// Update an existing user
export const updateUser = async (user: User): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
        phone: user.phone
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
};

// Reset user's password (requires current password)
export const resetPassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reset password');
  }
};

// Force reset user's password (admin only)
export const forceResetPassword = async (userId: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/force-reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reset password');
  }
};

// Get user's full profile including roles and permissions
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
};
