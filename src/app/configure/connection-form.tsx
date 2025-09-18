'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';

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

type BaseFormSchema = z.infer<typeof baseFormSchema>;

interface ConnectionFormProps {
  onAddConnection: (connection: Connection) => void;
}

export function ConnectionForm({ onAddConnection }: ConnectionFormProps) {
  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceType>('mqtt');
  const [loading, setLoading] = useState(false);

  // Create dynamic schema based on selected data source
  const createDynamicSchema = (dataSourceType: DataSourceType) => {
    const config = DATA_SOURCE_CONFIGS[dataSourceType];
    const configSchemaShape: Record<string, z.ZodTypeAny> = {};

    config.fields.forEach(field => {
      if (field.type === 'number') {
        let numberSchema = z.coerce.number();
        
        if (field.validation?.min !== undefined) {
          numberSchema = numberSchema.min(field.validation.min, `${field.label} must be at least ${field.validation.min}`);
        }
        if (field.validation?.max !== undefined) {
          numberSchema = numberSchema.max(field.validation.max, `${field.label} must be at most ${field.validation.max}`);
        }
        
        configSchemaShape[field.name] = field.required ? numberSchema : numberSchema.optional();
      } else {
        let stringSchema = z.string();
        
        if (field.validation?.pattern) {
          stringSchema = stringSchema.regex(new RegExp(field.validation.pattern), `Invalid ${field.label} format`);
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
      config: {},
    },
  });

  // Reset form when data source type changes
  const handleDataSourceChange = (newType: DataSourceType) => {
    setSelectedDataSource(newType);
    form.setValue('dataSourceType', newType);
    
    // Reset config object with empty values
    const newConfig: Record<string, any> = {};
    const config = DATA_SOURCE_CONFIGS[newType];
    config.fields.forEach(field => {
      newConfig[field.name] = field.type === 'number' ? 0 : '';
    });
    
    form.setValue('config', newConfig);
    
    // Re-create form with new schema
    const newFormSchema = createDynamicSchema(newType);
    form.reset({
      connectionName: form.getValues('connectionName'),
      dataSourceType: newType,
      config: newConfig,
    });
  };

  async function onSubmit(data: FormSchema) {
    setLoading(true);
    try {
      // Filter out empty values from config
      const filteredConfig = Object.fromEntries(
        Object.entries(data.config).filter(([_, value]) => value !== '' && value !== 0)
      );

      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.connectionName,
          sourceType: data.dataSourceType,
          config: JSON.stringify(filteredConfig),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save connection');
      }

      const savedConnection = await response.json();
      toast({ 
        title: 'Success', 
        description: `Connection "${data.connectionName}" saved successfully.` 
      });
      
      // Reset form
      const resetConfig: Record<string, any> = {};
      const config = DATA_SOURCE_CONFIGS[selectedDataSource];
      config.fields.forEach(field => {
        resetConfig[field.name] = field.type === 'number' ? 0 : '';
      });
      
      form.reset({
        connectionName: '',
        dataSourceType: selectedDataSource,
        config: resetConfig,
      });
      
      onAddConnection(savedConnection);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedConfig = DATA_SOURCE_CONFIGS[selectedDataSource];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Connection Name */}
            <FormField
              control={form.control}
              name="connectionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter connection name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data Source Type */}
            <FormField
              control={form.control}
              name="dataSourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Source Type</FormLabel>
                  <Select 
                    onValueChange={(value: DataSourceType) => {
                      field.onChange(value);
                      handleDataSourceChange(value);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DATA_SOURCE_CONFIGS).map((config) => (
                        <SelectItem key={config.value} value={config.value}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Data Source Info */}
            {selectedConfig && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <selectedConfig.icon className="h-5 w-5" />
                  <h3 className="font-medium">{selectedConfig.label}</h3>
                  <Badge variant="secondary">Selected</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedConfig.description}</p>
              </div>
            )}

            {/* Dynamic Configuration Fields */}
            {selectedConfig && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuration</h3>
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
                              value={formField.value || ''}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={field.placeholder} />
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
                              type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                              placeholder={field.placeholder}
                              {...formField}
                              value={formField.value || (field.type === 'number' ? 0 : '')}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Saving...' : 'Save Connection'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
