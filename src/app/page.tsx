import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RealtimeChart } from '@/components/dashboard/realtime-chart';
import { Thermometer, Zap, Gauge } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of your data sources.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Industrial Sensor Temperature
            </CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <RealtimeChart yAxisLabel="°C" initialValue={45} minValue={30} maxValue={90} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              IoT Device Voltage
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <RealtimeChart yAxisLabel="V" initialValue={3.3} minValue={2.8} maxValue={3.8} precision={2} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Pressure
            </CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <RealtimeChart yAxisLabel="PSI" initialValue={100} minValue={80} maxValue={150} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Combined Feed</CardTitle>
            <CardDescription>A larger view of multiple data points.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
             <RealtimeChart yAxisLabel="Value" initialValue={500} minValue={0} maxValue={1000} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
