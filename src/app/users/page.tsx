
'use client';

import { useState } from 'react';
import { User, columns } from './columns';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserForm } from './user-form';

const initialUsers: User[] = [
  {
    id: 'usr_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
  },
  {
    id: 'usr_2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Editor',
    status: 'active',
  },
  {
    id: 'usr_3',
    name: 'Sam Wilson',
    email: 'sam.wilson@example.com',
    role: 'Viewer',
    status: 'inactive',
  },
  {
    id: 'usr_4',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    role: 'Editor',
    status: 'active',
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddUser = (newUser: Omit<User, 'id' | 'status'>) => {
    const userWithId: User = {
      ...newUser,
      id: `usr_${users.length + 1}`,
      status: 'active',
    };
    setUsers((prevUsers) => [...prevUsers, userWithId]);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage all users in the system.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new user.
              </DialogDescription>
            </DialogHeader>
            <UserForm onUserAdded={handleAddUser} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
