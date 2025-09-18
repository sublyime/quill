'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Settings, Trash2, TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { STORAGE_CONFIGS } from './storage-types';
import {
  fetchStorageConfigs as apiFetchStorageConfigs,
  testConnection as apiTestConnection,
  deleteStorage as apiDeleteStorage,
  setAsDefault as apiSetAsDefault,
} from '@/lib/storage-api';
import type { StorageConfig } from './storage-types';

export default function StoragePage() {
  const [storageConfigs, setStorageConfigs] = useState<StorageConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingIds, setTestingIds] = useState<Set<number>>(new Set());

  const fetchStorageConfigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetchStorageConfigs();
      setStorageConfigs(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load storage configurations.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorageConfigs();
  }, [fetchStorageConfigs]);

  const testConnection = async (id: number) => {
    setTestingIds(prev => new Set(prev).add(id));
    try {
      const updatedConfig = await apiTestConnection(id);
      setStorageConfigs(prev => prev.map(config => config.id === id ? updatedConfig : config));
      toast({ title: 'Connection Test', description: updatedConfig.lastTestResult || 'Connection test completed' });
    } catch (error) {
      toast({ title: 'Test Failed', description: 'Failed to test storage connection', variant: 'destructive' });
    } finally {
      setTestingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const deleteStorage = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await apiDeleteStorage(id);
      setStorageConfigs(prev => prev.filter(config => config.id !== id));
      toast({ title: 'Storage Deleted', description: `"${name}" has been deleted.` });
    } catch (error) {
      toast({ title: 'Delete Failed', description: 'Failed to delete storage configuration', variant: 'destructive' });
    }
  };

  const setAsDefault = async (id: number, name: string) => {
    try {
      await apiSetAsDefault(id);
      setStorageConfigs(prev => prev.map(config => ({ ...config, isDefault: config.id === id })));
      toast({ title: 'Default Set', description: `"${name}" is now the default.` });
    } catch (error) {
      toast({ title: 'Update Failed', description: 'Failed to set default storage', variant: 'destructive' });
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'TESTING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'TESTING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  // Render logic remains the same
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading storage configurations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Storage Configurations</h1>
          <p className="text-muted-foreground">Manage your data storage providers and configurations.</p>
        </div>
        <Link href="/storage/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Storage Configuration
          </Button>
        </Link>
      </div>

      {storageConfigs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Storage Configurations</h2>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first storage configuration to begin storing your data.
              </p>
              <Link href="/storage/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Storage Configuration
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {storageConfigs.map((config) => {
            const storageTypeConfig = STORAGE_CONFIGS[config.storageType as keyof typeof STORAGE_CONFIGS];
            const isTestingThis = testingIds.has(config.id);
            
            return (
              <Card key={config.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{storageTypeConfig?.icon || '💾'}</span>
                      <div>
                        <CardTitle className="text-lg">{config.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {storageTypeConfig?.name || config.storageType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {config.isDefault && (
                        <Badge variant="default" className="text-xs">Default</Badge>
                      )}
                      <Badge className={`text-xs ${getStatusColor(config.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(config.status)}
                          <span>{config.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(config.createdAt).toLocaleDateString()}
                    </div>
                    {config.lastTestedAt && (
                      <div className="text-sm">
                        <span className="font-medium">Last Tested:</span>{' '}
                        {new Date(config.lastTestedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between space-x-2">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(config.id)}
                        disabled={isTestingThis}
                      >
                        {isTestingThis ? (
                          <Clock className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <TestTube className="h-3 w-3 mr-1" />
                        )}
                        Test
                      </Button>
                      {!config.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAsDefault(config.id, config.name)}
                        >
                          Set Default
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteStorage(config.id, config.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
