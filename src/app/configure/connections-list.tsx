'use client';

import { Connection } from './connections-data';
import { columns } from './connections-columns';
import { DataTable } from '@/app/users/data-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ConnectionsListProps {
  connections: Connection[];
}

export function ConnectionsList({ connections }: ConnectionsListProps) {
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
