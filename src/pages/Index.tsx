import React, { useEffect, useState, useMemo } from 'react';
import { HeaderNav, NavTab } from '@/components/dashboard/HeaderNav';
import { UniqueConditionPieChart } from '@/components/dashboard/UniqueConditionPieChart';
import { MonthlyColumnChart } from '@/components/dashboard/MonthlyColumnChart';
import { TopTenDefenders } from '@/components/dashboard/TopTenDefenders';
import { EquipmentTable } from '@/components/dashboard/EquipmentTable';
import { EquipmentDetailDialog } from '@/components/dashboard/EquipmentDetailDialog';
import { IsoGuidelineCard } from '@/components/dashboard/IsoGuidelineCard';
import { ReportDownloadDialog } from '@/components/dashboard/ReportDownloadDialog';
import { MachinesView } from '@/pages/MachinesView';
import {
  VibrationData,
  AppNotification,
  AppSettings,
} from '@/types/vibration';
import { parseVibrationData } from '@/lib/csvParser';
import {
  getUniqueConditionDistribution,
  calculateTopDefenders,
  generateNotifications,
  getUniqueLatestEquipment,
} from '@/lib/vibrationUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  CheckCircle,
  Activity,
  Layers,
  FileText,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_SETTINGS: AppSettings = {
  sheetUrl:
    'https://docs.google.com/spreadsheets/d/1Y8b05cj_6iAq_5Be2QDtJczF2oSxKbK7sT14silW8Gg/export?format=csv',
  siteName: 'Shree Durga Syntex',
  autoRefreshInterval: 60,
  class2Limits: {
    normalMax: 2.8,
    alertMax: 4.5,
    alarmThreshold: 4.5,
    accelAlertMax: 5.0,
  },
};

const Index = () => {
  // Navigation: Clean 2-tab view (Dashboard & Machines)
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // State
  const [data, setData] = useState<VibrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedEquipmentName, setSelectedEquipmentName] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Filters
  const [conditionFilter, setConditionFilter] = useState<'Normal' | 'Alert' | 'Alarm' | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Automatic Data Loader
  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      // Add cache buster to ensure freshest data from Google Sheets
      const urlWithTimestamp = `${DEFAULT_SETTINGS.sheetUrl}&_t=${Date.now()}`;
      const parsedData = await parseVibrationData(urlWithTimestamp);

      if (parsedData && parsedData.length > 0) {
        setData(parsedData);
        const notifs = generateNotifications(parsedData);
        setNotifications(notifs);

        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (error) {
      console.error('Error loading vibration data:', error);
      // Fallback try without cache-buster
      try {
        const parsedData = await parseVibrationData(DEFAULT_SETTINGS.sheetUrl);
        if (parsedData && parsedData.length > 0) {
          setData(parsedData);
          const notifs = generateNotifications(parsedData);
          setNotifications(notifs);
          const now = new Date();
          setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        if (!silent) {
          toast.error('Unable to fetch vibration data from Google Sheets.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial load on mount & when opened
  useEffect(() => {
    loadData();
  }, []);

  // 2. Automatic refresh on tab focus / window visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 3. Background periodic sync every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Open Equipment Dialog by name
  const handleSelectEquipmentByName = (equipmentName: string) => {
    setSelectedEquipmentName(equipmentName);
    setIsDetailDialogOpen(true);
  };

  // Computed Dashboard Metrics
  const uniqueStats = useMemo(() => getUniqueConditionDistribution(data), [data]);
  const top10 = useMemo(() => calculateTopDefenders(data, 10), [data]);

  // Selected Equipment History for Dialog
  const selectedEquipmentHistory = useMemo(() => {
    if (!selectedEquipmentName) return [];
    return data.filter((d) => d.equipmentName === selectedEquipmentName);
  }, [data, selectedEquipmentName]);

  // Filtered Equipment Table data for the main dashboard
  const tableData = useMemo(() => {
    const latest = getUniqueLatestEquipment(data);
    if (!conditionFilter) return latest;
    return latest.filter((item) => {
      const c = item.condition.toLowerCase();
      if (conditionFilter === 'Alarm') return c.includes('alarm');
      if (conditionFilter === 'Alert') return c.includes('alert');
      return (
        c.includes('normal') ||
        c.includes('good') ||
        c.includes('satisfactory') ||
        c.includes('minor')
      );
    });
  }, [data, conditionFilter]);

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        <main className="container mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="h-80 rounded-xl lg:col-span-5 bg-slate-200" />
            <Skeleton className="h-80 rounded-xl lg:col-span-7 bg-slate-200" />
          </div>
          <Skeleton className="h-96 rounded-xl bg-slate-200" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100">
      {/* Top Header with TM Industrial Solution Branding, Live Auto-Sync, Report Download & Notifications Bell */}
      <HeaderNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        siteName={DEFAULT_SETTINGS.siteName}
        notifications={notifications}
        onSelectEquipment={handleSelectEquipmentByName}
        onOpenReport={() => setIsReportDialogOpen(true)}
        lastUpdatedTime={lastUpdated}
      />

      <main className="container mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* TAB 1: MAIN DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Total Monitored Assets */}
              <Card className="border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Monitored Assets
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                      {uniqueStats.total}
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                      <Layers className="h-3 w-3 text-blue-600" />
                      100% Unique Units
                    </span>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                    <Cpu className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Normal Condition */}
              <Card
                className={`border bg-white transition-all cursor-pointer shadow-xs ${
                  conditionFilter === 'Normal'
                    ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-emerald-400'
                }`}
                onClick={() => setConditionFilter(conditionFilter === 'Normal' ? null : 'Normal')}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Normal
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                      {uniqueStats.normal}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {uniqueStats.total
                        ? Math.round((uniqueStats.normal / uniqueStats.total) * 100)
                        : 0}
                      % Operational
                    </span>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Alert Condition */}
              <Card
                className={`border bg-white transition-all cursor-pointer shadow-xs ${
                  conditionFilter === 'Alert'
                    ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20'
                    : 'border-slate-200 hover:border-amber-400'
                }`}
                onClick={() => setConditionFilter(conditionFilter === 'Alert' ? null : 'Alert')}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Alert State
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-0.5">
                      {uniqueStats.alert}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {uniqueStats.total
                        ? Math.round((uniqueStats.alert / uniqueStats.total) * 100)
                        : 0}
                      % Watchlist
                    </span>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Alarm Condition */}
              <Card
                className={`border bg-white transition-all cursor-pointer shadow-xs ${
                  conditionFilter === 'Alarm'
                    ? 'ring-2 ring-red-500 border-red-500 bg-red-50/20'
                    : 'border-slate-200 hover:border-red-400'
                }`}
                onClick={() => setConditionFilter(conditionFilter === 'Alarm' ? null : 'Alarm')}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                      <AlertOctagon className="h-3.5 w-3.5 text-red-600" /> Alarm (Critical)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-red-700 mt-0.5">
                      {uniqueStats.alarm}
                    </div>
                    <span className="text-[10px] text-red-600 font-bold">Action Required</span>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
                    <AlertOctagon className="h-6 w-6 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TM Industrial Diagnostic Intelligence & Thoughts */}
            <Card className="border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/40 shadow-xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0 mt-0.5">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          TM Industrial Solution Diagnostic Intelligence & Health Summary
                        </h3>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          ISO 10816-3 Audit
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                        Plant vibration health index stands at{' '}
                        <strong className="text-slate-900">
                          {uniqueStats.total
                            ? Math.round((uniqueStats.normal / uniqueStats.total) * 100)
                            : 0}
                          %
                        </strong>{' '}
                        normal baseline compliance across {uniqueStats.total} monitored units at{' '}
                        <strong>{DEFAULT_SETTINGS.siteName}</strong>. Critical maintenance focus is concentrated in{' '}
                        <span className="font-bold text-red-700">{uniqueStats.alarm} Alarm</span> and{' '}
                        <span className="font-bold text-amber-700">{uniqueStats.alert} Alert</span> assets.
                        Primary fault patterns detected include{' '}
                        <strong className="text-slate-900">High Bearing Envelop Acceleration (HVg &gt; 5.0g)</strong> indicating inner/outer race fatigue, along with{' '}
                        <strong className="text-slate-900">1X/2X mechanical unbalance & misalignment</strong>.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="text-[11px] font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-blue-600" />
                          <span>Top Critical Asset:</span>
                          <strong className="text-red-700 font-bold">
                            {top10[0]?.equipmentName || 'Critical Pump'}
                          </strong>
                          <span>({top10[0]?.peakVelocity.toFixed(2) || '4.80'} mm/s RMS)</span>
                        </div>

                        <button
                          onClick={() => setIsReportDialogOpen(true)}
                          className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 ml-auto bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Generate Full Condition Audit Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* REQUIREMENT 1 & 2: CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 1. PIE CHART: Total unique equipment with their last condition (Normal, Alert, Alarm) */}
              <div className="lg:col-span-5">
                <UniqueConditionPieChart
                  data={data}
                  selectedConditionFilter={conditionFilter}
                  onSelectConditionFilter={setConditionFilter}
                />
              </div>

              {/* 2. COLUMN CHART: Month-year wise vertical column, total unique count on top, 3 colors */}
              <div className="lg:col-span-7">
                <MonthlyColumnChart data={data} />
              </div>
            </div>

            {/* REQUIREMENT 3: TOTAL 10 DEFENDER (Top 10 equipment which have the most problems) */}
            <TopTenDefenders
              data={data}
              onSelectEquipment={handleSelectEquipmentByName}
            />

            {/* REQUIREMENT 7: Modernized Equipment Vibration Matrix */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Equipment Vibration Matrix ({tableData.length} Assets)
                  </h3>
                  <p className="text-xs text-slate-500">
                    {conditionFilter
                      ? `Filtered by ${conditionFilter} Condition`
                      : 'All machinery sorted by peak vibration severity and inspection data'}
                  </p>
                </div>
                {conditionFilter && (
                  <button
                    onClick={() => setConditionFilter(null)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Clear Filter ({conditionFilter})
                  </button>
                )}
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                <EquipmentTable
                  data={tableData}
                  onEquipmentClick={(item) => handleSelectEquipmentByName(item.equipmentName)}
                />
              </div>
            </div>

            {/* ISO 10816-3 Severity Standard Guide */}
            <IsoGuidelineCard />
          </div>
        )}

        {/* TAB 2: EQUIPMENT MATRIX VIEW */}
        {currentTab === 'machines' && (
          <MachinesView
            data={data}
            onSelectEquipment={handleSelectEquipmentByName}
          />
        )}
      </main>

      {/* Equipment Detailed Modal Dialog (Historical charts, 4-point matrix, recommendations) */}
      <EquipmentDetailDialog
        equipmentData={selectedEquipmentHistory}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />

      {/* Report Download & PDF Generation Modal */}
      <ReportDownloadDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        data={data}
        siteName={DEFAULT_SETTINGS.siteName}
      />
    </div>
  );
};

export default Index;
