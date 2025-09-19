'use client';

import { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DashboardWidget } from '@/types/dashboard';

interface WidgetConfigurationProps {
  widget: DashboardWidget;
  onUpdate: (widget: DashboardWidget) => void;
}

const defaultStyle = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  fontSize: '14px',
  padding: '16px',
  borderRadius: '8px',
  chartColors: ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#6366f1']
};

export function WidgetConfiguration({ widget, onUpdate }: WidgetConfigurationProps) {
  const [currentWidget, setCurrentWidget] = useState<DashboardWidget>({
    ...widget,
    style: {
      ...defaultStyle,
      ...(widget.style || {})
    }
  });

  type StyleField = keyof NonNullable<DashboardWidget['style']>;
  type DataConfigField = keyof NonNullable<DashboardWidget['dataConfig']>;

  const handleStyleChange = (field: StyleField, value: string | string[]) => {
    setCurrentWidget(prev => ({
      ...prev,
      style: {
        ...(prev.style || {}),
        [field]: value
      }
    }));
  };

  const handleDataConfigChange = (field: DataConfigField, value: string | number) => {
    setCurrentWidget(prev => ({
      ...prev,
      dataConfig: {
        ...(prev.dataConfig || {}),
        [field]: value
      }
    }));
  };

  const handleBasicChange = (field: keyof DashboardWidget, value: string) => {
    setCurrentWidget(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Widget Configuration</DialogTitle>
      </DialogHeader>
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input 
                value={currentWidget.title} 
                onChange={(e) => handleBasicChange('title', e.target.value)} 
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input 
                value={currentWidget.description} 
                onChange={(e) => handleBasicChange('description', e.target.value)} 
              />
            </div>
            <div>
              <Label>Widget Type</Label>
              <Select 
                value={currentWidget.type}
                onValueChange={(value: any) => handleBasicChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar-chart">Bar Chart</SelectItem>
                  <SelectItem value="pie-chart">Pie Chart</SelectItem>
                  <SelectItem value="line-chart">Line Chart</SelectItem>
                  <SelectItem value="stats">Stats</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style">
          <div className="space-y-4">
            <div>
              <Label>Background Color</Label>
              <ColorPicker 
                value={currentWidget.style?.backgroundColor || defaultStyle.backgroundColor}
                onChange={(color) => handleStyleChange('backgroundColor', color)}
              />
            </div>
            <div>
              <Label>Text Color</Label>
              <ColorPicker 
                value={currentWidget.style?.textColor || defaultStyle.textColor}
                onChange={(color) => handleStyleChange('textColor', color)}
              />
            </div>
            <div>
              <Label>Font Size</Label>
              <Input 
                value={currentWidget.style?.fontSize || defaultStyle.fontSize}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              />
            </div>
            <div>
              <Label>Padding</Label>
              <Input 
                value={currentWidget.style?.padding || defaultStyle.padding}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
              />
            </div>
            <div>
              <Label>Border Radius</Label>
              <Input 
                value={currentWidget.style?.borderRadius || defaultStyle.borderRadius}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
              />
            </div>
            <div>
              <Label>Chart Colors</Label>
              <div className="flex gap-2">
                {(currentWidget.style?.chartColors || defaultStyle.chartColors).map((color, index) => (
                  <ColorPicker
                    key={index}
                    value={color}
                    onChange={(newColor) => {
                      const currentColors = [...(currentWidget.style?.chartColors || defaultStyle.chartColors)];
                      currentColors[index] = newColor;
                      handleStyleChange('chartColors', currentColors);
                    }}
                  />
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const currentColors = [...(currentWidget.style?.chartColors || defaultStyle.chartColors)];
                    currentColors.push('#000000');
                    handleStyleChange('chartColors', currentColors);
                  }}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-4">
            <div>
              <Label>Data Source</Label>
              <Select 
                value={currentWidget.dataConfig.source}
                onValueChange={(value) => handleDataConfigChange('source', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="connections">Connections</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Metric</Label>
              <Input 
                value={currentWidget.dataConfig.metric}
                onChange={(e) => handleDataConfigChange('metric', e.target.value)}
              />
            </div>
            <div>
              <Label>Aggregation</Label>
              <Select 
                value={currentWidget.dataConfig.aggregation}
                onValueChange={(value) => handleDataConfigChange('aggregation', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="avg">Average</SelectItem>
                  <SelectItem value="min">Minimum</SelectItem>
                  <SelectItem value="max">Maximum</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time Range</Label>
              <Select 
                value={currentWidget.dataConfig.timeRange}
                onValueChange={(value) => handleDataConfigChange('timeRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Refresh Interval (seconds)</Label>
              <Input 
                type="number"
                value={currentWidget.dataConfig.refreshInterval}
                onChange={(e) => handleDataConfigChange('refreshInterval', parseInt(e.target.value))}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => onUpdate({ ...widget })}>
          Cancel
        </Button>
        <Button onClick={() => onUpdate(currentWidget)}>
          Save Changes
        </Button>
      </div>
    </DialogContent>
  );
}