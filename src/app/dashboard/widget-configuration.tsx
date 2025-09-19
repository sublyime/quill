'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardWidget, DashboardWidgetStyle, DashboardDataConfig } from './dashboard-types';
import { WIDGET_TYPES } from './widget-types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WidgetConfigurationProps {
  widget: DashboardWidget;
  onUpdate: (updatedWidget: DashboardWidget) => void;
  onClose: () => void;
}

export function WidgetConfiguration({ widget, onUpdate, onClose }: WidgetConfigurationProps) {
  const defaultStyle: DashboardWidgetStyle = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: '14px',
    padding: '16px',
    borderRadius: '8px',
    chartColors: ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#6366f1'],
  };

  const [currentWidget, setCurrentWidget] = useState<DashboardWidget>({
    ...widget,
    style: {
      ...defaultStyle,
      ...(widget.style || {}),
    },
  });

  const widgetType = WIDGET_TYPES[widget.type];

  const handleStyleChange = (key: keyof DashboardWidgetStyle, value: string) => {
    setCurrentWidget(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [key]: value
      }
    }));
  };

  const handleDataConfigChange = (key: keyof DashboardDataConfig, value: string) => {
    setCurrentWidget(prev => ({
      ...prev,
      dataConfig: {
        ...prev.dataConfig,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onUpdate(currentWidget);
    onClose();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Configure Widget: {widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Widget Title</Label>
              <Input
                id="title"
                value={currentWidget.title}
                onChange={(e) => setCurrentWidget(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={currentWidget.description || ''}
                onChange={(e) => setCurrentWidget(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <ColorPicker
                    value={(currentWidget.style?.backgroundColor ?? defaultStyle.backgroundColor)!}
                    onChange={(color) => handleStyleChange('backgroundColor', color)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <ColorPicker
                    value={(currentWidget.style?.textColor ?? defaultStyle.textColor)!}
                    onChange={(color) => handleStyleChange('textColor', color)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select
                    value={currentWidget.style.fontSize || widgetType.styleConfigTemplate.defaultFontSize}
                    onValueChange={(value) => handleStyleChange('fontSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.75rem">Small</SelectItem>
                      <SelectItem value="1rem">Medium</SelectItem>
                      <SelectItem value="1.25rem">Large</SelectItem>
                      <SelectItem value="1.5rem">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select
                    value={currentWidget.style.borderRadius || widgetType.styleConfigTemplate.defaultBorderRadius}
                    onValueChange={(value) => handleStyleChange('borderRadius', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select border radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="0.25rem">Small</SelectItem>
                      <SelectItem value="0.5rem">Medium</SelectItem>
                      <SelectItem value="1rem">Large</SelectItem>
                      <SelectItem value="9999px">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {widgetType.styleConfigTemplate.supportedChartColors && (
                  <div className="space-y-2">
                    <Label>Chart Colors</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {widgetType.styleConfigTemplate.supportedChartColors.map((colorSet, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="p-2 h-auto"
                          onClick={() => handleStyleChange('chartColors', JSON.stringify(colorSet))}
                        >
                          <div className="flex space-x-1">
                            {colorSet.map((color, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Source</Label>
                  <Select
                    value={currentWidget.dataConfig.source}
                    onValueChange={(value) => handleDataConfigChange('source', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {widgetType.dataConfigTemplate.supportedSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source.charAt(0).toUpperCase() + source.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Metric</Label>
                  <Select
                    value={currentWidget.dataConfig.metric}
                    onValueChange={(value) => handleDataConfigChange('metric', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      {widgetType.dataConfigTemplate.supportedMetrics.map((metric) => (
                        <SelectItem key={metric} value={metric}>
                          {metric.charAt(0).toUpperCase() + metric.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {widgetType.dataConfigTemplate.defaultAggregation && (
                  <div className="space-y-2">
                    <Label>Aggregation</Label>
                    <Select
                      value={currentWidget.dataConfig.aggregation || widgetType.dataConfigTemplate.defaultAggregation}
                      onValueChange={(value) => handleDataConfigChange('aggregation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select aggregation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="min">Minimum</SelectItem>
                        <SelectItem value="max">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {widgetType.dataConfigTemplate.defaultTimeRange && (
                  <div className="space-y-2">
                    <Label>Time Range</Label>
                    <Select
                      value={currentWidget.dataConfig.timeRange || widgetType.dataConfigTemplate.defaultTimeRange}
                      onValueChange={(value) => handleDataConfigChange('timeRange', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Last Hour</SelectItem>
                        <SelectItem value="day">Last 24 Hours</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Refresh Interval (seconds)</Label>
                  <Select
                    value={String(currentWidget.dataConfig.refreshInterval || widgetType.dataConfigTemplate.defaultRefreshInterval)}
                    onValueChange={(value) => handleDataConfigChange('refreshInterval', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select refresh interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Real-time (1s)</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="3600">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}