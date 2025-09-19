export type DashboardWidgetType = 
  | 'bar-chart'
  | 'pie-chart'
  | 'line-chart'
  | 'realtime-chart'
  | 'metric-card'
  | 'list'
  | 'table'
  | 'custom';

export interface WidgetTypeConfig {
  type: DashboardWidgetType;
  label: string;
  icon: string;
  description: string;
  defaultSize: {
    w: number;
    h: number;
    minW?: number;
    minH?: number;
  };
  dataConfigTemplate: {
    supportedSources: string[];
    supportedMetrics: string[];
    defaultAggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
    defaultTimeRange?: 'hour' | 'day' | 'week' | 'month' | 'year';
    defaultRefreshInterval?: number;
  };
  styleConfigTemplate: {
    defaultBackgroundColor?: string;
    defaultTextColor?: string;
    defaultFontSize?: string;
    defaultPadding?: string;
    defaultBorderRadius?: string;
    supportedChartColors?: string[][];
  };
}

export const WIDGET_TYPES: Record<DashboardWidgetType, WidgetTypeConfig> = {
  'bar-chart': {
    type: 'bar-chart',
    label: 'Bar Chart',
    icon: 'BarChart',
    description: 'Display data in a vertical or horizontal bar chart',
    defaultSize: { w: 2, h: 2, minW: 1, minH: 1 },
    dataConfigTemplate: {
      supportedSources: ['storage', 'users', 'activity'],
      supportedMetrics: ['count', 'size', 'duration'],
      defaultAggregation: 'sum',
      defaultTimeRange: 'week',
      defaultRefreshInterval: 300
    },
    styleConfigTemplate: {
      defaultBackgroundColor: 'var(--background)',
      defaultTextColor: 'var(--foreground)',
      defaultFontSize: '1rem',
      defaultPadding: '1rem',
      defaultBorderRadius: '0.5rem',
      supportedChartColors: [
        ['#0ea5e9', '#0284c7', '#0369a1'],
        ['#10b981', '#059669', '#047857'],
        ['#6366f1', '#4f46e5', '#4338ca']
      ]
    }
  },
  'pie-chart': {
    type: 'pie-chart',
    label: 'Pie Chart',
    icon: 'PieChart',
    description: 'Display data as a pie or donut chart',
    defaultSize: { w: 1, h: 1, minW: 1, minH: 1 },
    dataConfigTemplate: {
      supportedSources: ['storage', 'users'],
      supportedMetrics: ['distribution', 'percentage'],
      defaultAggregation: 'count',
      defaultTimeRange: 'day',
      defaultRefreshInterval: 300
    },
    styleConfigTemplate: {
      defaultBackgroundColor: 'var(--background)',
      defaultTextColor: 'var(--foreground)',
      defaultFontSize: '1rem',
      defaultPadding: '1rem',
      defaultBorderRadius: '0.5rem',
      supportedChartColors: [
        ['#0ea5e9', '#0284c7', '#0369a1', '#075985'],
        ['#10b981', '#059669', '#047857', '#065f46'],
        ['#6366f1', '#4f46e5', '#4338ca', '#3730a3']
      ]
    }
  },
  'line-chart': {
    type: 'line-chart',
    label: 'Line Chart',
    icon: 'LineChart',
    description: 'Display time-series data as a line chart',
    defaultSize: { w: 2, h: 1, minW: 1, minH: 1 },
    dataConfigTemplate: {
      supportedSources: ['storage', 'users', 'activity'],
      supportedMetrics: ['count', 'size', 'duration'],
      defaultAggregation: 'average',
      defaultTimeRange: 'day',
      defaultRefreshInterval: 60
    },
    styleConfigTemplate: {
      defaultBackgroundColor: 'var(--background)',
      defaultTextColor: 'var(--foreground)',
      defaultFontSize: '1rem',
      defaultPadding: '1rem',
      defaultBorderRadius: '0.5rem',
      supportedChartColors: [
        ['#0ea5e9'],
        ['#10b981'],
        ['#6366f1']
      ]
    }
  },
  'realtime-chart': {
    type: 'realtime-chart',
    label: 'Realtime Chart',
    icon: 'Activity',
    description: 'Display real-time data updates',
    defaultSize: { w: 2, h: 1, minW: 2, minH: 1 },
    dataConfigTemplate: {
      supportedSources: ['storage', 'activity'],
      supportedMetrics: ['latency', 'requests', 'errors'],
      defaultAggregation: 'average',
      defaultTimeRange: 'hour',
      defaultRefreshInterval: 1
    },
    styleConfigTemplate: {
      defaultBackgroundColor: 'var(--background)',
      defaultTextColor: 'var(--foreground)',
      defaultFontSize: '1rem',
      defaultPadding: '1rem',
      defaultBorderRadius: '0.5rem',
      supportedChartColors: [
        ['#0ea5e9'],
        ['#10b981'],
        ['#6366f1']
      ]
    }
  },
  'metric-card': {
    type: 'metric-card',
    label: 'Metric Card',
    icon: 'Square',
    description: 'Display a single metric with optional trend',
    defaultSize: { w: 1, h: 1, minW: 1, minH: 1 },
    dataConfigTemplate: {
      supportedSources: ['storage', 'users', 'activity'],
      supportedMetrics: ['count', 'size', 'duration'],
      defaultAggregation: 'sum',
      defaultTimeRange: 'day',
      defaultRefreshInterval: 300
    },
    styleConfigTemplate: {
      defaultBackgroundColor: 'var(--background)',
      defaultTextColor: 'var(--foreground)',
      defaultFontSize: '1.5rem',
      defaultPadding: '1rem',
      defaultBorderRadius: '0.5rem'
    }
  },
  'list': {
    type: 'list',
    label: 'List',
    icon: 'List',
    description: 'Display data in a scrollable list format',
    defaultSize: { w: 1, h: 2, minW: 1, minH: 1 },
    dataConfigTemplate: {
      supportedSources: ['storage', 'users', 'activity'],
      supportedMetrics: ['recent', 'top', 'errors'],
      defaultTimeRange: 'day',
      defaultRefreshInterval: 60
    },
    styleConfigTemplate: {
      defaultBackgroundColor: 'var(--background)',
      defaultTextColor: 'var(--foreground)',
      defaultFontSize: '0.875rem',
      defaultPadding: '0.5rem',
      defaultBorderRadius: '0.5rem'
    }
  },
  'table': {
    type: 'table',
    label: 'Table',
    icon: 'Table',
    description: 'Display data in a tabular format',
    defaultSize: { w: 2, h: 2, minW: 1, minH: 1 },
    dataConfigTemplate: {
      supportedSources: ['storage', 'users', 'activity'],
      supportedMetrics: ['details', 'logs', 'summary'],
      defaultTimeRange: 'day',
      defaultRefreshInterval: 300
    },
    styleConfigTemplate: {
      defaultBackgroundColor: 'var(--background)',
      defaultTextColor: 'var(--foreground)',
      defaultFontSize: '0.875rem',
      defaultPadding: '0.5rem',
      defaultBorderRadius: '0.5rem'
    }
  },
  'custom': {
    type: 'custom',
    label: 'Custom Widget',
    icon: 'Box',
    description: 'Create a custom widget with your own content',
    defaultSize: { w: 1, h: 1, minW: 1, minH: 1 },
    dataConfigTemplate: {
      supportedSources: ['custom'],
      supportedMetrics: ['custom'],
      defaultRefreshInterval: 300
    },
    styleConfigTemplate: {
      defaultBackgroundColor: 'var(--background)',
      defaultTextColor: 'var(--foreground)',
      defaultFontSize: '1rem',
      defaultPadding: '1rem',
      defaultBorderRadius: '0.5rem'
    }
  }
};