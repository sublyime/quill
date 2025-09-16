
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { DATA_SOURCE_CONFIGS, DataSourceType } from '@/lib/data-sources';
import { Connection } from './connections-data';

const formSchema = z.object({
  connectionName: z.string().min(2, "Connection name must be at least 2 characters."),
  dataSourceType: z.string({ required_error: 'Please select a data source type.' }),
  config: z.record(z.string().or(z.number())).optional(),
});

interface ConnectionFormProps {
    onAddConnection: (connection: Connection) => void;
}

export function ConnectionForm({ onAddConnection }: ConnectionFormProps) {
  const [selectedType, setSelectedType] = useState<DataSourceType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      connectionName: "",
    },
  });
  
  const currentFields = selectedType ? DATA_SOURCE_CONFIGS[selectedType]?.fields : [];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const newConnection: Connection = {
        id: `conn_${Date.now()}`,
        name: values.connectionName,
        sourceType: values.dataSourceType as Connection['sourceType'],
        status: 'online', // New connections default to online
        lastActivity: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConnection),
      });

      if (!response.ok) {
        throw new Error('Failed to save connection');
      }

      const savedConnection = await response.json();
      onAddConnection(savedConnection);
      
      toast({
        title: 'Configuration Saved',
        description: `Connection "${values.connectionName}" has been successfully created.`,
      });

      form.reset();
      form.setValue('dataSourceType', '');
      setSelectedType(null);

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not save the new connection. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleTypeChange = (value: DataSourceType) => {
    setSelectedType(value);
    form.setValue('dataSourceType', value);
    // Reset config fields when type changes
    form.reset({
        ...form.getValues(),
        config: {}
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New Data Source</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="connectionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Factory Floor Sensor 1" {...field} />
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
                  <Select onValueChange={(value) => handleTypeChange(value as DataSourceType)} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a data source type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DATA_SOURCE_CONFIGS).map(({ value, label, icon: Icon }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <AnimatePresence>
            {selectedType && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-8 overflow-hidden"
              >
                {currentFields.map((configField) => (
                    <FormField
                    key={configField.name}
                    control={form.control}
                    name={`config.${configField.name}` as any}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{configField.label}</FormLabel>
                        <FormControl>
                            <Input
                            placeholder={configField.placeholder}
                            type={configField.type}
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                ))}
              </motion.div>
            )}
            </AnimatePresence>

            <Button type="submit" disabled={!selectedType || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Configuration'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
