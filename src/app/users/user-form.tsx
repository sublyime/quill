'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { User } from './columns';
import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { resetPassword, forceResetPassword } from '@/lib/user-api';

// Fixed schema to match backend expectations
const passwordResetSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').optional(),
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  phone: z.string().optional(),
  roles: z.array(z.enum(['ADMIN', 'EDITOR', 'VIEWER', 'MANAGER', 'ANALYST'])).default(['VIEWER']),
});

type UserFormValues = z.infer<typeof formSchema>;
type PasswordResetValues = z.infer<typeof passwordResetSchema>;

interface UserFormProps {
  onSubmit: (user: User) => void;
  onCancel: () => void;
  currentUser?: User | null;
}

// Fixed API functions - moved inline since @/lib/user-api doesn't exist
async function createUser(userData: UserFormValues): Promise<User> {
  console.log('Creating user with data:', userData);
  
  // Transform the data to match backend expectations
  const requestData = {
    ...userData,
    roles: userData.roles,
    status: 'ACTIVE',
  };
  
  const response = await fetch('http://localhost:8080/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server response:', response.status, errorText);
    throw new Error(`Failed to create user: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function updateUser(userData: Partial<User>): Promise<User> {
  console.log('Updating user with data:', userData);
  
  const response = await fetch(`http://localhost:8080/api/users/${userData.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server response:', response.status, errorText);
    throw new Error(`Failed to update user: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export function UserForm({ onSubmit, onCancel, currentUser }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const isEditMode = !!currentUser;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      roles: ['VIEWER'],
    },
  });

  useEffect(() => {
    if (isEditMode && currentUser) {
      form.reset({
        username: currentUser.username || '',
        email: currentUser.email || '',
        password: '', // Don't populate password for security
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phone || '',
        roles: [(currentUser.roles?.[0] || 'VIEWER') as "ADMIN" | "EDITOR" | "VIEWER" | "MANAGER" | "ANALYST"],
      });
    }
  }, [isEditMode, currentUser, form]);

  async function handleSubmit(values: UserFormValues) {
    setIsSubmitting(true);
    try {
      let resultUser: User;
      
      if (isEditMode && currentUser) {
        // For edit mode, merge current user with form values
        resultUser = await updateUser({ 
          ...currentUser, 
          ...values 
        });
        toast({
          title: 'Success',
          description: `User ${values.firstName} ${values.lastName} has been successfully updated.`,
        });
      } else {
        // For create mode, use form values directly
        resultUser = await createUser(values);
        toast({
          title: 'Success',
          description: `User ${values.firstName} ${values.lastName} has been successfully created.`,
        });
      }

      onSubmit(resultUser);
      if (!isEditMode) {
        form.reset();
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not save the user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={isEditMode ? "Enter new password (leave blank to keep current)" : "Enter password"} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={(value) => field.onChange([value])} 
                  value={Array.isArray(field.value) ? field.value[0] : undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="ANALYST">Analyst</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditMode && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordReset(true)}
            >
              Reset Password
            </Button>
          </div>
        )}
        
        <AlertDialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Password</AlertDialogTitle>
              <AlertDialogDescription>
                Please enter the new password for this user.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(async (data) => {
                if (currentUser) {
                  try {
                    await forceResetPassword(currentUser.id.toString(), data.password || '');
                    setShowPasswordReset(false);
                    toast({
                      title: 'Success',
                      description: 'Password has been reset successfully.',
                    });
                  } catch (error) {
                    toast({
                      title: 'Error',
                      description: 'Failed to reset password.',
                      variant: 'destructive',
                    });
                  }
                }
              })} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={form.handleSubmit(async (data) => {
                if (currentUser && data.password) {
                  await forceResetPassword(currentUser.id.toString(), data.password);
                }
              })}>
                Reset Password
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
