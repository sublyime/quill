import { DashboardWidget } from '@/types/dashboard';
import { DashboardWidgetCard } from './dashboard-widget-card';

interface DashboardContainerProps {
  widgets: DashboardWidget[];
  onWidgetDelete: (widgetId: string) => void;
  onWidgetEdit: (widget: DashboardWidget) => void;
}

export function DashboardContainer({
  widgets,
  onWidgetDelete,
  onWidgetEdit,
}: DashboardContainerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget) => (
        <DashboardWidgetCard
          key={widget.id}
          widget={widget}
          onEdit={() => onWidgetEdit(widget)}
          onDelete={() => onWidgetDelete(widget.id)}
        />
      ))}
    </div>
  );
}