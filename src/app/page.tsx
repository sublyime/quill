
'use client';

import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealtimeChart } from '@/components/dashboard/realtime-chart';
import { BarChartSimple } from '@/components/dashboard/bar-chart-simple';
import { PieChartSimple } from '@/components/dashboard/pie-chart-simple';
import { Thermometer, Zap, Gauge, Users, PieChart as PieChartIcon, Settings } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardPage() {
    const layouts = {
        lg: [
            { i: 'a', x: 0, y: 0, w: 1, h: 1 },
            { i: 'b', x: 1, y: 0, w: 1, h: 1 },
            { i: 'c', x: 2, y: 0, w: 1, h: 1 },
            { i: 'd', x: 0, y: 1, w: 1, h: 1 },
            { i: 'e', x: 1, y: 1, w: 1, h: 1 },
            { i: 'f', x: 2, y: 1, w: 1, h: 1.5, minW: 1, minH: 1.5 },
        ],
    };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of your data sources. Drag, drop, and resize to customize your view.
        </p>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 }}
        rowHeight={300}
        isResizable
        isDraggable
      >
        <div key="a">
           <Card className="w-full h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Industrial Sensor Temperature
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-4 w-4">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    <RealtimeChart yAxisLabel="°C" initialValue={45} minValue={30} maxValue={90} />
                </CardContent>
            </Card>
        </div>
         <div key="b">
             <Card className="w-full h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Device Connections
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-4 w-4">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    <BarChartSimple />
                </CardContent>
            </Card>
        </div>
         <div key="c">
             <Card className="w-full h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Data Source Types
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-4 w-4">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    <PieChartSimple />
                </CardContent>
            </Card>
        </div>
         <div key="d">
             <Card className="w-full h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    IoT Device Voltage
                    </CardTitle>
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-4 w-4">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    <RealtimeChart yAxisLabel="V" initialValue={3.3} minValue={2.8} maxValue={3.8} precision={2} />
                </CardContent>
            </Card>
        </div>
         <div key="e">
             <Card className="w-full h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    System Pressure
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-4 w-4">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    <RealtimeChart yAxisLabel="PSI" initialValue={100} minValue={80} maxValue={150} />
                </CardContent>
            </Card>
        </div>
         <div key="f">
            <Card className="w-full h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle>Combined Feed</CardTitle>
                        <CardDescription>A larger view of multiple data points.</CardDescription>
                    </div>
                     <Button variant="ghost" size="icon" className="h-4 w-4">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </CardHeader>
                <CardContent className="h-[calc(100%-72px)] pt-6">
                    <RealtimeChart yAxisLabel="Value" initialValue={500} minValue={0} maxValue={1000} />
                </CardContent>
            </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}
