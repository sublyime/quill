'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cog, X } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { DashboardWidget } from '@/types/dashboard';
import { BarChartSimple } from './bar-chart-simple';
import { PieChartSimple } from './pie-chart-simple';
import { RealtimeChart } from './realtime-chart';
import { WidgetConfiguration } from './widget-configuration';

interface DashboardWidgetProps {
  widget: DashboardWidget;
  onEdit: (widgetId: string) => void;
  onUpdate: (widget: DashboardWidget) => void;
  isEditing: boolean;
}

import { StatsWidget } from './widgets/stats-widget';
import { TableWidget } from './widgets/table-widget';
import type { WidgetType } from '@/types/dashboard';

// Wrapper for RealtimeChart that adapts widget props
function RealtimeChartWidget({ widget }: { widget: DashboardWidget }) {
  return (
    <RealtimeChart
      yAxisLabel={widget.dataConfig.yAxisLabel}
      initialValue={widget.dataConfig.initialValue}
      minValue={widget.dataConfig.minValue}
      maxValue={widget.dataConfig.maxValue}
      precision={widget.dataConfig.precision}
    />
  );
}

const widgetComponents: Record<WidgetType, React.ComponentType<{ widget: DashboardWidget }>> = {
  'bar-chart': BarChartSimple,
  'pie-chart': PieChartSimple,
  'line-chart': RealtimeChartWidget,
  'stats': StatsWidget,
  'table': TableWidget,
};

const defaultStyle = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  fontSize: '14px',
  padding: '16px',
  borderRadius: '8px',
  chartColors: ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#6366f1'],
};

export function DashboardWidgetComponent({ widget, onEdit, onUpdate, isEditing }: DashboardWidgetProps) {
  const [showConfig, setShowConfig] = useState(false);
  const WidgetContent = widgetComponents[widget.type];

  return (
    <Card 
      className="w-full h-full" 
      style={{ 
        backgroundColor: widget.style?.backgroundColor ?? defaultStyle.backgroundColor,
        color: widget.style?.textColor ?? defaultStyle.textColor,
        padding: widget.style?.padding ?? defaultStyle.padding,
        borderRadius: widget.style?.borderRadius ?? defaultStyle.borderRadius,
      }}
    >
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: widget.style?.fontSize ?? defaultStyle.fontSize }}>{widget.title}</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowConfig(true)}>
              <Cog className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(widget.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="widget-content">
          {WidgetContent && <WidgetContent widget={widget} />}
        </div>

        <Dialog open={showConfig} onOpenChange={setShowConfig}>
          <WidgetConfiguration
            widget={widget}
            onUpdate={(updatedWidget) => {
              onUpdate(updatedWidget);
              setShowConfig(false);
            }}
          />
        </Dialog>
      </div>
    </Card>
  );
}