import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { VibrationData } from '@/types/vibration';
import { getUniqueConditionDistribution } from '@/lib/vibrationUtils';
import { ShieldCheck, AlertTriangle, AlertOctagon, Cpu } from 'lucide-react';

interface UniqueConditionPieChartProps {
  data: VibrationData[];
  selectedConditionFilter?: string | null;
  onSelectConditionFilter?: (condition: 'Normal' | 'Alert' | 'Alarm' | null) => void;
}

export const UniqueConditionPieChart: React.FC<UniqueConditionPieChartProps> = ({
  data,
  selectedConditionFilter,
  onSelectConditionFilter,
}) => {
  const { total, normal, alert, alarm, pieData } = getUniqueConditionDistribution(data);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground border border-border rounded-lg p-3 shadow-xl text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name} Condition</span>
          </div>
          <p className="text-muted-foreground">
            Unique Equipment: <span className="font-semibold text-foreground">{item.value}</span> ({item.percentage}%)
          </p>
          <p className="text-[11px] text-muted-foreground italic">
            Based on latest recorded inspection
          </p>
        </div>
      );
    }
    return null;
  };

  const handleSliceClick = (entry: any) => {
    if (!onSelectConditionFilter) return;
    if (selectedConditionFilter === entry.name) {
      onSelectConditionFilter(null);
    } else {
      onSelectConditionFilter(entry.name);
    }
  };

  return (
    <Card className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Equipment Health Overview
            </CardTitle>
            <CardDescription className="text-xs">
              Latest condition of all {total} unique machines (irrespective of date)
            </CardDescription>
          </div>
          {selectedConditionFilter && onSelectConditionFilter && (
            <button
              onClick={() => onSelectConditionFilter(null)}
              className="text-xs text-primary hover:underline font-medium"
            >
              Reset Filter
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {/* Pie graphic container with centered metric */}
        <div className="relative h-[230px] w-full">
          {total === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No equipment data available
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={handleSliceClick}
                    cursor="pointer"
                    animationDuration={800}
                  >
                    {pieData.map((entry) => {
                      const isSelected = selectedConditionFilter === entry.name;
                      return (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={entry.color}
                          stroke={isSelected ? 'hsl(var(--foreground))' : 'transparent'}
                          strokeWidth={isSelected ? 2 : 0}
                          opacity={selectedConditionFilter && !isSelected ? 0.4 : 1}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total Count */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight block">
                  {total}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Machines
                </span>
              </div>
            </>
          )}
        </div>

        {/* Breakdown Badges / Legend */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40">
          {/* Normal */}
          <button
            onClick={() => onSelectConditionFilter && onSelectConditionFilter(selectedConditionFilter === 'Normal' ? null : 'Normal')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              selectedConditionFilter === 'Normal'
                ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                : 'border-border/60 hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Normal</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-foreground">{normal}</span>
              <span className="text-[10px] text-muted-foreground">
                {total ? Math.round((normal / total) * 100) : 0}%
              </span>
            </div>
          </button>

          {/* Alert */}
          <button
            onClick={() => onSelectConditionFilter && onSelectConditionFilter(selectedConditionFilter === 'Alert' ? null : 'Alert')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              selectedConditionFilter === 'Alert'
                ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                : 'border-border/60 hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Alert</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-foreground">{alert}</span>
              <span className="text-[10px] text-muted-foreground">
                {total ? Math.round((alert / total) * 100) : 0}%
              </span>
            </div>
          </button>

          {/* Alarm */}
          <button
            onClick={() => onSelectConditionFilter && onSelectConditionFilter(selectedConditionFilter === 'Alarm' ? null : 'Alarm')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              selectedConditionFilter === 'Alarm'
                ? 'border-destructive bg-destructive/10 ring-1 ring-destructive'
                : 'border-border/60 hover:bg-muted/40'
            }`}
          >
            <div className="flex items-center gap-1.5 text-destructive text-xs font-semibold">
              <AlertOctagon className="h-3.5 w-3.5" />
              <span>Alarm</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-foreground">{alarm}</span>
              <span className="text-[10px] text-muted-foreground">
                {total ? Math.round((alarm / total) * 100) : 0}%
              </span>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
