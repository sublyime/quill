'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  TestTube, 
  Star, 
  StarOff, 
  Power, 
  PowerOff, 
  Edit, 
  Trash2,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { STORAGE_CONFIGS } from './storage-types';

interface StorageConfig {
  id: number;
  name: string;
  storageType: string;
  configuration: string;
  status: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  lastTestedAt?: string;
  lastTestResult?: string;
  lastError?: string;
}

interface StorageListProps {
  storages: StorageConfig[];
  onStorageChange: () => void;
  onEdit?: (storage: StorageConfig) => void;
}

export function StorageList({ storages, onStorageChange, onEdit }: StorageListProps) {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const setLoading = (storageId: number, action: string, loading: boolean) => {
    setLoadingActions(prev => ({
      ...prev,
      [`${storageId}-${action}`]: loading
    }));
  };

  const isLoading = (storageId: number, action: string) => {
    return loadingActions[`${storageId}-${action}`] || false;
  };

  const testConnection = async (storage: StorageConfig) => {
    setLoading(storage.id, 'test', true);
    
    try {
      const response = await fetch(`http://localhost:8080/api/storage/${storage.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'ACTIVE') {
          toast({
            title: 'Connection Successful',
            description: `Successfully connected to ${storage.name}.`,
          });
        } else {
          toast({
            title: 'Connection Failed',
            description: result.lastError || `Failed to connect to ${storage.name}.`,
            variant: 'destructive',
          });
        }
        onStorageChange();
      } else {
        throw new Error('Test request failed');
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      toast({
        title: 'Test Failed',
        description: `Could not test connection to ${storage.name}.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(storage.id, 'test', false);
    }
  };

  const setAsDefault = async (storage: StorageConfig) => {
    setLoading(storage.id, 'default', true);
    
    try {
      const response = await fetch(`http://localhost:8080/api/storage/${storage.id}/set-default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast({
          title: 'Default Storage Updated',
          description: `${storage.name} is now the default storage.`,
        });
        onStorageChange();
      } else {
        throw new Error('Failed to set as default');
      }
    } catch (error: any) {
      console.error('Set default error:', error);
      toast({
        title: 'Error',
        description: `Could not set ${storage.name} as default.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(storage.id, 'default', false);
    }
  };

  const toggleActive = async (storage: StorageConfig) => {
    setLoading(storage.id, 'toggle', true);
    
    try {
      const response = await fetch(`http://localhost:8080/api/storage/${storage.id}/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast({
          title: 'Status Updated',
          description: `${storage.name} is now ${storage.isActive ? 'inactive' : 'active'}.`,
        });
        onStorageChange();
      } else {
        throw new Error('Failed to toggle active status');
      }
    } catch (error: any) {
      console.error('Toggle active error:', error);
      toast({
        title: 'Error',
        description: `Could not update status for ${storage.name}.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(storage.id, 'toggle', false);
    }
  };

  const deleteStorage = async (storage: StorageConfig) => {
    if (!confirm(`Are you sure you want to delete "${storage.name}"?`)) {
      return;
    }

    if (storage.isDefault) {
      toast({
        title: 'Cannot Delete',
        description: 'Cannot delete the default storage configuration.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(storage.id, 'delete', true);
    
    try {
      const response = await fetch(`http://localhost:8080/api/storage/${storage.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast({
          title: 'Storage Deleted',
          description: `${storage.name} has been deleted.`,
        });
        onStorageChange();
      } else {
        throw new Error('Failed to delete storage');
      }
    } catch (error: any) {
      console.error('Delete storage error:', error);
      toast({
        title: 'Error',
        description: `Could not delete ${storage.name}.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(storage.id, 'delete', false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'ERROR':
        return <Badge variant="destructive">Error</Badge>;
      case 'TESTING':
        return <Badge className="bg-yellow-100 text-yellow-800">Testing</Badge>;
      case 'CONFIGURED':
        return <Badge className="bg-blue-100 text-blue-800">Configured</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStorageIcon = (storageType: string) => {
    const config = STORAGE_CONFIGS[storageType.toLowerCase() as keyof typeof STORAGE_CONFIGS];
    return config ? config.icon : null;
  };

  if (storages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">No storage configurations found</div>
        <p className="text-sm text-gray-400">Add your first storage configuration to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {storages.map((storage) => {
        const StorageIcon = getStorageIcon(storage.storageType);
        
        return (
          <Card key={storage.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {StorageIcon && <StorageIcon className="h-6 w-6" />}
                  <div>
                    <CardTitle className="text-lg">{storage.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(storage.status)}
                      {storage.isDefault && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    
                    <DropdownMenuItem
                      onClick={() => testConnection(storage)}
                      disabled={isLoading(storage.id, 'test')}
                    >
                      {isLoading(storage.id, 'test') ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="mr-2 h-4 w-4" />
                      )}
                      Test Connection
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {!storage.isDefault && (
                      <DropdownMenuItem
                        onClick={() => setAsDefault(storage)}
                        disabled={isLoading(storage.id, 'default')}
                      >
                        {isLoading(storage.id, 'default') ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="mr-2 h-4 w-4" />
                        )}
                        Set as Default
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => toggleActive(storage)}
                      disabled={isLoading(storage.id, 'toggle')}
                    >
                      {isLoading(storage.id, 'toggle') ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : storage.isActive ? (
                        <PowerOff className="mr-2 h-4 w-4" />
                      ) : (
                        <Power className="mr-2 h-4 w-4" />
                      )}
                      {storage.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {onEdit && (
                      <DropdownMenuItem
                        onClick={() => onEdit(storage)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}

                    {!storage.isDefault && (
                      <DropdownMenuItem
                        onClick={() => deleteStorage(storage)}
                        disabled={isLoading(storage.id, 'delete')}
                        className="text-red-600 focus:text-red-600"
                      >
                        {isLoading(storage.id, 'delete') ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Type:</span> {storage.storageType}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(storage.createdAt).toLocaleDateString()}
                </div>
                {storage.lastTestedAt && (
                  <div>
                    <span className="font-medium">Last Tested:</span>{' '}
                    {new Date(storage.lastTestedAt).toLocaleString()}
                  </div>
                )}
                {storage.lastTestResult && (
                  <div>
                    <span className="font-medium">Result:</span> {storage.lastTestResult}
                  </div>
                )}
                {storage.lastError && (
                  <div className="text-red-600">
                    <span className="font-medium">Error:</span> {storage.lastError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
