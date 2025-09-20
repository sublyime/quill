'use client';

import { useState } from 'react';
import { Connection } from './connections-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Square, TestTube, Trash } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'ONLINE':
    case 'ACTIVE':
      return 'secondary';
    case 'ERROR':
      return 'destructive';
    case 'INACTIVE':
      return 'outline';
    default:
      return 'default';
  }
};

interface ConnectionsListProps {
  connections: Connection[];
  onConnectionsChange: () => void;
}

export function ConnectionsList({ connections, onConnectionsChange }: ConnectionsListProps) {
  const [testingIds, setTestingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [startingIds, setStartingIds] = useState<Set<number>>(new Set());
  const [stoppingIds, setStoppingIds] = useState<Set<number>>(new Set());

  const testConnection = async (id: number) => {
    setTestingIds(prev => new Set([...prev, id]));
    
    try {
      // Use direct backend URL with NUMERIC ID
      const response = await fetch(`http://localhost:8080/api/connections/${id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.text();
      console.log('Test result:', result);
      
      // Refresh connections to show updated status
      onConnectionsChange();
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Failed to test connection');
    } finally {
      setTestingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const deleteConnection = async (id: number) => {
    if (!confirm('Are you sure you want to delete this connection?')) {
      return;
    }
    
    setDeletingIds(prev => new Set([...prev, id]));
    
    try {
      // Use direct backend URL with NUMERIC ID
      const response = await fetch(`http://localhost:8080/api/connections/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Connection deleted successfully');
      
      // Refresh connections
      onConnectionsChange();
    } catch (error) {
      console.error('Error deleting connection:', error);
      alert('Failed to delete connection');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (connections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No connections configured yet. Add your first connection above.
      </div>
    );
  }

  const startConnection = async (id: number) => {
    setStartingIds(prev => new Set([...prev, id]));
    
    try {
      const response = await fetch(`http://localhost:8080/api/connections/${id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Connection started successfully');
      onConnectionsChange();
    } catch (error) {
      console.error('Error starting connection:', error);
      alert('Failed to start connection');
    } finally {
      setStartingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const stopConnection = async (id: number) => {
    setStoppingIds(prev => new Set([...prev, id]));
    
    try {
      const response = await fetch(`http://localhost:8080/api/connections/${id}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Connection stopped successfully');
      onConnectionsChange();
    } catch (error) {
      console.error('Error stopping connection:', error);
      alert('Failed to stop connection');
    } finally {
      setStoppingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-4">
      {connections.map((connection) => (
        <div key={connection.id} className="border rounded-lg p-4 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{connection.name}</h3>
              <p className="text-muted-foreground text-sm mb-2">Type: {connection.sourceType}</p>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(connection.status)}>{connection.status}</Badge>
                {connection.lastError && (
                  <Badge variant="destructive">Error: {connection.lastError}</Badge>
                )}
              </div>
              {connection.configuration && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Configuration: {JSON.stringify(JSON.parse(connection.configuration), null, 2)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {connection.status !== 'ACTIVE' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startConnection(connection.id)}
                  disabled={startingIds.has(connection.id)}
                >
                  {startingIds.has(connection.id) ? <Spinner /> : <Play className="h-4 w-4" />}
                  <span className="ml-2">Start</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => stopConnection(connection.id)}
                  disabled={stoppingIds.has(connection.id)}
                >
                  {stoppingIds.has(connection.id) ? <Spinner /> : <Square className="h-4 w-4" />}
                  <span className="ml-2">Stop</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => testConnection(connection.id)}
                disabled={testingIds.has(connection.id)}
              >
                {testingIds.has(connection.id) ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                <span className="ml-2">Test</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteConnection(connection.id)}
                disabled={deletingIds.has(connection.id)}
              >
                {deletingIds.has(connection.id) ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
                <span className="ml-2">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
