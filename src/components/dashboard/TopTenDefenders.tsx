import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VibrationData } from '@/types/vibration';
import { calculateTopDefenders, getConditionTheme } from '@/lib/vibrationUtils';
import {
  ChevronRight,
  ShieldAlert,
  Activity,
  Flame,
  Gauge,
  ArrowUpRight,
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
    <Card id="top-bad-actors" className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="py-3 px-4 sm:px-5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900">
                  Top 10 Bad Actors (High Risk Assets)
                </CardTitle>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                  Defect Ranked
                </span>
              </div>
              <CardDescription className="text-[11px] text-slate-500 line-clamp-1">
                Priority machinery requiring maintenance based on composite defect score & vibration peaks
              </CardDescription>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap hidden sm:block">
            Scale: <span className="font-bold text-slate-800">0 - 100 Index</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {top10.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No machinery defects identified. All units operating within normal baseline.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Equipment & Area</div>
              <div className="col-span-2 text-center">Condition</div>
              <div className="col-span-2 text-right">Defect Index</div>
              <div className="col-span-3 text-right pr-2">Peak Velocity / Accel</div>
            </div>

            {/* List items */}
            {top10.map((item, index) => {
              const theme = getConditionTheme(item.condition);
              const rank = index + 1;
              const isTopThree = rank <= 3;

              return (
                <div
                  key={item.equipmentName}
                  onClick={() => onSelectEquipment(item.equipmentName)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 transition-colors hover:bg-slate-50 cursor-pointer group ${
                    isTopThree ? 'bg-red-50/25' : ''
                  }`}
                >
                  {/* Desktop Single-Row Layout (Compact) */}
                  <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md font-bold text-xs ${
                          rank === 1
                            ? 'bg-red-600 text-white shadow-xs'
                            : rank === 2
                            ? 'bg-amber-500 text-white'
                            : rank === 3
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{rank}
                      </span>
                    </div>

                    {/* Equipment Name & Area */}
                    <div className="col-span-4 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {item.equipmentName}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 transition-all shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.area} {item.driven ? `• ${item.driven}` : ''}
                      </div>
                    </div>

                    {/* Condition Status */}
                    <div className="col-span-2 flex justify-center">
                      <Badge
                        variant={theme.badgeVariant as any}
                        className="text-[10px] font-bold uppercase tracking-wider py-0 px-2 h-5"
                      >
                        {item.condition}
                      </Badge>
                    </div>

                    {/* Equipment Defect Index */}
                    <div className="col-span-2 text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span
                          className={`text-sm font-black ${
                            item.problemScore >= 70
                              ? 'text-red-600'
                              : item.problemScore >= 40
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {item.problemScore}
                        </span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                      {/* Mini bar */}
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden ml-auto mt-0.5">
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

                    {/* Peak Velocity & Acceleration */}
                    <div className="col-span-3 text-right flex items-center justify-end gap-4 pr-1">
                      {/* Peak Velocity */}
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Velocity</div>
                        <span
                          className={`text-xs font-extrabold ${
                            item.peakVelocity > 4.5
                              ? 'text-red-600'
                              : item.peakVelocity > 2.8
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.peakVelocity.toFixed(2)}{' '}
                          <span className="text-[9px] font-normal text-slate-400">mm/s</span>
                        </span>
                      </div>

                      {/* Peak Acceleration */}
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Accel</div>
                        <span
                          className={`text-xs font-extrabold ${
                            item.peakAcceleration > 10.0
                              ? 'text-red-600 font-black'
                              : item.peakAcceleration > 4.5
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.peakAcceleration.toFixed(2)}{' '}
                          <span className="text-[9px] font-normal text-slate-400">g</span>
                        </span>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </div>
                  </div>

                  {/* Mobile Compact Card Layout */}
                  <div className="block md:hidden space-y-2">
                    {/* Top Row: Rank + Name + Condition */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold ${
                            rank === 1
                              ? 'bg-red-600 text-white'
                              : rank === 2
                              ? 'bg-amber-500 text-white'
                              : rank === 3
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          #{rank}
                        </span>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                          {item.equipmentName}
                        </span>
                      </div>
                      <Badge
                        variant={theme.badgeVariant as any}
                        className="text-[9px] font-bold uppercase py-0 px-1.5 h-4 shrink-0"
                      >
                        {item.condition}
                      </Badge>
                    </div>

                    {/* Bottom Row: 3 Clean Metric Badges */}
                    <div className="grid grid-cols-3 gap-1.5 text-center bg-slate-50 p-1.5 rounded-md border border-slate-100">
                      {/* Defect Index */}
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 font-semibold block">
                          Defect Index
                        </span>
                        <span
                          className={`text-xs font-black ${
                            item.problemScore >= 70
                              ? 'text-red-600'
                              : item.problemScore >= 40
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {item.problemScore}/100
                        </span>
                      </div>

                      {/* Peak Velocity */}
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 font-semibold block">
                          Peak Vel
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            item.peakVelocity > 4.5
                              ? 'text-red-600'
                              : item.peakVelocity > 2.8
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.peakVelocity.toFixed(2)} <span className="text-[8px] font-normal text-slate-400">mm/s</span>
                        </span>
                      </div>

                      {/* Accel */}
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 font-semibold block">
                          Accel
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            item.peakAcceleration > 10.0
                              ? 'text-red-600 font-black'
                              : item.peakAcceleration > 4.5
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.peakAcceleration.toFixed(2)} <span className="text-[8px] font-normal text-slate-400">g</span>
                        </span>
                      </div>
                    </div>
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

