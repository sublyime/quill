'use client';

import { User } from '@/app/users/columns';

const API_BASE_URL = 'http://localhost:8080/api';

// Fetch all users
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const data = await response.json();
  // Transform backend data to frontend format
  return data.map((user: any) => ({
    id: user.id.toString(),
    name: user.firstName || user.username,
    email: user.email,
    role: user.roles?.[0] || 'Viewer',
    status: user.status === 'ACTIVE' ? 'active' : 'inactive',
  }));
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id' | 'status'>): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userData.name,
      email: userData.email,
      firstName: userData.name,
      roles: [userData.role.toUpperCase()],
      status: 'ACTIVE',
      password: 'tempPassword123', // This should be handled securely
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  const newUser = await response.json();
  return {
    id: newUser.id.toString(),
    name: newUser.firstName || newUser.username,
    email: newUser.email,
    role: userData.role,
    status: 'active',
  };
};

// Update an existing user
export const updateUser = async (user: User): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: user.name,
        email: user.email,
        firstName: user.name,
        roles: [user.role.toUpperCase()],
        status: user.status.toUpperCase(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  const updatedUser = await response.json();
  return {
    id: updatedUser.id.toString(),
    name: updatedUser.firstName || updatedUser.username,
    email: updatedUser.email,
    role: user.role, // Assuming the role doesn't change on update in this response
    status: updatedUser.status === 'ACTIVE' ? 'active' : 'inactive',
  };
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
