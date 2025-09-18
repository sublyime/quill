'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from './columns';
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
import { Skeleton } from '@/components/ui/skeleton';
import { createColumns } from './columns';
import { getUsers } from '@/lib/user-api';
import { toast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSaved = (user: User) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      setUsers([user, ...users]);
    }
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const columns = createColumns({ onEdit: handleEdit, onDelete: handleDelete });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all users in the system.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => { setEditingUser(null); setIsDialogOpen(true); }}>
          <PlusCircle className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={users}
          filterColumn="name"
          filterPlaceholder="Filter by name..."
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update the details below.' : 'Fill in the details to add a new user.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            onSubmit={handleUserSaved}
            onCancel={() => { setIsDialogOpen(false); setEditingUser(null); }}
            currentUser={editingUser}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
