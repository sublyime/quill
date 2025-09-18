'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  Archive, 
  RotateCcw,
  HardDrive,
  Cloud,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StorageConfig {
  id: number;
  name: string;
  storageType: string;
  status: string;
  isActive: boolean;
  isDefault: boolean;
}

interface BackupJob {
  id: string;
  name: string;
  storageConfigId: number;
  storageConfigName: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SCHEDULED';
  progress: number;
  startTime: string;
  endTime?: string;
  recordsBackedUp: number;
  totalRecords: number;
  backupSize: string;
  errorMessage?: string;
}

interface BackupRestoreProps {
  storages: StorageConfig[];
}

export function BackupRestore({ storages }: BackupRestoreProps) {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Mock backup jobs data (in a real app, this would come from your backend)
  useEffect(() => {
    const mockJobs: BackupJob[] = [
      {
        id: '1',
        name: 'Daily Backup - Sep 18',
        storageConfigId: 1,
        storageConfigName: 'AWS S3 Production',
        status: 'COMPLETED',
        progress: 100,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        recordsBackedUp: 125000,
        totalRecords: 125000,
        backupSize: '2.3 GB',
      },
      {
        id: '2',
        name: 'Weekly Backup - Sep 15',
        storageConfigId: 2,
        storageConfigName: 'Google Cloud Storage',
        status: 'RUNNING',
        progress: 65,
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        recordsBackedUp: 80000,
        totalRecords: 123000,
        backupSize: '1.8 GB',
      },
      {
        id: '3',
        name: 'Manual Backup - Sep 10',
        storageConfigId: 1,
        storageConfigName: 'AWS S3 Production',
        status: 'FAILED',
        progress: 25,
        startTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        recordsBackedUp: 31000,
        totalRecords: 124000,
        backupSize: '0.5 GB',
        errorMessage: 'Storage connection timeout',
      },
    ];
    setBackupJobs(mockJobs);
  }, []);

  const createBackup = async () => {
    if (!selectedStorage || !backupName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select a storage configuration and provide a backup name.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingBackup(true);
    try {
      // Create backup job
      const newJob: BackupJob = {
        id: Math.random().toString(36).substr(2, 9),
        name: backupName,
        storageConfigId: selectedStorage,
        storageConfigName: storages.find(s => s.id === selectedStorage)?.name || 'Unknown',
        status: 'RUNNING',
        progress: 0,
        startTime: new Date().toISOString(),
        recordsBackedUp: 0,
        totalRecords: 100000, // This would come from the backend
        backupSize: '0 MB',
      };

      setBackupJobs(prev => [newJob, ...prev]);

      // Simulate backup progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setBackupJobs(prev => prev.map(job => 
            job.id === newJob.id 
              ? {
                  ...job,
                  status: 'COMPLETED',
                  progress: 100,
                  endTime: new Date().toISOString(),
                  recordsBackedUp: job.totalRecords,
                  backupSize: '1.5 GB'
                }
              : job
          ));

          toast({
            title: 'Backup Completed',
            description: `Successfully backed up data to ${newJob.storageConfigName}.`,
          });
        } else {
          setBackupJobs(prev => prev.map(job => 
            job.id === newJob.id 
              ? {
                  ...job,
                  progress,
                  recordsBackedUp: Math.floor((progress / 100) * job.totalRecords)
                }
              : job
          ));
        }
      }, 1000);

      // Reset form
      setBackupName('');
      setBackupDescription('');
      setSelectedStorage(null);

      toast({
        title: 'Backup Started',
        description: 'The backup process has been initiated.',
      });

    } catch (error: any) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Backup Failed',
        description: 'Could not start the backup process.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreFromBackup = async (jobId: string) => {
    const job = backupJobs.find(j => j.id === jobId);
    if (!job || job.status !== 'COMPLETED') {
      toast({
        title: 'Restore Failed',
        description: 'Cannot restore from this backup.',
        variant: 'destructive',
      });
      return;
    }

    setIsRestoring(true);
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: 'Restore Completed',
        description: `Successfully restored ${job.recordsBackedUp.toLocaleString()} records.`,
      });
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      toast({
        title: 'Restore Failed',
        description: 'Could not restore from backup.',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const downloadBackup = async (jobId: string) => {
    const job = backupJobs.find(j => j.id === jobId);
    if (!job || job.status !== 'COMPLETED') {
      toast({
        title: 'Download Failed',
        description: 'Backup is not available for download.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // In a real app, this would call the backend export API
      const response = await fetch('http://localhost:8080/api/data/export/json', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${job.name.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Download Started',
          description: 'Backup file download has begun.',
        });
      }
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not download the backup file.',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'RUNNING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeStorages = storages.filter(s => s.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Backup & Restore</h2>
          <p className="text-muted-foreground">
            Create backups and restore your data safely
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Archive className="mr-2 h-4 w-4" />
              Create Backup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Backup</DialogTitle>
              <DialogDescription>
                Create a backup of your data to a storage configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-name">Backup Name</Label>
                <Input
                  id="backup-name"
                  placeholder="Enter backup name"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="storage-select">Target Storage</Label>
                <Select
                  value={selectedStorage?.toString() || ''}
                  onValueChange={(value) => setSelectedStorage(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select storage configuration" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeStorages.map((storage) => (
                      <SelectItem key={storage.id} value={storage.id.toString()}>
                        <div className="flex items-center gap-2">
                          {storage.storageType.includes('CLOUD') ? (
                            <Cloud className="h-4 w-4" />
                          ) : (
                            <HardDrive className="h-4 w-4" />
                          )}
                          {storage.name}
                          {storage.isDefault && (
                            <Badge variant="outline" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="backup-description">Description (Optional)</Label>
                <Textarea
                  id="backup-description"
                  placeholder="Enter backup description"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date (Optional)</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogTrigger>
                <Button 
                  onClick={createBackup} 
                  disabled={isCreatingBackup || !selectedStorage || !backupName.trim()}
                >
                  {isCreatingBackup ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      Create Backup
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Backup Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <div className="text-sm text-muted-foreground">
            Recent backup and restore operations
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backupJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.storageConfigName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {job.backupSize}
                    </div>
                  </div>
                </div>

                {job.status === 'RUNNING' && (
                  <div className="space-y-2">
                    <Progress value={job.progress} />
                    <div className="text-sm text-muted-foreground">
                      {job.recordsBackedUp.toLocaleString()} of {job.totalRecords.toLocaleString()} records ({Math.round(job.progress)}%)
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Started: {new Date(job.startTime).toLocaleString()}
                    </div>
                    {job.endTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Completed: {new Date(job.endTime).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {job.status === 'COMPLETED' && (
                      <>
                        <Button
                          onClick={() => downloadBackup(job.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restore
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Restore from Backup</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will restore {job.recordsBackedUp.toLocaleString()} records from the backup "{job.name}". 
                                This action cannot be undone and may overwrite existing data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => restoreFromBackup(job.id)}
                                disabled={isRestoring}
                              >
                                {isRestoring ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Restoring...
                                  </>
                                ) : (
                                  'Restore'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>

                {job.errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    <div className="font-medium">Error:</div>
                    {job.errorMessage}
                  </div>
                )}
              </div>
            ))}

            {backupJobs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No backup jobs found. Create your first backup to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Settings</CardTitle>
          <div className="text-sm text-muted-foreground">
            Configure automatic backups and retention policies
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Automatic Daily Backup</h4>
              <p className="text-sm text-muted-foreground">
                Create daily backups at 2:00 AM to the default storage
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Backup Retention</h4>
              <p className="text-sm text-muted-foreground">
                Keep backups for 30 days, then automatically delete
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Backup Compression</h4>
              <p className="text-sm text-muted-foreground">
                Compress backup files to save storage space
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
