'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardWidget, WidgetType } from '@/types/dashboard';
import { DashboardContainer } from '@/components/dashboard/dashboard-container';
import { WidgetConfigurationDialog } from '@/components/dashboard/widget-configuration-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BarChart3, LineChart, PieChart, Table2, Activity } from 'lucide-react';

const WIDGET_TYPES: Array<{
  type: WidgetType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    type: 'line-chart',
    label: 'Line Chart',
    icon: <LineChart className="h-6 w-6" />,
    description: 'Visualize trends over time',
  },
  {
    type: 'bar-chart',
    label: 'Bar Chart',
    icon: <BarChart3 className="h-6 w-6" />,
    description: 'Compare values across categories',
  },
  {
    type: 'pie-chart',
    label: 'Pie Chart',
    icon: <PieChart className="h-6 w-6" />,
    description: 'Show proportions of a whole',
  },
  {
    type: 'stats',
    label: 'Stats Card',
    icon: <Activity className="h-6 w-6" />,
    description: 'Display key metrics and trends',
  },
  {
    type: 'table',
    label: 'Table',
    icon: <Table2 className="h-6 w-6" />,
    description: 'Show detailed data in rows and columns',
  },
];

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | undefined>();
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | undefined>();

  const handleAddWidgetClick = () => {
    setShowTypeSelector(true);
  };

  const handleTypeSelect = (type: WidgetType) => {
    setSelectedWidgetType(type);
    setShowTypeSelector(false);
    setShowConfigDialog(true);
  };

  const handleWidgetDelete = (widgetId: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
  };

  const handleWidgetEdit = (widget: DashboardWidget) => {
    setEditingWidget(widget);
    setSelectedWidgetType(widget.type);
    setShowConfigDialog(true);
  };

  const handleWidgetSave = (config: Partial<DashboardWidget>) => {
    if (editingWidget) {
      // Update existing widget
      setWidgets(prev => prev.map(widget => {
        if (widget.id === editingWidget.id) {
          return {
            ...widget,
            ...config,
            type: widget.type, // Preserve the original type
          } as DashboardWidget;
        }
        return widget;
      }));
      setEditingWidget(undefined);
    } else if (selectedWidgetType) {
      // Add new widget with the correct type
      const newWidget = {
        id: crypto.randomUUID(),
        ...config,
        type: selectedWidgetType,
      } as DashboardWidget;
      setWidgets(prev => [...prev, newWidget]);
    }
    setSelectedWidgetType(undefined);
    setShowConfigDialog(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage your data in real-time
          </p>
        </div>
        <Button onClick={handleAddWidgetClick}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Widget
        </Button>
      </div>
      
      <DashboardContainer
        widgets={widgets}
        onWidgetDelete={handleWidgetDelete}
        onWidgetEdit={handleWidgetEdit}
      />

      <Dialog open={showTypeSelector} onOpenChange={setShowTypeSelector}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Select Widget Type</DialogTitle>
            <DialogDescription>
              Choose the type of widget you want to add to your dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {WIDGET_TYPES.map(({ type, label, icon, description }) => (
              <button
                key={type}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'h-auto flex flex-col items-center space-y-2 p-4'
                )}
                onClick={() => handleTypeSelect(type)}
              >
                {icon}
                <div className="font-medium">{label}</div>
                <div className="text-sm text-muted-foreground text-center">
                  {description}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <WidgetConfigurationDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        widgetType={selectedWidgetType}
        initialConfig={editingWidget}
        onSave={handleWidgetSave}
      />
    </div>
  );
}
