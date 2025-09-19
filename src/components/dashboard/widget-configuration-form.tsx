'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { 
  DashboardWidget, 
  WidgetType,
  LineChartConfig,
  BarChartConfig,
  PieChartConfig,
  StatsConfig,
  TableConfig
} from '@/types/dashboard';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const sharedConfigSchema = {
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  style: z.object({
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    fontSize: z.string().optional(),
    padding: z.string().optional(),
    borderRadius: z.string().optional(),
    chartColors: z.array(z.string()).optional(),
  }).optional(),
  layout: z.any().optional(),
} as const;

const baseDataConfigSchema = {
  source: z.string().min(1, 'Data source is required').optional(),
  metric: z.string().min(1, 'Metric is required').optional(),
  aggregation: z.enum(['sum', 'avg', 'min', 'max', 'count']).optional(),
  timeRange: z.enum(['day', 'week', 'month', 'year']).optional(),
  refreshInterval: z.number().min(0).optional(),
} as const;

const statsSchema = z.object({
  ...sharedConfigSchema,
  type: z.literal('stats'),
  dataConfig: z.object({
    ...baseDataConfigSchema,
  }).optional(),
}).partial();

const chartSchema = z.object({
  ...sharedConfigSchema,
  dataConfig: z.object({
    ...baseDataConfigSchema,
    xAxis: z.string().min(1, 'X-axis field is required').optional(),
    yAxis: z.string().min(1, 'Y-axis field is required').optional(),
    series: z.array(z.string()).min(1, 'At least one series is required').optional(),
  }).optional(),
  showLegend: z.boolean().optional(),
}).partial();

const lineChartSchema = chartSchema.extend({
  type: z.literal('line-chart'),
});

const barChartSchema = chartSchema.extend({
  type: z.literal('bar-chart'),
  stacked: z.boolean().optional(),
});

const pieChartSchema = z.object({
  ...sharedConfigSchema,
  type: z.literal('pie-chart'),
  dataConfig: z.object({
    ...baseDataConfigSchema,
    valueField: z.string().min(1, 'Value field is required').optional(),
    nameField: z.string().min(1, 'Name field is required').optional(),
  }).optional(),
  showLegend: z.boolean().optional(),
}).partial();

const tableSchema = z.object({
  ...sharedConfigSchema,
  type: z.literal('table'),
  dataConfig: z.object({
    ...baseDataConfigSchema,
  }).optional(),
  columns: z.array(z.object({
    field: z.string(),
    header: z.string(),
    sortable: z.boolean().optional(),
  })).optional(),
}).partial();

function getSchemaForType(type: WidgetType) {
  switch (type) {
    case 'stats':
      return statsSchema;
    case 'line-chart':
      return lineChartSchema;
    case 'bar-chart':
      return barChartSchema;
    case 'pie-chart':
      return pieChartSchema;
    case 'table':
      return tableSchema;
    default:
      return statsSchema;
  }
}

type WidgetFormData = {
  type: WidgetType;
  title?: string;
  description?: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    padding?: string;
    borderRadius?: string;
    chartColors?: string[];
  };
  dataConfig?: {
    source?: string;
    metric?: string;
    aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
    timeRange?: 'day' | 'week' | 'month' | 'year';
    refreshInterval?: number;
    xAxis?: string;
    yAxis?: string;
    series?: string[];
    valueField?: string;
    nameField?: string;
  };
  showLegend?: boolean;
  stacked?: boolean;
  columns?: Array<{
    field: string;
    header: string;
    sortable?: boolean;
  }>;
};

interface WidgetConfigurationFormProps {
  type: WidgetType;
  initialConfig?: DashboardWidget;
  onSubmit: (config: Partial<DashboardWidget>) => void;
  onCancel: () => void;
}

export function WidgetConfigurationForm({
  type,
  initialConfig,
  onSubmit,
  onCancel
}: WidgetConfigurationFormProps) {
  const form = useForm<WidgetFormData>({
    defaultValues: {
      ...initialConfig,
      type,
      dataConfig: {
        aggregation: 'sum',
        timeRange: 'day',
        ...(initialConfig?.dataConfig || {}),
      },
    },
  });

  const handleSubmit = (data: WidgetFormData) => {
    // Create a type-safe configuration based on the widget type
    let config: Partial<DashboardWidget>;
    
    switch (type) {
      case 'line-chart':
        config = {
          ...data,
          type: 'line-chart',
        } as Partial<LineChartConfig>;
        break;
      case 'bar-chart':
        config = {
          ...data,
          type: 'bar-chart',
          stacked: data.stacked,
        } as Partial<BarChartConfig>;
        break;
      case 'pie-chart':
        config = {
          ...data,
          type: 'pie-chart',
        } as Partial<PieChartConfig>;
        break;
      case 'stats':
        config = {
          ...data,
          type: 'stats',
        } as Partial<StatsConfig>;
        break;
      case 'table':
        config = {
          ...data,
          type: 'table',
          columns: data.columns,
        } as Partial<TableConfig>;
        break;
      default:
        config = {
          ...data,
          type: 'stats',
        } as Partial<StatsConfig>;
    }

    onSubmit(config);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Widget title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Widget description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataConfig.source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Source</FormLabel>
              <FormControl>
                <Input {...field} placeholder="API endpoint or data source" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataConfig.metric"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metric</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Metric to measure" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataConfig.aggregation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aggregation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select aggregation method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="avg">Average</SelectItem>
                  <SelectItem value="min">Minimum</SelectItem>
                  <SelectItem value="max">Maximum</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataConfig.timeRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Range</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(type === 'line-chart' || type === 'bar-chart' || type === 'pie-chart') && (
          <FormField
            control={form.control}
            name="showLegend"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Show Legend</FormLabel>
                  <FormDescription>
                    Display legend for the chart
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {(type === 'line-chart' || type === 'bar-chart') && (
          <>
            <FormField
              control={form.control}
              name="dataConfig.xAxis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X-Axis Field</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Field name for X-axis" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataConfig.yAxis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Y-Axis Field</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Field name for Y-axis" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === 'pie-chart' && (
          <>
            <FormField
              control={form.control}
              name="dataConfig.nameField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name Field</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Field for segment names" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataConfig.valueField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value Field</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Field for segment values" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Widget
          </Button>
        </div>
      </form>
    </Form>
  );
}