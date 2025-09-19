'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DashboardWidget, WidgetType } from '@/types/dashboard';
import { WidgetConfigurationForm } from './widget-configuration-form';

interface WidgetConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetType?: WidgetType;
  initialConfig?: DashboardWidget;
  onSave: (config: Partial<DashboardWidget>) => void;
}

export function WidgetConfigurationDialog({
  open,
  onOpenChange,
  widgetType,
  initialConfig,
  onSave,
}: WidgetConfigurationDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = (config: Partial<DashboardWidget>) => {
    onSave(config);
    onOpenChange(false);
  };

  if (!widgetType) {
    return null;
  }

  const isEditing = !!initialConfig;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Widget' : 'Add New Widget'}
          </DialogTitle>
          <DialogDescription>
            Configure your widget settings below. Required fields are marked with an asterisk.
          </DialogDescription>
        </DialogHeader>

        <WidgetConfigurationForm
          type={widgetType}
          initialConfig={initialConfig}
          onSubmit={handleSave}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}