import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VibrationData } from '@/types/vibration';
import { getMonthlyColumnChartData } from '@/lib/vibrationUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, Calendar } from 'lucide-react';

interface MonthlyColumnChartProps {
  data: VibrationData[];
  selectedMonth?: string | null;
  onSelectMonth?: (monthKey: string | null) => void;
}

export const MonthlyColumnChart: React.FC<MonthlyColumnChartProps> = ({
  data,
  selectedMonth,
  onSelectMonth,
}) => {
  const chartData = getMonthlyColumnChartData(data);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground border border-border rounded-lg p-3 shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between font-bold text-sm border-b pb-1">
            <span>{row.month}</span>
            <span className="text-primary">{row.totalUnique} Total</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Normal:
              </span>
              <span className="font-semibold text-foreground">{row.Normal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Alert:
              </span>
              <span className="font-semibold text-foreground">{row.Alert}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-destructive">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                Alarm:
              </span>
              <span className="font-semibold text-foreground">{row.Alarm}</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground pt-1 border-t italic">
            Total unique machines inspected
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom top label renderer to show total number of unique equipment ON TOP of each column stack
  const renderTopTotalLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === undefined || value === null || isNaN(value)) return null;

    return (
      <g>
        {/* Subtle pill background */}
        <rect
          x={x + width / 2 - 14}
          y={y - 20}
          width={28}
          height={16}
          rx={4}
          fill="#ffffff"
          stroke="#94a3b8"
          strokeWidth={1}
        />
        <text
          x={x + width / 2}
          y={y - 9}
          fill="#0f172a"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fontWeight={800}
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <Card className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Condition Inspection Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Month-wise unique equipment with 3-tier condition split & total counts on top
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground font-semibold">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              {chartData.length} Survey Periods
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No inspection timeline data available
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 28, right: 12, left: -15, bottom: 5 }}
                barSize={38}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length && onSelectMonth) {
                    const mKey = e.activePayload[0].payload.monthKey;
                    onSelectMonth(selectedMonth === mKey ? null : mKey);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={30}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                />

                {/* Normal Segment */}
                <Bar
                  dataKey="Normal"
                  stackId="conditionStack"
                  fill="#10b981"
                  name="Normal"
                  radius={[0, 0, 0, 0]}
                />

                {/* Alert Segment */}
                <Bar
                  dataKey="Alert"
                  stackId="conditionStack"
                  fill="#f59e0b"
                  name="Alert"
                  radius={[0, 0, 0, 0]}
                />

                {/* Alarm Segment */}
                <Bar
                  dataKey="Alarm"
                  stackId="conditionStack"
                  fill="#ef4444"
                  name="Alarm"
                  radius={[4, 4, 0, 0]}
                />

                {/* Transparent Total Bar to host top count badge accurately across all 8 periods */}
                <Bar
                  dataKey="totalUnique"
                  fill="none"
                  stroke="none"
                  legendType="none"
                  tooltipType="none"
                  isAnimationActive={false}
                  label={renderTopTotalLabel}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
