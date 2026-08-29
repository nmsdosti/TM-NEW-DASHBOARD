import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { VibrationData } from '@/types/vibration';

interface HealthChartProps {
  data: VibrationData[];
}

export const HealthChart = ({ data }: HealthChartProps) => {
  const stats = {
    good: data.filter((d) => d.condition.toLowerCase().includes('good')).length,
    minor: data.filter((d) => d.condition.toLowerCase().includes('minor')).length,
    alert: data.filter((d) => d.condition.toLowerCase().includes('alert')).length,
    alarm: data.filter((d) => d.condition.toLowerCase().includes('alarm')).length,
  };

  const total = stats.good + stats.minor + stats.alert + stats.alarm;

  const chartData = [
    { name: 'Good', value: stats.good, color: 'hsl(var(--success))' },
    { name: 'Minor', value: stats.minor, color: 'hsl(var(--primary))' },
    { name: 'Alert', value: stats.alert, color: 'hsl(var(--warning))' },
    { name: 'Alarm', value: stats.alarm, color: 'hsl(var(--destructive))' },
  ].filter(item => item.value > 0);

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">HEALTH</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="text-center">
              <div className="text-6xl font-bold text-foreground">{total}</div>
              <div className="text-sm text-muted-foreground mt-1">Total</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-sm" 
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{item.value} {item.name}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
