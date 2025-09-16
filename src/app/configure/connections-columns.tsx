
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DATA_SOURCE_CONFIGS } from '@/lib/data-sources';
import { Connection } from './connections-data';

export const columns: ColumnDef<Connection>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'sourceType',
    header: 'Source Type',
    cell: ({ row }) => {
        const type = row.getValue('sourceType') as string;
        const config = Object.values(DATA_SOURCE_CONFIGS).find(c => c.value === type);
        const Icon = config ? config.icon : null;
        return <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <span>{config?.label || type}</span>
        </div>
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
     cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant = status === 'online' ? 'default' : status === 'offline' ? 'secondary' : 'destructive';
        return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
  {
    accessorKey: 'lastActivity',
    header: 'Last Activity',
    cell: ({ row }) => {
      const date = new Date(row.getValue('lastActivity'));
      return <span>{date.toLocaleString()}</span>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const connection = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(connection.id)}
            >
              Copy connection ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit connection</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete connection</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
