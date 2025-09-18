'use client';

import { useState } from 'react';
import { Connection } from './connections-data';

interface ConnectionsListProps {
  connections: Connection[];
  onConnectionsChange: () => void;
}

export function ConnectionsList({ connections, onConnectionsChange }: ConnectionsListProps) {
  const [testingIds, setTestingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

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

  return (
    <div className="space-y-4">
      {connections.map((connection) => (
        <div key={connection.id} className="border rounded-lg p-4 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{connection.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {connection.sourceType} • {connection.status}
              </p>
              {connection.config && (
                <p className="text-xs text-muted-foreground mt-1">
                  {connection.config.length > 100 
                    ? `${connection.config.substring(0, 100)}...` 
                    : connection.config}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Created: {new Date(connection.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => testConnection(connection.id)}
                disabled={testingIds.has(connection.id)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {testingIds.has(connection.id) ? 'Testing...' : 'Test'}
              </button>
              
              <button
                onClick={() => deleteConnection(connection.id)}
                disabled={deletingIds.has(connection.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {deletingIds.has(connection.id) ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
