import { DashboardWidget } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, X } from 'lucide-react';
import {
  BarChartWidget,
  LineChartWidget,
  PieChartWidget,
  StatsWidget
} from './widgets';

interface DashboardWidgetCardProps {
  widget: DashboardWidget;
  onEdit: () => void;
  onDelete: () => void;
}

export function DashboardWidgetCard({
  widget,
  onEdit,
  onDelete,
}: DashboardWidgetCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {widget.title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {widget.type === 'bar-chart' && <BarChartWidget widget={widget} />}
        {widget.type === 'line-chart' && <LineChartWidget widget={widget} />}
        {widget.type === 'pie-chart' && <PieChartWidget widget={widget} />}
        {widget.type === 'stats' && <StatsWidget widget={widget} />}
        {widget.type === 'table' && <div>Table Widget</div>}
      </CardContent>
    </Card>
  );
}