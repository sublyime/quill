'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  Legend
} from 'recharts';
import { 
  Download, 
  Search, 
  Filter, 
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  Database,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DataRecord {
  id: number;
  sourceId: string;
  dataType: string;
  payload: string;
  timestamp: string;
  metadata?: string;
  status: string;
}

interface FilterOptions {
  sourceId?: string;
  dataType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function DataVisualization() {
  const [data, setData] = useState<DataRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('table');

  // Fetch recent data on component mount
  useEffect(() => {
    fetchRecentData();
    fetchDataStats();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [data, filters, searchTerm]);

  const fetchRecentData = async (hours: number = 24) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/data/recent?hours=${hours}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const records = await response.json();
        setData(records);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data records.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataStats = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/data/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const stats = await response.json();
        setAvailableSources(stats.sourceIds || []);
        setAvailableTypes(stats.availableDataTypes || []);
      }
    } catch (error: any) {
      console.error('Error fetching data stats:', error);
    }
  };

  const fetchDataByRange = async (startDate: string, endDate: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/data/range?start=${startDate}&end=${endDate}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        const records = await response.json();
        setData(records);
      } else {
        throw new Error('Failed to fetch data by range');
      }
    } catch (error: any) {
      console.error('Error fetching data by range:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data for the specified range.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    // Apply source filter
    if (filters.sourceId && filters.sourceId !== 'all') {
      filtered = filtered.filter(record => record.sourceId === filters.sourceId);
    }

    // Apply data type filter
    if (filters.dataType && filters.dataType !== 'all') {
      filtered = filtered.filter(record => record.dataType === filters.dataType);
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.sourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.dataType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.payload.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply limit
    if (filters.limit && filters.limit > 0) {
      filtered = filtered.slice(0, filters.limit);
    }

    setFilteredData(filtered);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.sourceId && filters.sourceId !== 'all') {
        queryParams.append('sourceId', filters.sourceId);
      }
      if (filters.dataType && filters.dataType !== 'all') {
        queryParams.append('dataType', filters.dataType);
      }

      const response = await fetch(
        `http://localhost:8080/api/data/export/${format}?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data_export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Export Successful',
          description: `Data exported to ${format.toUpperCase()} format.`,
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Prepare chart data
  const getChartData = () => {
    const hourlyData = filteredData.reduce((acc, record) => {
      const hour = new Date(record.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      });
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(hourlyData)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => new Date(a.hour).getTime() - new Date(b.hour).getTime())
      .slice(-24); // Last 24 hours
  };

  const getSourceDistribution = () => {
    const sourceCount = filteredData.reduce((acc, record) => {
      acc[record.sourceId] = (acc[record.sourceId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sourceCount).map(([source, count]) => ({ source, count }));
  };

  const getTypeDistribution = () => {
    const typeCount = filteredData.reduce((acc, record) => {
      acc[record.dataType] = (acc[record.dataType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({ type, count }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Visualization</h2>
          <p className="text-muted-foreground">
            Explore and analyze your stored data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchRecentData()}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => exportData('json')}
            variant="outline"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button
            onClick={() => exportData('csv')}
            variant="outline"
            size="sm"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="source">Data Source</Label>
              <Select
                value={filters.sourceId || 'all'}
                onValueChange={(value) => handleFilterChange('sourceId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {availableSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Data Type</Label>
              <Select
                value={filters.dataType || 'all'}
                onValueChange={(value) => handleFilterChange('dataType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="limit">Limit</Label>
              <Select
                value={filters.limit?.toString() || '1000'}
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="1000" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 records</SelectItem>
                  <SelectItem value="500">500 records</SelectItem>
                  <SelectItem value="1000">1000 records</SelectItem>
                  <SelectItem value="5000">5000 records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.length !== filteredData.length && `of ${data.length.toLocaleString()} total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Sources</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredData.map(r => r.sourceId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Active data sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Types</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredData.map(r => r.dataType)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different data types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visualization Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Data Table</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="types">Data Types</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Records</CardTitle>
              <div className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${filteredData.length} records`}
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Payload</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 100).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(record.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.sourceId}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{record.dataType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.payload}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={record.status === 'ACTIVE' ? 'default' : 'secondary'}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No data records found
                  </div>
                )}
                {filteredData.length > 100 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Showing first 100 records of {filteredData.length}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Timeline</CardTitle>
              <div className="text-sm text-muted-foreground">
                Records over time
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources Distribution</CardTitle>
              <div className="text-sm text-muted-foreground">
                Records by data source
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getSourceDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, count }) => `${source}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {getSourceDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Types Distribution</CardTitle>
              <div className="text-sm text-muted-foreground">
                Records by data type
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTypeDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
