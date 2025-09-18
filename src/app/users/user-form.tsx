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
import { User } from './columns';
import { useState, useEffect } from 'react';
import { createUser, updateUser } from '@/lib/user-api';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(['Admin', 'Editor', 'Viewer']),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  onSubmit: (user: User) => void;
  onCancel: () => void;
  currentUser?: User | null;
}

export function UserForm({ onSubmit, onCancel, currentUser }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!currentUser;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Viewer',
    },
  });

  useEffect(() => {
    if (isEditMode) {
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      });
    }
  }, [isEditMode, currentUser, form]);

  async function handleSubmit(values: UserFormValues) {
    setIsSubmitting(true);
    try {
      let resultUser: User;
      if (isEditMode) {
        resultUser = await updateUser({ ...currentUser, ...values });
        toast({
          title: 'Success',
          description: `User ${values.name} has been successfully updated.`,
        });
      } else {
        resultUser = await createUser(values);
        toast({
          title: 'Success',
          description: `User ${values.name} has been successfully created.`,
        });
      }
      onSubmit(resultUser);
      form.reset();
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
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
                <Input type="email" placeholder="Enter email address" {...field} />
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
              <Select onValueChange={field.onChange} value={field.value}>
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
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
