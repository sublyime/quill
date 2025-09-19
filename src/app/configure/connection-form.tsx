'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../hooks/use-toast';
import { DATA_SOURCE_CONFIGS, DataSourceType } from '../../lib/data-sources';
import type { Connection } from './connections-data';

const baseFormSchema = z.object({
  connectionName: z.string().min(2, 'Connection name must be at least 2 characters.'),
  dataSourceType: z.string(),
});

interface ConnectionFormProps {
  onAddConnection: (connection: Connection) => void;
}

export function ConnectionForm({ onAddConnection }: ConnectionFormProps) {
  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceType>('mqtt');
  const [loading, setLoading] = useState(false);

  // Helper function to get default config values
  const getDefaultConfigValues = (dataSourceType: DataSourceType) => {
    const config = DATA_SOURCE_CONFIGS[dataSourceType];
    const defaultValues: Record<string, any> = {};
    
    config.fields.forEach(field => {
      if (field.type === 'number') {
        defaultValues[field.name] = field.required ? 0 : undefined;
      } else {
        defaultValues[field.name] = field.required ? '' : undefined;
      }
    });
    
    return defaultValues;
  };

  // Create dynamic schema
  const createDynamicSchema = (dataSourceType: DataSourceType) => {
    const config = DATA_SOURCE_CONFIGS[dataSourceType];
    const configSchemaShape: Record<string, z.ZodTypeAny> = {};

    config.fields.forEach(field => {
      if (field.type === 'number') {
        let numberSchema = z.coerce.number();
        if (field.validation?.min !== undefined) {
          numberSchema = numberSchema.min(field.validation.min);
        }
        if (field.validation?.max !== undefined) {
          numberSchema = numberSchema.max(field.validation.max);
        }
        // Apply optional ONCE
        configSchemaShape[field.name] = field.required ? numberSchema : numberSchema.optional();
      } else {
        let stringSchema = z.string();
        if (field.validation?.pattern) {
          stringSchema = stringSchema.regex(new RegExp(field.validation.pattern));
        }
        if (field.required) {
          stringSchema = stringSchema.min(1, `${field.label} is required`);
          configSchemaShape[field.name] = stringSchema;
        } else {
          configSchemaShape[field.name] = stringSchema.optional();
        }
      }
    });

    return baseFormSchema.extend({
      config: z.object(configSchemaShape),
    });
  };

  const formSchema = createDynamicSchema(selectedDataSource);
  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      connectionName: '',
      dataSourceType: selectedDataSource,
      config: getDefaultConfigValues(selectedDataSource),
    },
  });

  // Reset form when data source changes
  const handleDataSourceChange = (newType: DataSourceType) => {
    setSelectedDataSource(newType);
    const currentName = form.getValues('connectionName');
    const defaultConfig = getDefaultConfigValues(newType);
    
    form.reset({
      connectionName: currentName || '',
      dataSourceType: newType,
      config: defaultConfig,
    });
  };

  // Initialize form with defaults
  useEffect(() => {
    const defaultConfig = getDefaultConfigValues(selectedDataSource);
    form.reset({
      connectionName: '',
      dataSourceType: selectedDataSource,
      config: defaultConfig,
    });
  }, []);

  async function onSubmit(data: FormSchema) {
    setLoading(true);
    try {
      // Filter out empty values
      const filteredConfig = Object.fromEntries(
        Object.entries(data.config).filter(([_, value]) => 
          value !== '' && 
          value !== null && 
          value !== undefined && 
          !(typeof value === 'number' && isNaN(value))
        )
      );

      console.log('Submitting connection:', {
        name: data.connectionName,
        sourceType: data.dataSourceType,
        config: filteredConfig,
      });

      // Use direct backend URL
      const response = await fetch('http://localhost:8080/api/connections', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.connectionName,
          sourceType: data.dataSourceType,
          configuration: JSON.stringify(filteredConfig), // Match backend field name
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(errorText || `Failed to save connection: ${response.status} ${response.statusText}`);
      }

      const savedConnection = await response.json();
      console.log('Saved connection:', savedConnection);

      toast({
        title: 'Success',
        description: `Connection "${data.connectionName}" saved successfully.`
      });

      form.reset({
        connectionName: '',
        dataSourceType: selectedDataSource,
        config: getDefaultConfigValues(selectedDataSource),
      });

      onAddConnection(savedConnection);

    } catch (error: unknown) {
      console.error('Error saving connection:', error);
      if (error instanceof Error) {
        toast({ 
          title: 'Error', 
          description: error.message, 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Error', 
          description: 'Something went wrong. Make sure backend is running on http://localhost:8080', 
          variant: 'destructive' 
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedConfig = DATA_SOURCE_CONFIGS[selectedDataSource];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="connectionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter connection name" 
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
              name="dataSourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Source Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleDataSourceChange(value as DataSourceType);
                    }}
                    value={field.value || selectedDataSource}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DATA_SOURCE_CONFIGS).map((config) => (
                        <SelectItem key={config.value} value={config.value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedConfig && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">{selectedConfig.label}</CardTitle>
                    <Badge variant="secondary">Selected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedConfig.description}
                  </p>
                </CardHeader>
              </Card>
            )}

            {selectedConfig && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Configuration</CardTitle>
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
                            {field.type === 'select' && field.options ? (
                              <Select 
                                onValueChange={formField.onChange} 
                                value={formField.value === undefined ? '' : formField.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${field.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type={field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'}
                                placeholder={field.placeholder}
                                {...formField}
                                value={field.type === 'number' ? 
                                  (formField.value === undefined || formField.value === '' ? '' : String(formField.value)) 
                                  : formField.value === undefined ? '' : formField.value}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Connection'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
