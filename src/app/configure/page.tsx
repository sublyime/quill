'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConnectionForm } from './connection-form';
import { ConnectionsList } from './connections-list';
import { Connection } from './connections-data';

export default function ConfigurePage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch('/api/connections');
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleAddConnection = (newConnection: Connection) => {
    setConnections(prev => [...prev, newConnection]);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <p>Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Connection Configuration</h1>
        <p className="text-muted-foreground">
          Configure and manage your data source connections for real-time data ingestion.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Connection</h2>
          <ConnectionForm onAddConnection={handleAddConnection} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Connections</h2>
          <ConnectionsList 
            connections={connections} 
            onConnectionsChange={fetchConnections}
          />
        </div>
      </div>
    </div>
  );
}
