'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const presetColors = [
  { value: '#000000', label: 'Black' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#0ea5e9', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Yellow' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
];

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-8 w-full rounded-md border border-input flex items-center gap-2 px-3",
            className
          )}
        >
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm text-muted-foreground">{value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-5 gap-2">
          {presetColors.map((color) => (
            <button
              key={color.value}
              className={cn(
                "h-8 w-8 rounded-full",
                value === color.value && "ring-2 ring-primary"
              )}
              style={{ backgroundColor: color.value }}
              title={color.label}
              onClick={() => onChange(color.value)}
            />
          ))}
        </div>
        <div className="mt-4">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}