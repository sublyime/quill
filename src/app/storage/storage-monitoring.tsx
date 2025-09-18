'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  HardDrive
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StorageConfig {
  id: number;
  name: string;
  storageType: string;
  status: string;
  isActive: boolean;
  isDefault: boolean;
  lastTestedAt?: string;
  lastTestResult?: string;
}

interface DataStats {
  totalRecords: number;
  recentRecords24h: number;
  activeSources: number;
  dataTypes: number;
  sourceIds: string[];
  availableDataTypes: string[];
}

interface StorageMonitoringProps {
  storages: StorageConfig[];
}

export function StorageMonitoring({ storages }: StorageMonitoringProps) {
  const [dataStats, setDataStats] = useState<DataStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDataStats = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/data/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setDataStats(data);
      } else {
        throw new Error('Failed to fetch data statistics');
      }
    } catch (error: any) {
      console.error('Error fetching data stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data statistics.',
        variant: 'destructive',
      });
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await fetchDataStats();
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600';
      case 'ERROR': return 'text-red-600';
      case 'TESTING': return 'text-yellow-600';
      case 'INACTIVE': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ERROR': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'TESTING': return <Activity className="h-4 w-4 text-yellow-600 animate-pulse" />;
      case 'INACTIVE': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Mock data for charts (in a real app, this would come from your backend)
  const storageUsageData = [
    { name: 'Jan', usage: 65 },
    { name: 'Feb', usage: 78 },
    { name: 'Mar', usage: 82 },
    { name: 'Apr', usage: 88 },
    { name: 'May', usage: 95 },
    { name: 'Jun', usage: 92 },
  ];

  const storageTypeData = storages.reduce((acc, storage) => {
    const existing = acc.find(item => item.type === storage.storageType);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type: storage.storageType, count: 1 });
    }
    return acc;
  }, [] as { type: string; count: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Storage Monitoring</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Data Statistics Cards */}
      {dataStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataStats.totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time data records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataStats.recentRecords24h.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Records in last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataStats.activeSources}</div>
              <p className="text-xs text-muted-foreground">
                Data sources connected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Types</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataStats.dataTypes}</div>
              <p className="text-xs text-muted-foreground">
                Different data types
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Storage Status List */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Status</CardTitle>
            <div className="text-sm text-muted-foreground">
              Real-time status of all storage configurations
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storages.map((storage) => (
                <div
                  key={storage.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(storage.status)}
                    <div>
                      <div className="font-medium">{storage.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {storage.storageType}
                        {storage.isDefault && (
                          <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={storage.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={getStatusColor(storage.status)}
                    >
                      {storage.status}
                    </Badge>
                    {storage.lastTestedAt && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Last tested: {new Date(storage.lastTestedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {storages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No storage configurations found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Types</CardTitle>
            <div className="text-sm text-muted-foreground">
              Distribution of storage configurations by type
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {storageTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={storageTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {storageTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No storage configurations to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage Trends</CardTitle>
          <div className="text-sm text-muted-foreground">
            Historical storage usage over time
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={storageUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Active Data Sources */}
      {dataStats && dataStats.sourceIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Data Sources</CardTitle>
            <div className="text-sm text-muted-foreground">
              Currently connected data sources
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {dataStats.sourceIds.map((sourceId) => (
                <div
                  key={sourceId}
                  className="flex items-center gap-2 p-2 border rounded-lg"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-mono text-sm">{sourceId}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
