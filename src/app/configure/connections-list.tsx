'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Trash2, TestTube, Edit } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { DATA_SOURCE_CONFIGS } from '../../lib/data-sources';
import { Connection, parseConnectionConfig } from './connections-data';

interface ConnectionsListProps {
  connections: Connection[];
  onConnectionsChange: () => void;
}

export function ConnectionsList({ connections, onConnectionsChange }: ConnectionsListProps) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const getStatusVariant = (status: Connection['status']) => {
    switch (status) {
      case 'ONLINE': return 'success';
      case 'OFFLINE': return 'secondary';
      case 'ERROR': return 'destructive';
      case 'CONNECTING': return 'warning';
      default: return 'secondary';
    }
  };

  const testConnection = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`/api/connections/${id}/test`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const message = await response.text();
        toast({ title: 'Connection Test', description: message });
        onConnectionsChange(); // Refresh the list to show updated status
      } else {
        const error = await response.text();
        toast({ title: 'Connection Test Failed', description: error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to test connection', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteConnection = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const response = await fetch(`/api/connections/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({ title: 'Success', description: `Connection "${name}" deleted.` });
        onConnectionsChange();
      } else {
        throw new Error('Failed to delete connection');
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete connection', 
        variant: 'destructive' 
      });
    }
  };

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No connections configured yet.</p>
          <p className="text-sm text-muted-foreground">Add your first connection to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => {
        const config = parseConnectionConfig(connection.config);
        const sourceConfig = DATA_SOURCE_CONFIGS[connection.sourceType as keyof typeof DATA_SOURCE_CONFIGS];
        const IconComponent = sourceConfig?.icon;

        return (
          <Card key={connection.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                  <div>
                    <CardTitle className="text-lg">{connection.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {sourceConfig?.label || connection.sourceType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(connection.status) as any}>
                    {connection.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(connection.id)}
                    disabled={loading[connection.id]}
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    {loading[connection.id] ? 'Testing...' : 'Test'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteConnection(connection.id, connection.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(config).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {key.toLowerCase().includes('password') || key.toLowerCase().includes('key') 
                        ? '••••••••' 
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
              {connection.lastConnected && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last connected: {new Date(connection.lastConnected).toLocaleString()}
                </p>
              )}
              {connection.lastError && (
                <p className="text-xs text-red-500 mt-1">
                  Error: {connection.lastError}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
