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
import { toast } from '@/hooks/use-toast';

// Fixed: Define getUsers function inline since @/lib/user-api doesn't exist
async function getUsers(): Promise<User[]> {
  const response = await fetch('http://localhost:8080/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

// Fixed: Define deleteUser function
async function deleteUser(userId: number): Promise<void> {
  const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      console.log('Fetched users:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch users.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSaved = (user: User) => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => u.id === user.id ? user : u));
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });
    } else {
      // Add new user
      setUsers([user, ...users]);
      toast({
        title: 'Success',
        description: 'User created successfully.',
      });
    }
    
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: number) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast({
        title: 'Success',
        description: 'User deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users in the system.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { 
                setEditingUser(null); 
                setIsDialogOpen(true); 
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update the details below.' 
                  : 'Fill in the details to add a new user.'}
              </DialogDescription>
            </DialogHeader>
            
            <UserForm
              onSubmit={handleUserSaved}
              onCancel={() => { 
                setIsDialogOpen(false); 
                setEditingUser(null); 
              }}
              currentUser={editingUser}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <DataTable 
            columns={createColumns({
              onDelete: handleDeleteUser,
              onEdit: handleEdit
            })}
            data={users}
          />
        )}
      </div>
    </div>
  );
}
