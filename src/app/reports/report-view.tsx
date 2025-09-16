
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { ReportConfig } from './report-form';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export interface ReportData {
  timestamp: string;
  connectionName: string;
  dataPoint: string;
  value: string | number;
}

interface ReportViewProps {
  data: ReportData[] | null;
  config: ReportConfig | null;
}

export function ReportView({ data, config }: ReportViewProps) {

  const handleExport = () => {
    if (!data) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ReportData');
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create a Blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    const fileName = `DataQuill_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

    saveAs(blob, fileName);
  };


  if (!data) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground p-6">
          <FileText className="mx-auto h-12 w-12 mb-4" />
          <p>Your generated report will appear here.</p>
          <p className="text-sm">
            Use the form on the left to configure and generate a new report.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Report</CardTitle>
        <CardDescription>
          Showing data for{' '}
          {config?.connections
            .map(
              (c) =>
                c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, ' ')
            )
            .join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Connection</TableHead>
              <TableHead>Data Point</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
                <TableCell>{row.connectionName}</TableCell>
                <TableCell>{row.dataPoint.charAt(0).toUpperCase() + row.dataPoint.slice(1).replace(/_/g, ' ')}</TableCell>
                <TableCell>{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleExport} disabled={!data || data.length === 0}>
            <FileDown className="mr-2" />
            Export to Excel
        </Button>
      </CardFooter>
    </Card>
  );
}
