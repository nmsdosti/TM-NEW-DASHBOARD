import React from 'react';
import { TMLogoEmblem } from '@/components/dashboard/TMIndustrialLogo';
import { useContactInfo } from '@/lib/contactStore';
import {
  ShieldCheck,
  Activity,
  Award,
  Building2,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Cpu,
  Zap,
} from 'lucide-react';

interface ReportCoverPageProps {
  clientName: string;
  reportDate: string;
  surveyPeriod: string;
  totalEquipment: number;
  normalCount: number;
  alertCount: number;
  alarmCount: number;
  reportId?: string;
  preparedBy?: string;
  reviewedBy?: string;
  pageNumber?: number;
  totalPages?: number;
}

export const ReportCoverPage: React.FC<ReportCoverPageProps> = ({
  clientName,
  reportDate,
  surveyPeriod,
  totalEquipment,
  normalCount,
  alertCount,
  alarmCount,
  reportId = 'TMIS/VIB/2026-08/R01',
  preparedBy = 'Lead Vibration Analyst (ISO 18436 Cat-III)',
  reviewedBy = 'Chief Reliability Engineer',
  pageNumber = 1,
  totalPages,
}) => {
  const { contactInfo } = useContactInfo();
  const healthIndex = totalEquipment > 0 ? Math.round((normalCount / totalEquipment) * 100) : 100;

  return (
    <div className="report-page-container bg-white text-slate-900 min-h-[268mm] p-8 flex flex-col justify-between border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Decorative top accent banner */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700" />

      {/* Top Header with TM Industrial Solution Branding */}
      <div>
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 pt-2">
          <div className="flex items-center gap-3.5">
            {/* Official TM Monogram Brand Emblem */}
            <TMLogoEmblem className="h-14 w-14 shadow-sm border border-red-800" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  TM INDUSTRIAL SOLUTION
                </h1>
                <span className="bg-red-100 text-red-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide">
                  ISO Certified
                </span>
              </div>
              <p className="text-xs font-semibold text-red-700 tracking-wider uppercase mt-0.5">
                Vibration Diagnostics • Laser Alignment • Predictive Maintenance & Reliability Engineering
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Certified ASNT Level II / ISO 18436 Category II & III Condition Monitoring Services
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded border border-slate-200 text-xs font-bold text-slate-800">
              <FileCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>REPORT ID: {reportId}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              Confidential Engineering Audit Document
            </p>
          </div>
        </div>

        {/* Main Title Section */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-7 rounded-xl shadow-md border border-blue-900 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
            <Activity className="w-64 h-64 text-white stroke-1" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Comprehensive Technical Assessment
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Machinery Vibration Diagnostic & Condition Monitoring Assessment Report
            </h2>
            <p className="text-sm text-slate-300 mt-2 font-normal leading-relaxed">
              Periodic baseline vibration survey, dynamic spectrum analysis, bearing envelope evaluation, and predictive reliability recommendations.
            </p>
          </div>
        </div>

        {/* Client & Audit Information Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {/* Client Details Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              Client & Facility Information
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-200/60">
                  <td className="py-1.5 text-slate-500 font-medium w-28">Client / Customer:</td>
                  <td className="py-1.5 font-bold text-slate-900 text-sm">{clientName}</td>
                </tr>
                <tr className="border-b border-slate-200/60">
                  <td className="py-1.5 text-slate-500 font-medium">Facility / Division:</td>
                  <td className="py-1.5 font-semibold text-slate-800">Power Plant & Utility Machinery</td>
                </tr>
                <tr className="border-b border-slate-200/60">
                  <td className="py-1.5 text-slate-500 font-medium">Audit Cycle:</td>
                  <td className="py-1.5 font-semibold text-blue-700">{surveyPeriod}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-500 font-medium">Report Issue Date:</td>
                  <td className="py-1.5 font-semibold text-slate-800">{reportDate}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Audit Scope & Standards Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-blue-600" />
              Audit Framework & Standards
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-slate-200/60">
                  <td className="py-1.5 text-slate-500 font-medium w-32">Primary Standard:</td>
                  <td className="py-1.5 font-bold text-slate-900">ISO 10816-3 (Class II & III)</td>
                </tr>
                <tr className="border-b border-slate-200/60">
                  <td className="py-1.5 text-slate-500 font-medium">Measurement Domain:</td>
                  <td className="py-1.5 font-semibold text-slate-800">Velocity RMS (10Hz-1kHz) & g-pk</td>
                </tr>
                <tr className="border-b border-slate-200/60">
                  <td className="py-1.5 text-slate-500 font-medium">Analyst Credential:</td>
                  <td className="py-1.5 font-semibold text-slate-800">ISO 18436 Category II / III</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-500 font-medium">Calibration Status:</td>
                  <td className="py-1.5 font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Valid NIST / NABL Traceable
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Executive Asset Condition Breakdown */}
        <div className="mt-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            Asset Health Distribution & Compliance Index ({totalEquipment} Total Monitored Machines)
          </div>

          <div className="grid grid-cols-4 gap-3">
            {/* Total */}
            <div className="p-3.5 rounded-lg border border-slate-300 bg-white">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Machinery</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{totalEquipment}</div>
              <span className="text-[10px] text-slate-500 font-medium">100% Unique Assets</span>
            </div>

            {/* Normal */}
            <div className="p-3.5 rounded-lg border border-emerald-300 bg-emerald-50/50">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block flex items-center justify-between">
                <span>Normal Condition</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">{normalCount}</div>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {totalEquipment > 0 ? Math.round((normalCount / totalEquipment) * 100) : 0}% Satisfactory
              </span>
            </div>

            {/* Alert */}
            <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50/50">
              <span className="text-[10px] uppercase font-bold text-amber-800 block flex items-center justify-between">
                <span>Alert (Watchlist)</span>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              </span>
              <div className="text-2xl font-black text-amber-700 mt-0.5">{alertCount}</div>
              <span className="text-[10px] text-amber-700 font-semibold">
                Maintenance Advisory
              </span>
            </div>

            {/* Alarm */}
            <div className="p-3.5 rounded-lg border border-red-300 bg-red-50/50">
              <span className="text-[10px] uppercase font-bold text-red-800 block flex items-center justify-between">
                <span>Alarm (Critical)</span>
                <AlertOctagon className="h-3.5 w-3.5 text-red-600" />
              </span>
              <div className="text-2xl font-black text-red-700 mt-0.5">{alarmCount}</div>
              <span className="text-[10px] text-red-700 font-bold">
                Immediate Action Req.
              </span>
            </div>
          </div>
        </div>

        {/* Standard Severity Guide Matrix */}
        <div className="mt-5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
            ISO 10816-3 Evaluation Criteria (Class II Machinery: 15 kW - 300 kW Medium Machines)
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-emerald-100/70 border border-emerald-300 text-emerald-900">
              <div className="font-extrabold text-[11px]">Zone A & B: Normal</div>
              <div className="text-[10px] font-semibold mt-0.5">&le; 2.80 mm/s RMS</div>
              <div className="text-[9px] text-emerald-700">Unrestricted Operation</div>
            </div>
            <div className="p-2 rounded bg-amber-100/70 border border-amber-300 text-amber-900">
              <div className="font-extrabold text-[11px]">Zone C: Alert</div>
              <div className="text-[10px] font-semibold mt-0.5">2.81 - 4.50 mm/s RMS</div>
              <div className="text-[9px] text-amber-700">Plan Remedial Action</div>
            </div>
            <div className="p-2 rounded bg-red-100/70 border border-red-300 text-red-900">
              <div className="font-extrabold text-[11px]">Zone D: Alarm</div>
              <div className="text-[10px] font-semibold mt-0.5">&gt; 4.50 mm/s RMS</div>
              <div className="text-[9px] text-red-700">Immediate Shutdown/Repair</div>
            </div>
            <div className="p-2 rounded bg-purple-100/70 border border-purple-300 text-purple-900">
              <div className="font-extrabold text-[11px]">Bearing Accel (g)</div>
              <div className="text-[10px] font-semibold mt-0.5">&gt; 5.0 g-pk Threshold</div>
              <div className="text-[9px] text-purple-700">Bearing Defect / Lube</div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature & Authorization Footer Block */}
      <div className="mt-8 pt-4 border-t border-slate-300">
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Report Prepared By:</span>
            <p className="font-bold text-slate-900 mt-1">{preparedBy}</p>
            <p className="text-[11px] text-slate-600">{contactInfo.companyName} • Diagnostic Engineering</p>
            <p className="text-[10px] text-slate-500 font-medium">Email: {contactInfo.email} • Phone: +91 {contactInfo.phone}</p>
            <div className="mt-3 border-b border-dashed border-slate-400 w-44"></div>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Authorized Signature & Stamp</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Report Verified & Accepted By:</span>
            <p className="font-bold text-slate-900 mt-1">{reviewedBy}</p>
            <p className="text-[11px] text-slate-600">{clientName} • Plant Engineering Department</p>
            <p className="text-[10px] text-slate-500 font-medium">Website: {contactInfo.website}</p>
            <div className="mt-3 border-b border-dashed border-slate-400 w-44 ml-auto"></div>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Client Maintenance Head Signature</span>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>{contactInfo.companyName} • {contactInfo.website} • {contactInfo.phone}</span>
          <span>
            Page {pageNumber} {totalPages ? `of ${totalPages}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
