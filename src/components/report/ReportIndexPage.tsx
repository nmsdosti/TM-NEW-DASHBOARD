import React from 'react';
import { VibrationData } from '@/types/vibration';
import { getRecordPeakValues, normalizeCondition } from '@/lib/vibrationUtils';
import { TMLogoEmblem } from '@/components/dashboard/TMIndustrialLogo';
import { BookOpen, Layers, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface ReportIndexPageProps {
  equipmentList: VibrationData[];
  clientName: string;
  reportDate: string;
  startEquipmentPageNumber?: number; // usually Page 3
  pageNumber?: number;
  totalPages?: number;
}

export const ReportIndexPage: React.FC<ReportIndexPageProps> = ({
  equipmentList,
  clientName,
  reportDate,
  startEquipmentPageNumber = 3,
  pageNumber = 2,
  totalPages,
}) => {
  let normalCount = 0;
  let alertCount = 0;
  let alarmCount = 0;

  equipmentList.forEach((eq) => {
    const cond = normalizeCondition(eq.condition);
    if (cond === 'Alarm') alarmCount++;
    else if (cond === 'Alert') alertCount++;
    else normalCount++;
  });

  return (
    <div className="report-page-container bg-white text-slate-900 min-h-[268mm] p-8 flex flex-col justify-between border border-slate-200 shadow-sm relative">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div className="flex items-center gap-2.5">
            <TMLogoEmblem className="h-9 w-9 shadow-xs" />
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 uppercase">
                TM INDUSTRIAL SOLUTION
              </span>
              <span className="text-xs font-semibold text-red-700 block">
                Condition Monitoring & Reliability Engineering
              </span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-500 font-medium">Client: </span>
            <strong className="text-slate-900">{clientName}</strong>
            <div className="text-[11px] text-slate-500">Date: {reportDate}</div>
          </div>
        </div>

        {/* Section Heading & Legend */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                Table of Contents & Machinery Condition Register
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Index of all monitored assets with current operational condition and corresponding dedicated diagnostic page.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="h-3 w-3" /> Normal: {normalCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold flex items-center gap-1 text-[11px]">
              <AlertTriangle className="h-3 w-3" /> Alert: {alertCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold flex items-center gap-1 text-[11px]">
              <AlertOctagon className="h-3 w-3" /> Alarm: {alarmCount}
            </span>
          </div>
        </div>

        {/* Table of Contents Equipment Table */}
        <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Equipment / Machine Name</th>
                <th className="py-2.5 px-3">Plant Area</th>
                <th className="py-2.5 px-3">Driven Machine</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Peak Vel (mm/s)</th>
                <th className="py-2.5 px-3 text-right">Peak Accel (g)</th>
                <th className="py-2.5 px-3 text-center w-24">Report Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {equipmentList.map((eq, index) => {
                const peaks = getRecordPeakValues(eq);
                const status = normalizeCondition(eq.condition);
                const assignedPage = startEquipmentPageNumber + index;

                return (
                  <tr
                    key={eq.equipmentName}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  >
                    <td className="py-2 px-3 text-center font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {eq.equipmentName}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-medium">{eq.area}</td>
                    <td className="py-2 px-3 text-slate-600">{eq.driven || 'Machine'}</td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                      {eq.class || 'Class II'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${
                          status === 'Alarm'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : status === 'Alert'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono font-bold ${
                        peaks.peakVelocity >= 4.5
                          ? 'text-red-700'
                          : peaks.peakVelocity >= 2.8
                          ? 'text-amber-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {peaks.peakVelocity.toFixed(2)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono font-bold ${
                        peaks.peakAcceleration >= 5.0 ? 'text-red-700' : 'text-slate-800'
                      }`}
                    >
                      {peaks.peakAcceleration.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-extrabold border border-blue-200">
                        Page {assignedPage}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Index Summary Note */}
        <div className="mt-4 p-3 bg-blue-50/60 rounded border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
          <Layers className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <strong>Navigation & Diagnostic Notes:</strong> Each machine is allocated a dedicated full-page diagnostic profile starting on Page {startEquipmentPageNumber}, complete with 6-survey historical trends, 4-point vibration matrices, detailed diagnostic observations, and corrective engineering recommendations.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
        <span>TM Industrial Solution • Asset Register & Table of Contents</span>
        <span>
          Page {pageNumber} {totalPages ? `of ${totalPages}` : ''}
        </span>
      </div>
    </div>
  );
};
