import { DashboardWidget } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface StatsWidgetProps {
  widget: DashboardWidget;
}

interface StatData {
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  label: string;
}

export function StatsWidget({ widget }: StatsWidgetProps) {
  const data = widget.dataConfig.source as unknown as StatData;

  const changeColor = data.changeType === 'increase' ? 'text-green-500' : 'text-red-500';
  const ChangeIcon = data.changeType === 'increase' ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="h-full">
      <div className="space-y-2">
        <div className="text-2xl font-bold">
          {data.value.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <ChangeIcon className={`w-4 h-4 ${changeColor}`} />
          <span className={`text-sm ${changeColor}`}>
            {Math.abs(data.change)}%
          </span>
          <span className="text-sm text-muted-foreground">
            vs. previous {widget.dataConfig.timeRange}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {data.label}
        </div>
      </div>
    </div>
  );
}