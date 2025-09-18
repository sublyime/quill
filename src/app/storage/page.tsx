'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Database, 
  Cloud, 
  Activity, 
  BarChart3,
  Download,
  Upload,
  Settings,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StorageForm } from './storage-form';
import { StorageList } from './storage-list';
import { StorageMonitoring } from './storage-monitoring';
import { DataVisualization } from './data-visualization';
import { BackupRestore } from './backup-restore';
import { toast } from '@/hooks/use-toast';

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

interface StorageStats {
  totalConfigurations: number;
  activeConfigurations: number;
  hasDefaultStorage: boolean;
  defaultStorageType: string;
}

export default function StoragePage() {
  const [storages, setStorages] = useState<StorageConfig[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState<StorageConfig | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStorages = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/storage', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setStorages(data);
      } else {
        throw new Error('Failed to fetch storage configurations');
      }
    } catch (error: any) {
      console.error('Error fetching storages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load storage configurations.',
        variant: 'destructive',
      });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/storage/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error: any) {
      console.error('Error fetching storage stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStorages(), fetchStats()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleStorageChange = () => {
    fetchStorages();
    fetchStats();
  };

  const handleAddStorage = (storage: StorageConfig) => {
    handleStorageChange();
    setIsDialogOpen(false);
    setEditingStorage(null);
  };

  const handleEditStorage = (storage: StorageConfig) => {
    setEditingStorage(storage);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStorage(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Storage Management</h1>
            <p className="text-muted-foreground">Loading storage configurations...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storage Management</h1>
          <p className="text-muted-foreground">
            Configure and manage your data storage solutions.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStorage(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Storage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStorage ? 'Edit Storage Configuration' : 'Add Storage Configuration'}
              </DialogTitle>
              <DialogDescription>
                {editingStorage 
                  ? 'Update your storage configuration settings.'
                  : 'Configure a new storage solution for your data.'
                }
              </DialogDescription>
            </DialogHeader>
            <StorageForm
              onStorageAdded={handleAddStorage}
              onCancel={closeDialog}
              editingStorage={editingStorage}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConfigurations}</div>
              <p className="text-xs text-muted-foreground">
                Storage configurations available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Storages</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConfigurations}</div>
              <p className="text-xs text-muted-foreground">
                Currently active and ready
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Default Storage</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.hasDefaultStorage ? (
                  <Badge className="text-xs">{stats.defaultStorageType}</Badge>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Primary storage system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={stats.activeConfigurations > 0 ? "default" : "secondary"}>
                  {stats.activeConfigurations > 0 ? "Healthy" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Overall system status
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Configurations</CardTitle>
              <div className="text-sm text-muted-foreground">
                Manage your storage solutions and their configurations.
              </div>
            </CardHeader>
            <CardContent>
              <StorageList
                storages={storages}
                onStorageChange={handleStorageChange}
                onEdit={handleEditStorage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <StorageMonitoring storages={storages} />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataVisualization />
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <BackupRestore storages={storages} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <div className="text-sm text-muted-foreground">
                Global storage configuration and maintenance options.
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Auto-cleanup Old Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically remove data older than 30 days
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Storage Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable real-time storage health monitoring
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Data Encryption</h4>
                  <p className="text-sm text-muted-foreground">
                    Encrypt data at rest in all storage systems
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
