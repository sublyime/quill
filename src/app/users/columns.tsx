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

// Updated User type to match backend
export type User = {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Export columns as default export
export const columns: ColumnDef<User>[] = [
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
    accessorKey: 'username',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'firstName',
    header: 'Name',
    cell: ({ row }) => {
      const firstName = row.getValue('firstName') as string;
      const lastName = row.original.lastName;
      return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '-';
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string;
      return phone || '-';
    },
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ row }) => {
      const roles = row.getValue('roles') as string[];
      if (!roles || roles.length === 0) return '-';
      return (
        <div className="flex gap-1">
          {roles.slice(0, 2).map((role, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {role}
            </Badge>
          ))}
          {roles.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{roles.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'ACTIVE' ? 'default' : 'secondary';
      return (
        <Badge variant={variant} className="text-xs">
          {status || 'ACTIVE'}
        </Badge>
      );
    },
  },
];

// Export function to create columns with actions
export function createColumns(actions: {
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}): ColumnDef<User>[] {
  return [
    ...columns,
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
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
                onClick={() => navigator.clipboard.writeText(user.id.toString())}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => actions.onEdit(user)}>
                Edit user
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => actions.onDelete(user.id)}
                className="text-red-600"
              >
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
