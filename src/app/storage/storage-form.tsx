
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { groupBy } from 'lodash';

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
import { toast } from '@/hooks/use-toast';
import { STORAGE_CONFIGS, StorageType } from '@/lib/storage-types';

const formSchema = z.object({
  storageType: z.string({ required_error: 'Please select a storage type.' }),
  config: z.record(z.string().or(z.number())).optional(),
});

export function StorageForm() {
  const [selectedType, setSelectedType] = useState<StorageType | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  const currentFields = selectedType ? STORAGE_CONFIGS[selectedType]?.fields : [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalValues = { ...values, config: {} };
    if (selectedType) {
        currentFields.forEach(field => {
            // @ts-ignore
            finalValues.config[field.name] = form.getValues(`config.${field.name}`);
        });
    }

    console.log('Form submitted:', finalValues);
    toast({
      title: 'Configuration Saved',
      description: 'Your storage configuration has been successfully saved.',
    });
    form.reset();
    setSelectedType(null);
  }

  const handleTypeChange = (value: StorageType) => {
    setSelectedType(value);
    form.setValue('storageType', value);
    form.reset({
        ...form.getValues(),
        config: {}
    });
  }

  const groupedStorageOptions = groupBy(Object.values(STORAGE_CONFIGS), 'category');

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Select Storage Provider</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="storageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Provider</FormLabel>
                  <Select onValueChange={(value) => handleTypeChange(value as StorageType)} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a storage provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(groupedStorageOptions).map(([category, options]) => (
                        <SelectGroup key={category}>
                          <SelectLabel>{category}</SelectLabel>
                          {options.map(({ value, label, icon: Icon }) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <Icon />
                                <span>{label}</span>
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
            
            <AnimatePresence>
            {selectedType && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-8 overflow-hidden"
              >
                <CardTitle className="text-lg">Configure {STORAGE_CONFIGS[selectedType].label}</CardTitle>
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

            <Button type="submit" disabled={!selectedType}>
              Save Storage Configuration
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
