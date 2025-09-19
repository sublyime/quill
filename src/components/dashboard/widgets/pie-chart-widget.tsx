import { DashboardWidget } from '@/types/dashboard';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const defaultChartColors = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#6366f1'];

interface PieChartWidgetProps {
  widget: DashboardWidget;
}

export function PieChartWidget({ widget }: PieChartWidgetProps) {
  // Transform the data into a format Recharts expects
  const data = Object.entries(widget.dataConfig.source).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={(widget.style?.chartColors ?? defaultChartColors)[index % (widget.style?.chartColors?.length ?? defaultChartColors.length)]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}