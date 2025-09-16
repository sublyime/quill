'use client';

import { useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type RealtimeChartProps = {
  yAxisLabel?: string;
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
  precision?: number;
};

const chartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function RealtimeChart({
  yAxisLabel = 'Value',
  initialValue = 50,
  minValue = 0,
  maxValue = 100,
  precision = 0,
}: RealtimeChartProps) {
  const [data, setData] = useState(() => {
    const now = new Date();
    return Array.from({ length: 30 }, (_, i) => ({
      time: new Date(now.getTime() - (29 - i) * 1000).toLocaleTimeString(),
      value: initialValue,
    }));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const lastValue = prevData[prevData.length - 1].value;
        const change = (Math.random() - 0.5) * (maxValue - minValue) * 0.1;
        let newValue = lastValue + change;

        if (newValue > maxValue) newValue = maxValue - Math.random() * (maxValue - minValue) * 0.05;
        if (newValue < minValue) newValue = minValue + Math.random() * (maxValue - minValue) * 0.05;
        
        newValue = parseFloat(newValue.toFixed(precision));

        const newDataPoint = {
          time: new Date().toLocaleTimeString(),
          value: newValue,
        };
        const updatedData = [...prevData.slice(1), newDataPoint];
        return updatedData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [maxValue, minValue, precision]);

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              domain={[minValue, maxValue]}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: '12px', fill: 'hsl(var(--muted-foreground))' },
              }}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillValue)"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
