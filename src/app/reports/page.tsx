
'use client';

import { useState } from 'react';
import { ReportForm, ReportConfig } from './report-form';
import { ReportView, ReportData } from './report-view';
import { initialConnections } from '@/app/configure/connections-data';

// Mock data generation
const generateMockReportData = (config: ReportConfig): ReportData[] => {
  if (config.connections.length === 0 || config.dataPoints.length === 0) return [];
  
  const data: ReportData[] = [];
  const startTime = config.dateRange?.from?.getTime() || new Date().getTime() - 24 * 60 * 60 * 1000;
  const endTime = config.dateRange?.to?.getTime() || new Date().getTime();
  const timeStep = (endTime - startTime) / 50; // Generate 50 data points

  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(startTime + i * timeStep);
    for (const connId of config.connections) {
      const connection = initialConnections.find(c => c.id === connId);
      if (connection) {
        for (const dp of config.dataPoints) {
           data.push({
            timestamp: timestamp.toISOString(),
            connectionName: connection.name,
            dataPoint: dp,
            value: (Math.random() * 100).toFixed(2),
          });
        }
      }
    }
  }
  return data.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData[] | null>(null);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);


  const handleGenerateReport = (config: ReportConfig) => {
    setReportConfig(config);
    const data = generateMockReportData(config);
    setReportData(data);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Report Generator
        </h1>
        <p className="text-muted-foreground">
          Create and export custom reports from your data sources.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ReportForm onGenerateReport={handleGenerateReport} />
        </div>
        <div className="lg:col-span-2">
            <ReportView data={reportData} config={reportConfig} />
        </div>
      </div>
    </div>
  );
}
