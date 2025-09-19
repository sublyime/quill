import { DashboardWidget } from '@/types/dashboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RealtimeChart } from '../realtime-chart';

const defaultChartColors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#6366f1'];

interface LineChartWidgetProps {
  widget: DashboardWidget;
}

export function LineChartWidget({ widget }: LineChartWidgetProps) {
  // Use RealtimeChart if realtime mode is enabled
  if (widget.dataConfig.realtime) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
        <RealtimeChart
          yAxisLabel={widget.dataConfig.yAxisLabel}
          initialValue={Number(widget.dataConfig.initialValue) || 50}
          minValue={Number(widget.dataConfig.minValue) || 0}
          maxValue={Number(widget.dataConfig.maxValue) || 100}
          precision={Number(widget.dataConfig.precision) || 0}
        />
      </div>
    );
  }

  // Transform the data into a format Recharts expects
  const data = Object.entries(widget.dataConfig.source || {}).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={widget.style?.chartColors?.[0] ?? defaultChartColors[0]}
            strokeWidth={2}
            dot={{ fill: widget.style?.chartColors?.[0] ?? defaultChartColors[0] }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}