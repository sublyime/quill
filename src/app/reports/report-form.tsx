
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "@/components/ui/command"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initialConnections } from '@/app/configure/connections-data';

const reportFormSchema = z.object({
  reportType: z.string({ required_error: 'Please select a report type.' }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  connections: z.array(z.string()).min(1, 'Please select at least one connection.'),
  dataPoints: z.array(z.string()).min(1, 'Please select at least one data point.'),
});

export type ReportConfig = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
  onGenerateReport: (data: ReportConfig) => void;
}

const MOCK_DATA_POINTS = [
    { value: "temperature", label: "Temperature" },
    { value: "humidity", label: "Humidity" },
    { value: "pressure", label: "Pressure" },
    { value: "voltage", label: "Voltage" },
    { value: "flow_rate", label: "Flow Rate" },
]

export function ReportForm({ onGenerateReport }: ReportFormProps) {
  const form = useForm<ReportConfig>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
        connections: [],
        dataPoints: []
    }
  });

  function onSubmit(data: ReportConfig) {
    onGenerateReport(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="time_series">Time Series Log</SelectItem>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="alerts">Alerts & Alarms</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date range</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, 'LLL dd, y')} -{' '}
                                {format(field.value.to, 'LLL dd, y')}
                              </>
                            ) : (
                              format(field.value.from, 'LLL dd, y')
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value as DateRange}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="connections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connections</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value?.length && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {field.value?.length
                              ? `${field.value.length} selected`
                              : "Select connections"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search connections..." />
                        <CommandEmpty>No connections found.</CommandEmpty>
                        <CommandGroup>
                            <CommandList>
                                {initialConnections.map((conn) => (
                                    <CommandItem
                                    key={conn.id}
                                    onSelect={() => {
                                        const selected = field.value || [];
                                        const newValue = selected.includes(conn.id)
                                        ? selected.filter((id) => id !== conn.id)
                                        : [...selected, conn.id];
                                        field.onChange(newValue);
                                    }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value?.includes(conn.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {conn.name}
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dataPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Points</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value?.length && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                           {field.value?.length
                              ? `${field.value.length} selected`
                              : "Select data points"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search data points..." />
                        <CommandEmpty>No data points found.</CommandEmpty>
                        <CommandGroup>
                           <CommandList>
                            {MOCK_DATA_POINTS.map((dp) => (
                                <CommandItem
                                key={dp.value}
                                onSelect={() => {
                                    const selected = field.value || [];
                                    const newValue = selected.includes(dp.value)
                                    ? selected.filter((id) => id !== dp.value)
                                    : [...selected, dp.value];
                                    field.onChange(newValue);
                                }}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value?.includes(dp.value) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {dp.label}
                                </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Generate Report</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
