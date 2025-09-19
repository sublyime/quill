import type { Layout } from 'react-grid-layout';
import type { ResponsiveContainer } from 'recharts';

export type WidgetType = 'bar-chart' | 'pie-chart' | 'line-chart' | 'stats' | 'table';

export interface DashboardWidgetStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  padding?: string;
  borderRadius?: string;
  chartColors?: string[];
}

export interface Column {
  field: string;
  header: string;
  sortable?: boolean;
}

export interface DashboardDataConfig {
  source: any;
  metric: string;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  timeRange: 'day' | 'week' | 'month' | 'year';
  refreshInterval?: number;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  valueField?: string;
  nameField?: string;
  columns?: Column[];
  // Realtime chart properties
  realtime?: boolean;
  yAxisLabel?: string;
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
  precision?: number;
}

export interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  style?: DashboardWidgetStyle;
  dataConfig: DashboardDataConfig;
  layout?: Layout;
}

export interface LineChartConfig extends BaseWidgetConfig {
  type: 'line-chart';
  showLegend?: boolean;
}

export interface BarChartConfig extends BaseWidgetConfig {
  type: 'bar-chart';
  stacked?: boolean;
  showLegend?: boolean;
}

export interface PieChartConfig extends BaseWidgetConfig {
  type: 'pie-chart';
  showLegend?: boolean;
}

export interface StatsConfig extends BaseWidgetConfig {
  type: 'stats';
  comparison?: {
    type: 'increase' | 'decrease';
    value: number;
    period: string;
  };
}

export interface TableConfig extends BaseWidgetConfig {
  type: 'table';
  columns: Array<{
    field: string;
    header: string;
    sortable?: boolean;
  }>;
}

export type DashboardWidget =
  | LineChartConfig
  | BarChartConfig
  | PieChartConfig
  | StatsConfig
  | TableConfig;

export interface WidgetData {
  id: string;
  data: Record<string, any>[];
  loading: boolean;
  error?: string;
  lastUpdated?: Date;
}