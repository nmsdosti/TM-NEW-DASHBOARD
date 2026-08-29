import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VibrationData } from '@/types/vibration';
import { getConditionTheme, normalizeCondition, getRecordPeakValues } from '@/lib/vibrationUtils';
import { Separator } from '@/components/ui/separator';
import { VibrationChart } from './VibrationChart';
import { Activity, Gauge, CheckCircle2, AlertTriangle, AlertOctagon, Calendar } from 'lucide-react';

interface EquipmentDetailDialogProps {
  equipmentData: VibrationData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EquipmentDetailDialog = ({
  equipmentData,
  open,
  onOpenChange,
}: EquipmentDetailDialogProps) => {
  if (!equipmentData || equipmentData.length === 0) return null;

  // Latest data is the most recent entry
  const latestEquipment = equipmentData.reduce((latest, current) =>
    new Date(current.date) > new Date(latest.date) ? current : latest
  );

  const normCond = normalizeCondition(latestEquipment.condition);
  const theme = getConditionTheme(normCond);
  const peaks = getRecordPeakValues(latestEquipment);
  const isAlarm = normCond === 'Alarm';
  const isAlert = normCond === 'Alert';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 text-slate-900 shadow-xl">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900">
                {latestEquipment.equipmentName}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-slate-500">
                {latestEquipment.area} • Class {latestEquipment.class} • {latestEquipment.driven || 'Machinery'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={theme.badgeVariant as any} className="font-bold text-xs uppercase px-2.5 py-1">
                {latestEquipment.condition}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4 text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Latest Inspection
              </span>
              <span className="text-sm font-bold text-slate-900">{latestEquipment.date}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Peak Velocity
              </span>
              <span className={`text-sm font-black ${peaks.peakVelocity > 4.5 ? 'text-red-600' : peaks.peakVelocity > 2.8 ? 'text-amber-600' : 'text-slate-900'}`}>
                {peaks.peakVelocity.toFixed(2)} mm/s RMS
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Peak Acceleration
              </span>
              <span className={`text-sm font-black ${peaks.peakAcceleration > 10.0 ? 'text-red-600' : peaks.peakAcceleration > 4.5 ? 'text-amber-600' : 'text-slate-900'}`}>
                {peaks.peakAcceleration.toFixed(2)} g-pk
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Historical Surveys
              </span>
              <span className="text-sm font-bold text-blue-600">{equipmentData.length} Survey Points</span>
            </div>
          </div>

          {/* Observations & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestEquipment.observation && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Activity className="h-3.5 w-3.5 text-amber-500" />
                  Diagnostic Observation
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {latestEquipment.observation}
                </p>
              </div>
            )}

            {latestEquipment.recommendation && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <h4 className="font-bold text-blue-800 flex items-center gap-1.5 text-xs">
                  <Gauge className="h-3.5 w-3.5 text-blue-600" />
                  Engineering Recommendation
                </h4>
                <p className="text-xs text-blue-900 leading-relaxed font-medium">
                  {latestEquipment.recommendation}
                </p>
              </div>
            )}
          </div>

          {/* Vibration Trend Chart */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">Historical Vibration Trends (mm/s RMS)</h3>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <VibrationChart data={equipmentData} equipmentName={latestEquipment.equipmentName} />
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* 4 Points Detailed Matrix */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-3">
              Point-by-Point Vibration Matrix (Latest Survey)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {([
                { key: 'point01', title: 'Point 01: Motor NDE' },
                { key: 'point02', title: 'Point 02: Motor DE' },
                { key: 'point03', title: `Point 03: ${latestEquipment.driven || 'Driven'} DE` },
                { key: 'point04', title: `Point 04: ${latestEquipment.driven || 'Driven'} NDE` },
              ] as const).map(({ key, title }) => {
                const m = latestEquipment.measurements[key as keyof typeof latestEquipment.measurements];
                return (
                  <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
                    <h4 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1.5">{title}</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Axial (AV):</span>
                        <span className="font-bold text-slate-800">{m?.av?.toFixed(2) ?? '0.00'} mm/s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Horizontal (HV):</span>
                        <span className="font-bold text-slate-800">{m?.hv?.toFixed(2) ?? '0.00'} mm/s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Vertical (VV):</span>
                        <span className="font-bold text-slate-800">{m?.vv?.toFixed(2) ?? '0.00'} mm/s</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                        <span className="text-amber-700 font-semibold">Envelop (HVg):</span>
                        <span className="font-black text-amber-700">{m?.hvg?.toFixed(2) ?? '0.00'} g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Data Table */}
          {equipmentData.length > 1 && (
            <>
              <Separator className="bg-slate-200" />
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900">
                  Previous Survey Logs ({equipmentData.length - 1} entries)
                </h3>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100 text-slate-700">
                          <th className="p-2.5 text-left font-bold">Date</th>
                          <th className="p-2.5 text-left font-bold">Condition</th>
                          <th className="p-2.5 text-left font-bold">Observation</th>
                          <th className="p-2.5 text-left font-bold">Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {equipmentData
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(1)
                          .map((record, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2.5 font-medium whitespace-nowrap text-slate-800">{record.date}</td>
                              <td className="p-2.5">
                                <Badge variant={getConditionTheme(record.condition).badgeVariant as any} className="text-[10px]">
                                  {record.condition}
                                </Badge>
                              </td>
                              <td className="p-2.5 text-slate-600">{record.observation || 'N/A'}</td>
                              <td className="p-2.5 text-slate-600">{record.recommendation || 'N/A'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
