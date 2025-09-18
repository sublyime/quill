'use client';

import { useState, useEffect } from 'react';

export default function TestBackendPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testBackendConnection = async () => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Testing backend connection from port 9002...');
      
      // Test direct backend connection
      const response = await fetch('http://localhost:8080/api/connections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setConnections(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Backend connection error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestConnection = async () => {
    try {
      const newConnection = {
        name: `Frontend Test ${new Date().toLocaleTimeString()}`,
        sourceType: 'mqtt',
        config: JSON.stringify({
          brokerAddress: 'test.frontend.com',
          port: 1883,
          clientId: 'frontend-test'
        })
      };

      console.log('Creating connection:', newConnection);

      const response = await fetch('http://localhost:8080/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConnection)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const created = await response.json();
      console.log('Created connection:', created);
      
      // Refresh the list
      await testBackendConnection();
    } catch (error: any) {
      console.error('Create connection error:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Backend Connection Test</h1>
      <p className="text-gray-600 mb-4">Frontend: http://localhost:9002 → Backend: http://localhost:8080</p>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testBackendConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test GET /api/connections'}
        </button>
        
        <button
          onClick={createTestConnection}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-4"
        >
          Test POST /api/connections
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <h3 className="text-red-800 font-medium">Error:</h3>
          <p className="text-red-600">{error}</p>
          <div className="mt-4 text-sm text-red-500">
            <p>Make sure:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Backend is running: <code>mvn spring-boot:run</code></li>
              <li>Backend is on port 8080</li>
              <li>CORS allows port 9002</li>
              <li>Check browser console (F12) for more details</li>
            </ul>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border rounded p-4">
        <h3 className="font-medium mb-4">Connections ({connections.length}):</h3>
        
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : connections.length === 0 ? (
          <div className="text-gray-500">No connections found</div>
        ) : (
          <div className="space-y-2">
            {connections.map((conn, index) => (
              <div key={conn.id || index} className="bg-white p-3 rounded border">
                <div className="font-medium">ID: {conn.id} - {conn.name}</div>
                <div className="text-sm text-gray-600">Type: {conn.sourceType}</div>
                <div className="text-sm text-gray-600">Status: {conn.status}</div>
                <div className="text-sm text-gray-600">Created: {conn.createdAt}</div>
                {conn.config && (
                  <div className="text-sm text-gray-600">Config: {conn.config}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
