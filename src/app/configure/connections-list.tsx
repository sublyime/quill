'use client';

import { useState, useEffect } from 'react';
import { initialConnections, Connection } from './connections-data';
import { columns } from './connections-columns';
import { DataTable } from '@/app/users/data-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ConnectionsList() {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnections((currentConnections) => {
        if (currentConnections.length === 0) {
          return currentConnections;
        }
        
        const randomIndex = Math.floor(Math.random() * currentConnections.length);
        const randomConnection = currentConnections[randomIndex];
        const statuses: Connection['status'][] = ['online', 'offline', 'error'];
        const currentStatusIndex = statuses.indexOf(randomConnection.status);
        const nextStatusIndex = (currentStatusIndex + 1) % statuses.length;
        const newStatus = statuses[nextStatusIndex];

        return currentConnections.map((conn, index) =>
          index === randomIndex
            ? { ...conn, status: newStatus, lastActivity: new Date().toISOString() }
            : conn
        );
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Connections</CardTitle>
        <CardDescription>
          View and manage all active data source connections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={connections} filterColumn='name' filterPlaceholder='Filter connections by name...' />
      </CardContent>
    </Card>
  );
}
