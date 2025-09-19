import { DashboardWidget } from '@/types/dashboard';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const defaultChartColors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#6366f1'];

interface BarChartWidgetProps {
  widget: DashboardWidget;
}

export function BarChartWidget({ widget }: BarChartWidgetProps) {
  // Transform the widget data into the format Recharts expects
  const data = Object.entries(widget.dataConfig.source).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="value"
            fill={widget.style?.chartColors?.[0] ?? defaultChartColors[0]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}