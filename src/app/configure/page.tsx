'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConnectionForm } from './connection-form';
import { ConnectionsList } from './connections-list';
import { Connection } from './connections-data';

export default function ConfigurePage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      setError(null);
      // Use direct backend URL instead of proxy
      const response = await fetch('http://localhost:8080/api/connections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched connections:', data);
      setConnections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError('Failed to load connections. Make sure backend is running on localhost:8080');
      setConnections([]);
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-red-500">
            <p>• Make sure your backend is running: <code>mvn spring-boot:run</code></p>
            <p>• Backend should be accessible at: <code>http://localhost:8080/api/connections</code></p>
            <p>• Check CORS configuration in WebConfig.java</p>
          </div>
          <button 
            onClick={fetchConnections}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry Connection
          </button>
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
          <h2 className="text-xl font-semibold mb-4">Existing Connections ({connections.length})</h2>
          <ConnectionsList 
            connections={connections} 
            onConnectionsChange={fetchConnections}
          />
        </div>
      </div>
    </div>
  );
}
