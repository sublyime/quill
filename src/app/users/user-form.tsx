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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { User } from './columns';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(['Admin', 'Editor', 'Viewer']),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  onSubmit?: (user: User) => void;
  onCancel?: () => void;
  onUserAdded?: (user: User) => void; // Keep backward compatibility
}

export function UserForm({ onSubmit, onCancel, onUserAdded }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Viewer',
    },
  });

  async function handleSubmit(values: UserFormValues) {
    setIsSubmitting(true);
    try {
      // Use direct backend URL
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          username: values.name, // Backend expects 'username'
          email: values.email,
          firstName: values.name,
          roles: [values.role.toUpperCase()], // Convert to backend format
          status: 'ACTIVE',
          password: 'tempPassword123' // In production, this should be handled properly
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to create user: ${response.status}`);
      }

      const newUser = await response.json();
      console.log('Created user:', newUser);

      // Transform backend response to frontend format
      const frontendUser: User = {
        id: newUser.id.toString(),
        name: newUser.firstName || newUser.username,
        email: newUser.email,
        role: values.role,
        status: 'active'
      };

      // Call the appropriate callback
      if (onSubmit) {
        onSubmit(frontendUser);
      } else if (onUserAdded) {
        onUserAdded(frontendUser);
      }

      toast({
        title: 'Success',
        description: `User ${values.name} has been successfully created.`,
      });

      form.reset();

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not create the new user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter full name" 
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Enter email address" 
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'Viewer'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
          
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
