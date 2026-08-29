import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VibrationData } from '@/types/vibration';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

interface MonitoringHistoryChartProps {
  data: VibrationData[];
  selectedMonth: string;
}

export const MonitoringHistoryChart = ({ data, selectedMonth }: MonitoringHistoryChartProps) => {
  // Group data by month and criticality
  const monthlyData = data.reduce((acc, item) => {
    const date = new Date(item.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        good: 0,
        minor: 0,
        alert: 0,
        alarm: 0,
      };
    }
    
    const condition = item.condition.toLowerCase();
    if (condition.includes('good')) acc[monthYear].good++;
    else if (condition.includes('minor')) acc[monthYear].minor++;
    else if (condition.includes('alert')) acc[monthYear].alert++;
    else if (condition.includes('alarm')) acc[monthYear].alarm++;
    
    return acc;
  }, {} as Record<string, { month: string; good: number; minor: number; alert: number; alarm: number }>);

  let chartData = Object.values(monthlyData).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  // Filter by selected month if not "all"
  if (selectedMonth !== 'all') {
    chartData = chartData.filter(d => d.month === selectedMonth);
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.month}</p>
          <p className="text-sm text-muted-foreground mb-2">Total Machines: {total}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    
    // Only show label if the segment is tall enough
    if (height < 20 || value === 0) return null;
    
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-semibold"
      >
        {value}
      </text>
    );
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">MONITORING HISTORY</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Machines', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="good" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]}>
              <LabelList dataKey="good" content={renderCustomLabel} />
            </Bar>
            <Bar dataKey="minor" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]}>
              <LabelList dataKey="minor" content={renderCustomLabel} />
            </Bar>
            <Bar dataKey="alert" stackId="a" fill="hsl(var(--warning))" radius={[0, 0, 0, 0]}>
              <LabelList dataKey="alert" content={renderCustomLabel} />
            </Bar>
            <Bar dataKey="alarm" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="alarm" content={renderCustomLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
