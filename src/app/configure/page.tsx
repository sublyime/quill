'use client';

import { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ConnectionForm } from './connection-form';
import { ConnectionsList } from './connections-list';
import { SlidersHorizontal, List } from 'lucide-react';
import { initialConnections, Connection } from './connections-data';
import { TerminalView } from './terminal-view';

export default function ConfigurePage() {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);

  const addConnection = (newConnection: Connection) => {
    setConnections(prev => [newConnection, ...prev]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setConnections((currentConnections) => {
        if (currentConnections.length === 0) {
          clearInterval(interval);
          return currentConnections;
        }
        
        const randomIndex = Math.floor(Math.random() * currentConnections.length);
        const randomConnection = currentConnections[randomIndex];
        const statuses: Connection['status'][] = ['online', 'offline', 'error'];
        
        // Ensure the new status is different from the old one
        let newStatus: Connection['status'];
        do {
            newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        } while (newStatus === randomConnection.status);

        return currentConnections.map((conn, index) =>
          index === randomIndex
            ? { ...conn, status: newStatus, lastActivity: new Date().toISOString() }
            : conn
        );
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []); // Run only once

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">
          Set up and manage your data source connections.
        </p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="setup">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Connection Setup
          </TabsTrigger>
          <TabsTrigger value="connections">
            <List className="mr-2 h-4 w-4" />
            Connections
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ConnectionForm onAddConnection={addConnection} />
                <TerminalView />
            </div>
        </TabsContent>
        <TabsContent value="connections" className="mt-6">
          <ConnectionsList connections={connections} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
