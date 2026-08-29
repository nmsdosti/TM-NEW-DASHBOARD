import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VibrationData } from '@/types/vibration';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface VibrationChartProps {
  data: VibrationData[];
  equipmentName?: string;
}

export const VibrationChart = ({ data, equipmentName }: VibrationChartProps) => {
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const driven = data[0]?.driven || 'Driven';

  const labels = {
    p1: `Motor NDE`,
    p2: `Motor DE`,
    p3: `${driven} DE`,
    p4: `${driven} NDE`,
  };

  const chartData = sortedData.map((item) => ({
    date: item.date,
    [labels.p1]: Math.max(item.measurements.point01.av, item.measurements.point01.hv, item.measurements.point01.vv),
    [labels.p2]: Math.max(item.measurements.point02.av, item.measurements.point02.hv, item.measurements.point02.vv),
    [labels.p3]: Math.max(item.measurements.point03.av, item.measurements.point03.hv, item.measurements.point03.vv),
    [labels.p4]: Math.max(item.measurements.point04.av, item.measurements.point04.hv, item.measurements.point04.vv),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {equipmentName ? `${equipmentName} - Vibration Trends` : 'Vibration Trends'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Vibration (mm/s)', angle: -90, position: 'insideLeft' }} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} />
            <Legend />
            <Line type="monotone" dataKey={labels.p1} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))' }} />
            <Line type="monotone" dataKey={labels.p2} stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} />
            <Line type="monotone" dataKey={labels.p3} stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-3))' }} />
            <Line type="monotone" dataKey={labels.p4} stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-4))' }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
