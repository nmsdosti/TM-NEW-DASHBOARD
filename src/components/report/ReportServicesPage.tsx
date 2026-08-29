import React from 'react';
import { TMLogoEmblem } from '@/components/dashboard/TMIndustrialLogo';
import {
  Activity,
  Sliders,
  RotateCw,
  Flame,
  Waves,
  Droplets,
  ShieldCheck,
  GraduationCap,
  Phone,
  Mail,
  Globe,
  Award,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface ReportServicesPageProps {
  clientName: string;
  pageNumber: number;
  totalPages?: number;
}

export const ReportServicesPage: React.FC<ReportServicesPageProps> = ({
  clientName,
  pageNumber,
  totalPages,
}) => {
  const services = [
    {
      title: 'Vibration Analysis & Diagnostics',
      icon: Activity,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      badge: 'ISO 18436 Cat II/III',
      description:
        'Route-based periodic baseline surveys, FFT spectrum analysis, time-waveform demodulation, phase analysis, and resonance bump tests for early fault detection.',
      benefits: 'Prevents catastrophic breakdown • Identifies bearing & gear wear',
    },
    {
      title: 'Precision Laser Shaft Alignment',
      icon: Sliders,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: '0.01mm Precision',
      description:
        'Advanced dual-sensor laser alignment for coupled machines (motor-pumps, compressors, gearboxes) with thermal growth & soft foot compensation.',
      benefits: 'Reduces power consumption • Extends seal & bearing life 3x',
    },
    {
      title: 'Dynamic In-Situ Field Balancing',
      icon: RotateCw,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      badge: 'ISO 1940 Grade G2.5',
      description:
        'Single and multi-plane dynamic field balancing performed on-site at operating speed without machine dismantling for fans, blowers, impellers, and rollers.',
      benefits: 'Eliminates 1X unbalance vibration • Smooth plant operation',
    },
    {
      title: 'Infrared Thermography (IRT)',
      icon: Flame,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      badge: 'ASNT Level II Certified',
      description:
        'High-resolution radiometric thermal imaging of electrical HT/LT switchboards, busbars, transformers, cable joints, motor bearings, and refractory linings.',
      benefits: 'Detects loose connections • Eliminates fire hazard risks',
    },
    {
      title: 'Ultrasound Acoustic Inspection',
      icon: Waves,
      color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      badge: 'Energy Savings',
      description:
        'Airborne and structure-borne ultrasound testing for compressed air/gas leaks, steam trap functioning, and precision ultrasound-guided bearing greasing.',
      benefits: 'Cuts plant utility bills • Prevents bearing over/under lubrication',
    },
    {
      title: 'Oil & Lubricant Analysis',
      icon: Droplets,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      badge: 'Laboratory Grade',
      description:
        'Comprehensive lubricant testing including kinematic viscosity, moisture content, Total Acid/Base Number (TAN/TBN), ISO cleanliness, and microscopic ferrography.',
      benefits: 'Optimizes oil replacement cycles • Detects internal component wear',
    },
    {
      title: 'Machine Health Audits & RCFA',
      icon: ShieldCheck,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      badge: 'Total Plant Reliability',
      description:
        'Comprehensive plant asset condition audits, criticality assessment, Root Cause Failure Analysis (RCFA) for chronic bad actors, and RCM implementation.',
      benefits: 'Eliminates chronic repeat defects • Maximizes asset uptime & OEE',
    },
    {
      title: 'Reliability Consulting & Training',
      icon: GraduationCap,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      badge: 'Workforce Upskilling',
      description:
        'Customized on-site technical training for plant engineers and technicians in vibration analysis, dynamic balancing, alignment best practices, and lubrication management.',
      benefits: 'Empowers in-house maintenance teams with world-class skills',
    },
  ];

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
                Condition Monitoring & Reliability Engineering Services
              </span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
              Capability Portfolio
            </span>
          </div>
        </div>

        {/* Section Heading Banner */}
        <div className="mt-4 p-3.5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-lg border border-blue-900">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            Our Comprehensive Predictive Maintenance & Diagnostic Solutions
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            TM Industrial Solution delivers turnkey engineering services to help industrial facilities achieve zero unplanned downtime and peak operational reliability.
          </p>
        </div>

        {/* 8-Service Portfolio Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.title}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded border ${srv.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {srv.title}
                      </h3>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 whitespace-nowrap">
                      {srv.badge}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-600 leading-relaxed font-normal">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200/80 text-[9px] font-semibold text-blue-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>{srv.benefits}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why Choose TM Industrial Solution Banner */}
        <div className="mt-4 p-3 bg-blue-50/70 rounded-lg border border-blue-200 text-xs">
          <div className="text-[11px] font-bold text-blue-950 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
            Why Industry Leaders Trust TM Industrial Solution
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>ISO 18436 Certified Category II & III Analysts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>High-Precision NABL Traceable Instruments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>24/7 Emergency Breakdown Diagnostic Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Contact & Authorization Block */}
      <div className="mt-4 pt-3 border-t border-slate-300">
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="space-y-1 text-[11px] text-slate-600">
            <span className="text-[10px] uppercase font-bold text-slate-800 block">
              TM INDUSTRIAL SOLUTION • Head Office & Technical Center
            </span>
            <p className="flex items-center gap-1.5 text-slate-700">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              Specialized Vibration, Laser Alignment & Reliability Services
            </p>
            <p className="flex items-center gap-1.5 text-slate-700">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              Diagnostic Technical Helpline: +91 98250 XXXXX / +91 94260 XXXXX
            </p>
            <p className="flex items-center gap-1.5 text-slate-700">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Email: contact@tmindustrialsolution.com • diagnostics@tmis.in
            </p>
          </div>

          <div className="text-right flex flex-col justify-end items-end">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Official Seal & Authorization:
            </span>
            <div className="mt-3 border-b-2 border-slate-800 w-48 text-center pb-1">
              <span className="text-[10px] font-bold text-blue-900">TM INDUSTRIAL SOLUTION</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">
              Head - Reliability Engineering & Diagnostics
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>TM Industrial Solution • Predictive Maintenance Portfolio</span>
          <span>
            Page {pageNumber} {totalPages ? `of ${totalPages}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
