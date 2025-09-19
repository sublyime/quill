'use client';

import { DashboardWidget } from '@/types/dashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column {
  field: string;
  header: string;
  sortable?: boolean;
}

interface TableRow {
  [key: string]: any;
}

interface TableWidgetProps {
  widget: DashboardWidget;
}

export function TableWidget({ widget }: TableWidgetProps) {
  const data = (Array.isArray(widget.dataConfig.source) ? widget.dataConfig.source : []) as TableRow[];
  const columns = (widget.dataConfig.columns || []) as Column[];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.field}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={column.field}>{row[column.field]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}