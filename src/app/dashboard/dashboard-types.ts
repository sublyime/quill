'use client';

import { DashboardWidgetType } from './widget-types';

export interface DashboardWidgetStyle {
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  padding?: string;
  borderRadius?: string;
  borderColor?: string;
  chartColors?: string[];
}

export interface DashboardDataConfig {
  source: string;
  metric: string;
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year';
  refreshInterval?: number;
}

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  description?: string;
  style: DashboardWidgetStyle;
  dataConfig: DashboardDataConfig;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  globalStyle?: {
    backgroundColor?: string;
    gridGap?: number;
    padding?: string;
  };
}