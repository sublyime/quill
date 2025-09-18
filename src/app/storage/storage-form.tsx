'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { STORAGE_CONFIGS, StorageType } from './storage-types';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  storageType: z.string({ required_error: 'Please select a storage type.' }),
  config: z.record(z.string().or(z.number())).optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface StorageFormProps {
  onStorageAdded?: (storage: any) => void;
  onCancel?: () => void;
  editingStorage?: any;
}

export function StorageForm({ onStorageAdded, onCancel, editingStorage }: StorageFormProps) {
  const [selectedStorage, setSelectedStorage] = useState<StorageType>('postgresql');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingStorage?.name || '',
      storageType: editingStorage?.storageType || 'postgresql',
      config: editingStorage?.configuration ? JSON.parse(editingStorage.configuration) : {},
    },
  });

  const handleStorageTypeChange = (storageType: StorageType) => {
    setSelectedStorage(storageType);
    form.setValue('storageType', storageType);
    
    // Reset config when storage type changes
    const defaultConfig: Record<string, any> = {};
    const config = STORAGE_CONFIGS[storageType];
    config.fields.forEach(field => {
      defaultConfig[field.name] = '';
    });
    form.setValue('config', defaultConfig);
    setTestResult(null);
  };

  const testConnection = async () => {
    const values = form.getValues();
    
    if (!values.config || Object.keys(values.config).length === 0) {
      toast({
        title: 'Configuration Required',
        description: 'Please fill in the configuration fields before testing.',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Create a temporary storage config for testing
      const testPayload = {
        name: values.name + ' (Test)',
        storageType: values.storageType.toUpperCase(),
        configuration: values.config,
      };

      const response = await fetch('http://localhost:8080/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        const createdConfig = await response.json();
        
        // Test the connection
        const testResponse = await fetch(`http://localhost:8080/api/storage/${createdConfig.id}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const testedConfig = await testResponse.json();
        
        // Clean up the test config
        await fetch(`http://localhost:8080/api/storage/${createdConfig.id}`, {
          method: 'DELETE',
        });

        if (testedConfig.status === 'ACTIVE') {
          setTestResult('success');
          toast({
            title: 'Connection Successful',
            description: 'Successfully connected to the storage service.',
          });
        } else {
          setTestResult('error');
          toast({
            title: 'Connection Failed',
            description: testedConfig.lastError || 'Could not connect to the storage service.',
            variant: 'destructive',
          });
        }
      } else {
        throw new Error('Failed to create test configuration');
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      setTestResult('error');
      toast({
        title: 'Test Failed',
        description: error.message || 'Could not test the connection.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  async function onSubmit(values: FormSchema) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        storageType: values.storageType.toUpperCase(),
        configuration: values.config || {},
      };

      const url = editingStorage 
        ? `http://localhost:8080/api/storage/${editingStorage.id}`
        : 'http://localhost:8080/api/storage';
      
      const method = editingStorage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${editingStorage ? 'update' : 'create'} storage: ${response.status}`);
      }

      const savedStorage = await response.json();

      toast({
        title: 'Success',
        description: `Storage configuration "${values.name}" ${editingStorage ? 'updated' : 'created'} successfully.`,
      });

      if (onStorageAdded) {
        onStorageAdded(savedStorage);
      }

      if (!editingStorage) {
        form.reset();
        setSelectedStorage('postgresql');
        setTestResult(null);
      }

    } catch (error: any) {
      console.error('Error saving storage:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not save the storage configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedConfig = STORAGE_CONFIGS[selectedStorage];
  const groupedConfigs = Object.values(STORAGE_CONFIGS).reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, typeof STORAGE_CONFIGS[keyof typeof STORAGE_CONFIGS][]>);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {editingStorage ? 'Edit Storage Configuration' : 'Add Storage Configuration'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Storage Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuration Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a name for this storage configuration" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name to identify this storage configuration.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Storage Type Selection */}
            <FormField
              control={form.control}
              name="storageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleStorageTypeChange(value as StorageType);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(groupedConfigs).map(([category, configs]) => (
                        <SelectGroup key={category}>
                          <SelectLabel>{category}</SelectLabel>
                          {configs.map((config) => (
                            <SelectItem key={config.value} value={config.value}>
                              <div className="flex items-center gap-2">
                                <config.icon className="h-4 w-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Storage Configuration Card */}
            <AnimatePresence mode="wait">
              {selectedConfig && (
                <motion.div
                  key={selectedStorage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <selectedConfig.icon className="h-6 w-6" />
                        <div>
                          <CardTitle className="text-lg">{selectedConfig.label}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {selectedConfig.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedConfig.fields.map((field) => (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={`config.${field.name}` as any}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                                  placeholder={field.placeholder}
                                  {...formField}
                                  value={formField.value || ''}
                                />
                              </FormControl>
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isTesting || isSubmitting}
                className="flex-1"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    {testResult === 'success' && <CheckCircle className="mr-2 h-4 w-4 text-green-600" />}
                    {testResult === 'error' && <XCircle className="mr-2 h-4 w-4 text-red-600" />}
                    Test Connection
                  </>
                )}
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isTesting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingStorage ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingStorage ? 'Update Storage' : 'Create Storage'
                )}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isSubmitting || isTesting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
