import React from 'react';
import { VibrationData } from '@/types/vibration';
import { getRecordPeakValues, normalizeCondition } from '@/lib/vibrationUtils';
import { EquipmentTrendSvgChart } from './EquipmentTrendSvgChart';
import { TMLogoEmblem } from '@/components/dashboard/TMIndustrialLogo';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Wrench,
  FileSearch,
  Calendar,
  Building2,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

interface ReportEquipmentPageProps {
  currentRecord: VibrationData;
  historyRecords: VibrationData[];
  clientName: string;
  reportDate: string;
  pageNumber: number;
  totalPages?: number;
}

export const ReportEquipmentPage: React.FC<ReportEquipmentPageProps> = ({
  currentRecord,
  historyRecords,
  clientName,
  reportDate,
  pageNumber,
  totalPages,
}) => {
  const peaks = getRecordPeakValues(currentRecord);
  const condition = normalizeCondition(currentRecord.condition);
  const m = currentRecord.measurements;

  const isAlarm = condition === 'Alarm';
  const isAlert = condition === 'Alert';

  const getSeverityBadge = () => {
    if (isAlarm) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-300 text-red-800 rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
          <AlertOctagon className="h-4 w-4 text-red-600" />
          <span>ALARM • ISO ZONE D</span>
        </div>
      );
    }
    if (isAlert) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>ALERT • ISO ZONE C</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        <span>NORMAL • ISO ZONE A/B</span>
      </div>
    );
  };

  // Helper for measurement cell highlighting
  const formatVelCell = (val: number = 0) => {
    let colorClass = 'text-slate-700';
    if (val >= 4.5) colorClass = 'text-red-700 font-black bg-red-50';
    else if (val >= 2.8) colorClass = 'text-amber-700 font-bold bg-amber-50';
    return (
      <td className={`py-1.5 px-2.5 text-center font-mono text-xs ${colorClass}`}>
        {val.toFixed(2)}
      </td>
    );
  };

  const formatAccelCell = (val: number = 0) => {
    let colorClass = 'text-slate-700';
    if (val >= 5.0) colorClass = 'text-purple-700 font-black bg-purple-50';
    return (
      <td className={`py-1.5 px-2.5 text-center font-mono text-xs ${colorClass}`}>
        {val.toFixed(2)}
      </td>
    );
  };

  const pointsData = [
    {
      id: '01',
      name: 'Motor Non-Drive End (NDE)',
      pt: m?.point01,
    },
    {
      id: '02',
      name: 'Motor Drive End (DE)',
      pt: m?.point02,
    },
    {
      id: '03',
      name: `${currentRecord.driven || 'Driven'} Drive End (DE)`,
      pt: m?.point03,
    },
    {
      id: '04',
      name: `${currentRecord.driven || 'Driven'} Non-Drive End (NDE)`,
      pt: m?.point04,
    },
  ];

  return (
    <div className="report-page-container bg-white text-slate-900 min-h-[268mm] p-7 flex flex-col justify-between border border-slate-200 shadow-sm relative">
      {/* Top Header Bar */}
      <div>
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5">
          <div className="flex items-center gap-2">
            <TMLogoEmblem className="h-8 w-8 shadow-xs" />
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
                TM INDUSTRIAL SOLUTION
              </span>
              <span className="text-[10px] text-red-700 font-bold block">
                Equipment Diagnostic Assessment Sheet
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Customer / Site</span>
              <span className="font-bold text-slate-900">{clientName}</span>
            </div>
            <div className="text-right pl-4 border-l border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Standard Applied</span>
              <span className="font-bold text-slate-800">ISO 10816-3</span>
            </div>
          </div>
        </div>

        {/* Equipment Title Banner */}
        <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-extrabold">
                TAG #{currentRecord.srNo || pageNumber}
              </span>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                {currentRecord.equipmentName}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Plant Location: <strong className="text-slate-900">{currentRecord.area}</strong> • Driven Unit: <strong className="text-slate-900">{currentRecord.driven || 'Machinery'}</strong>
            </p>
          </div>

          {getSeverityBadge()}
        </div>

        {/* Equipment Specification & Operational Metrics */}
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Machine Class</span>
            <div className="font-bold text-slate-900 mt-0.5 text-xs">
              {currentRecord.class || 'Class II (15-300 kW)'}
            </div>
            <span className="text-[9px] text-slate-500">Rigid / Flexible</span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Last Survey Date</span>
            <div className="font-bold text-slate-900 mt-0.5 text-xs">{currentRecord.date}</div>
            <span className="text-[9px] text-slate-500">Latest Assessment</span>
          </div>

          <div
            className={`p-2.5 rounded border ${
              peaks.peakVelocity >= 4.5
                ? 'bg-red-50/70 border-red-200'
                : peaks.peakVelocity >= 2.8
                ? 'bg-amber-50/70 border-amber-200'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-slate-600 block">
              Peak Velocity (RMS)
            </span>
            <div
              className={`font-black mt-0.5 text-sm font-mono ${
                peaks.peakVelocity >= 4.5
                  ? 'text-red-700'
                  : peaks.peakVelocity >= 2.8
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}
            >
              {peaks.peakVelocity.toFixed(2)} mm/s
            </div>
            <span className="text-[9px] text-slate-500">Point {peaks.peakVelocityPoint}</span>
          </div>

          <div
            className={`p-2.5 rounded border ${
              peaks.peakAcceleration >= 5.0
                ? 'bg-purple-50/70 border-purple-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-slate-600 block">
              Peak Accel (g-pk)
            </span>
            <div
              className={`font-black mt-0.5 text-sm font-mono ${
                peaks.peakAcceleration >= 5.0 ? 'text-purple-700' : 'text-slate-900'
              }`}
            >
              {peaks.peakAcceleration.toFixed(2)} g
            </div>
            <span className="text-[9px] text-slate-500">Point {peaks.peakAccelerationPoint}</span>
          </div>
        </div>

        {/* 6-Survey Trend Graph Section */}
        <div className="mt-3">
          <EquipmentTrendSvgChart
            historyRecords={historyRecords}
            equipmentName={currentRecord.equipmentName}
            drivenLabel={currentRecord.driven}
            height={160}
          />
        </div>

        {/* Complete 4-Point Vibration Measurement Table */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-blue-600" />
              Complete 4-Point Vibration Data Matrix
            </span>
            <span className="text-[10px] text-slate-500">
              Units: Velocity in <strong>mm/s RMS</strong> | Envelop Accel in <strong>g-pk</strong>
            </span>
          </div>

          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                  <th className="py-1.5 px-2 text-center w-12">Point</th>
                  <th className="py-1.5 px-3 text-left">Measurement Location</th>
                  <th className="py-1.5 px-2.5 text-center">Axial (AV)</th>
                  <th className="py-1.5 px-2.5 text-center">Horizontal (HV)</th>
                  <th className="py-1.5 px-2.5 text-center">Vertical (VV)</th>
                  <th className="py-1.5 px-2.5 text-center">Accel (HV-g)</th>
                  <th className="py-1.5 px-2.5 text-center">Peak (mm/s)</th>
                  <th className="py-1.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pointsData.map((p, idx) => {
                  const av = p.pt?.av || 0;
                  const hv = p.pt?.hv || 0;
                  const vv = p.pt?.vv || 0;
                  const hvg = p.pt?.hvg || 0;
                  const ptMax = Math.max(av, hv, vv);

                  const ptAlarm = ptMax >= 4.5 || hvg >= 5.0;
                  const ptAlert = ptMax >= 2.8;

                  return (
                    <tr
                      key={p.id}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    >
                      <td className="py-1.5 px-2 text-center font-bold font-mono text-slate-600 text-[11px]">
                        P{p.id}
                      </td>
                      <td className="py-1.5 px-3 font-semibold text-slate-800 text-[11px]">
                        {p.name}
                      </td>
                      {formatVelCell(av)}
                      {formatVelCell(hv)}
                      {formatVelCell(vv)}
                      {formatAccelCell(hvg)}
                      <td
                        className={`py-1.5 px-2.5 text-center font-mono font-bold text-xs ${
                          ptAlarm
                            ? 'text-red-700 bg-red-50/80'
                            : ptAlert
                            ? 'text-amber-700 bg-amber-50/80'
                            : 'text-slate-800'
                        }`}
                      >
                        {ptMax.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            ptAlarm
                              ? 'bg-red-100 text-red-800'
                              : ptAlert
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {ptAlarm ? 'Alarm' : ptAlert ? 'Alert' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic Observations & Engineering Recommendations */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          {/* Diagnostic Observations */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileSearch className="h-3.5 w-3.5 text-blue-600" />
                Diagnostic Findings & Observations
              </div>
              <p className="text-slate-800 leading-relaxed text-[11px] font-medium bg-white p-2.5 rounded border border-slate-200 min-h-[58px]">
                {currentRecord.observation ||
                  'Overall vibration velocity levels are within ISO 10816 normal operating baseline. No significant bearing fault frequencies detected.'}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Spectrum Analysis: Peak frequency dominant at 1X / Bearing Band</span>
              <span className="font-semibold text-slate-700">ISO 10816 Compliant</span>
            </div>
          </div>

          {/* Corrective Action Recommendations */}
          <div
            className={`p-3 rounded-lg border flex flex-col justify-between ${
              isAlarm
                ? 'bg-red-50/50 border-red-200'
                : isAlert
                ? 'bg-amber-50/50 border-amber-200'
                : 'bg-emerald-50/50 border-emerald-200'
            }`}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-blue-600" />
                  Corrective Engineering Recommendations
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    isAlarm
                      ? 'bg-red-200 text-red-900'
                      : isAlert
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {isAlarm ? 'Immediate' : isAlert ? 'Planned' : 'Routine'}
                </span>
              </div>
              <p className="text-slate-900 leading-relaxed text-[11px] font-semibold bg-white p-2.5 rounded border border-slate-200 min-h-[58px]">
                {currentRecord.recommendation ||
                  'Continue routine periodic vibration monitoring and verify regular grease replenishment as per OEM schedule.'}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
              <span>Action Priority: {isAlarm ? 'High Severity Action Required' : 'Standard Maintenance'}</span>
              <span className="font-bold text-slate-800">TMIS Technical Advisory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Page Sign-off Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>TM Industrial Solution • Predictive Maintenance & Diagnostic Division</span>
          <span>•</span>
          <span>ISO 10816-3 Certified Audit</span>
        </div>
        <div className="font-bold text-slate-700">
          Page {pageNumber} {totalPages ? `of ${totalPages}` : ''}
        </div>
      </div>
    </div>
  );
};
