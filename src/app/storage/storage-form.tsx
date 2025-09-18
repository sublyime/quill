'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldPath } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { STORAGE_CONFIGS, StorageType, StorageConfigField, StorageTypeSchema } from './storage-types';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createStorageConfig } from '@/lib/storage-api';

// Form schema with proper typing
const formSchema = z.object({
  storageType: z.string().min(1, 'Please select a storage type.'),
  name: z.string().min(1, 'Storage name is required'),
  configuration: z.record(z.union([z.string(), z.number()])).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function StorageForm() {
  const [selectedType, setSelectedType] = useState<StorageType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storageType: '',
      name: '',
      configuration: {}
    }
  });

  const currentFields: StorageConfigField[] = selectedType ? STORAGE_CONFIGS[selectedType]?.fields || [] : [];

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
        await createStorageConfig({
            name: values.name,
            storageType: values.storageType as StorageType,
            configuration: values.configuration || {},
        });
      toast({
        title: 'Configuration Saved',
        description: `Your ${STORAGE_CONFIGS[selectedType!]?.name} configuration "${values.name}" has been successfully saved.`,
      });
      form.reset();
      setSelectedType(null);
      router.push('/storage');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save storage configuration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleTypeChange = (value: string) => {
    const storageType = value as StorageType;
    setSelectedType(storageType);
    form.setValue('storageType', value);
    form.setValue('configuration', {});
  };

  const storageOptions: StorageTypeSchema[] = Object.values(STORAGE_CONFIGS);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Storage Configuration</h1>
        <p className="text-muted-foreground">Configure a new storage provider for your data historian.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Storage Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Configuration Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a name for this storage configuration" {...field} />
                </FormControl>
                <FormDescription>
                  Choose a descriptive name for this storage configuration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Storage Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Storage Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="storageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Provider</FormLabel>
                    <Select onValueChange={handleTypeChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a storage provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {storageOptions.map((option) => (
                          <SelectItem key={option.type} value={option.type}>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{option.icon}</span>
                              <div>
                                <div className="font-medium">{option.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {option.description.slice(0, 60)}...
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Configuration Fields */}
          <AnimatePresence>
            {selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span className="text-lg">{STORAGE_CONFIGS[selectedType].icon}</span>
                      <span>Configure {STORAGE_CONFIGS[selectedType].name}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {STORAGE_CONFIGS[selectedType].description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentFields.map((configField: StorageConfigField) => (
                      <FormField
                        key={configField.name}
                        control={form.control}
                        name={`configuration.${configField.name}` as FieldPath<FormValues>}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1">
                              <span>{configField.label}</span>
                              {configField.required && (
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                              )}
                            </FormLabel>
                            <FormControl>
                              {configField.type === 'select' ? (
                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${configField.label.toLowerCase()}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {configField.options?.map((option: { value: string; label: string }) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : configField.type === 'textarea' ? (
                                <Textarea
                                  placeholder={configField.placeholder}
                                  {...field}
                                  value={field.value?.toString() || ''}
                                  rows={4}
                                />
                              ) : configField.type === 'password' ? (
                                <Input
                                  type="password"
                                  placeholder={configField.placeholder}
                                  {...field}
                                  value={field.value?.toString() || ''}
                                />
                              ) : configField.type === 'number' ? (
                                <Input
                                  type="number"
                                  placeholder={configField.placeholder}
                                  {...field}
                                  value={field.value?.toString() || ''}
                                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                />
                              ) : (
                                <Input
                                  type="text"
                                  placeholder={configField.placeholder}
                                  {...field}
                                  value={field.value?.toString() || ''}
                                />
                              )}
                            </FormControl>
                            {configField.description && (
                              <FormDescription>
                                {configField.description}
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/storage')}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedType || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving Configuration...' : 'Save Storage Configuration'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
