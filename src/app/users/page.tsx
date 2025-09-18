'use client';

import { useState, useEffect } from 'react';
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched users:', data);
      
      // Transform backend data to frontend format
      const transformedUsers: User[] = data.map((user: any) => ({
        id: user.id.toString(),
        name: user.firstName || user.username,
        email: user.email,
        role: user.roles?.[0] || 'Viewer',
        status: user.status === 'ACTIVE' ? 'active' : 'inactive'
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = (newUser: User) => {
    console.log('Added new user:', newUser);
    setUsers((prevUsers) => [newUser, ...prevUsers]);
    setIsDialogOpen(false);
    // Refresh the list to get the latest data
    fetchUsers();
  };

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
    // TODO: Implement edit functionality
  };

  const handleDelete = (user: User) => {
    console.log('Deleted user:', user);
    // Refresh the user list after deletion
    fetchUsers();
  };

  // Create columns with callback functions
  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users in the system.
          </p>
        </div>
        
        {/* Add User Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new user.
              </DialogDescription>
            </DialogHeader>
            <UserForm 
              onSubmit={handleAddUser}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
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
    </div>
  );
}
