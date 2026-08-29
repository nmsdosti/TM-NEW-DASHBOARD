import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VibrationData } from '@/types/vibration';
import { calculateTopDefenders, getConditionTheme } from '@/lib/vibrationUtils';
import {
  ChevronRight,
  Activity,
  Zap,
  Flame,
  ShieldAlert,
} from 'lucide-react';

interface TopTenDefendersProps {
  data: VibrationData[];
  onSelectEquipment: (equipmentName: string) => void;
}

export const TopTenDefenders: React.FC<TopTenDefendersProps> = ({
  data,
  onSelectEquipment,
}) => {
  const top10 = calculateTopDefenders(data, 10);

  return (
    <Card className="border-slate-200 bg-white shadow-xs hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Top 10 Bad Actors / High Risk Equipment
                </CardTitle>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-red-600 text-white rounded-full">
                  Priority Focus
                </span>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Ranked by composite vibration severity score, bearing acceleration (g), and ISO defect severity
              </CardDescription>
            </div>
          </div>
          <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            Defect Index: <span className="font-bold text-slate-900">0 - 100</span> Scale
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {top10.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No machinery defects identified. All units operating within normal baseline.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {top10.map((item, index) => {
              const theme = getConditionTheme(item.condition);
              const rank = index + 1;
              const isTopThree = rank <= 3;

              return (
                <div
                  key={item.equipmentName}
                  className={`p-4 transition-colors hover:bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isTopThree ? 'bg-red-50/20' : ''
                  }`}
                >
                  {/* Left Column: Rank + Equipment Name + Area + Badges */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-black text-sm border ${
                        rank === 1
                          ? 'bg-red-600 text-white border-red-600 shadow-xs'
                          : rank === 2
                          ? 'bg-amber-500 text-white border-amber-500'
                          : rank === 3
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      #{rank}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onSelectEquipment(item.equipmentName)}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors text-left truncate"
                        >
                          {item.equipmentName}
                        </button>
                        <Badge
                          variant={theme.badgeVariant as any}
                          className="font-bold text-[11px] uppercase tracking-wide"
                        >
                          {item.condition}
                        </Badge>
                        <span className="text-xs text-slate-600 font-medium px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {item.area} • {item.driven}
                        </span>
                      </div>

                      {/* Observation & Defect chips */}
                      <p className="text-xs text-slate-600 line-clamp-1">
                        <span className="font-semibold text-slate-900">Finding: </span>
                        {item.latestObservation}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {item.defectCategories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            <Zap className="h-2.5 w-2.5 text-amber-500" />
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Vibration Readings & Severity Score */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 py-1 lg:py-0 border-y lg:border-y-0 border-slate-200 lg:px-4">
                    {/* Peak Velocity */}
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1 sm:justify-end">
                        <Activity className="h-3 w-3 text-blue-600" />
                        Peak Velocity
                      </div>
                      <div className="text-sm font-black text-slate-900">
                        <span className={item.peakVelocity > 4.5 ? 'text-red-600 font-black' : item.peakVelocity > 2.8 ? 'text-amber-600 font-bold' : ''}>
                          {item.peakVelocity.toFixed(2)} mm/s
                        </span>
                        <span className="text-[10px] font-normal text-slate-500 ml-1">
                          (P{item.peakVelocityPoint.slice(0, 2)})
                        </span>
                      </div>
                    </div>

                    {/* Peak Acceleration */}
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1 sm:justify-end">
                        <Flame className="h-3 w-3 text-amber-500" />
                        Acceleration
                      </div>
                      <div className="text-sm font-black text-slate-900">
                        <span className={item.peakAcceleration > 10.0 ? 'text-red-600 font-black' : item.peakAcceleration > 4.5 ? 'text-amber-600 font-bold' : ''}>
                          {item.peakAcceleration.toFixed(2)} g
                        </span>
                        <span className="text-[10px] font-normal text-slate-500 ml-1">
                          (P{item.peakAccelerationPoint.slice(0, 2)})
                        </span>
                      </div>
                    </div>

                    {/* Problem Severity Score Meter */}
                    <div className="min-w-[90px] text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-500">
                        Defect Index
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-base font-black ${
                          item.problemScore >= 70
                            ? 'text-red-600'
                            : item.problemScore >= 40
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        }`}>
                          {item.problemScore}/100
                        </span>
                      </div>
                      {/* Mini bar */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-0.5">
                        <div
                          className={`h-full rounded-full ${
                            item.problemScore >= 70
                              ? 'bg-red-600'
                              : item.problemScore >= 40
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${item.problemScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Diagnostics Action Button */}
                  <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
                    <Button
                      size="sm"
                      onClick={() => onSelectEquipment(item.equipmentName)}
                      className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Diagnostics
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
