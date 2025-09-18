'use client';

import { StorageConfig } from '@/app/storage/storage-types';

const API_BASE_URL = 'http://localhost:8080/api/storage';

export const fetchStorageConfigs = async (): Promise<StorageConfig[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch storage configurations');
  }
  return await response.json();
};

export const createStorageConfig = async (config: Omit<StorageConfig, 'id' | 'status' | 'isDefault' | 'isActive' | 'createdAt' | 'updatedAt'>): Promise<StorageConfig> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });
    if (!response.ok) {
        throw new Error('Failed to create storage configuration');
    }
    return await response.json();
};

export const testConnection = async (id: number): Promise<StorageConfig> => {
  const response = await fetch(`${API_BASE_URL}/${id}/test`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to test storage connection');
  }
  return await response.json();
};

export const deleteStorage = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete storage configuration');
  }
};

export const setAsDefault = async (id: number): Promise<StorageConfig> => {
  const response = await fetch(`${API_BASE_URL}/${id}/set-default`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to set default storage configuration');
  }
  return await response.json();
};
