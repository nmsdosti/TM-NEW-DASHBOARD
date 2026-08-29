import React, { useEffect, useState, useMemo } from 'react';
import { HeaderNav, NavTab } from '@/components/dashboard/HeaderNav';
import { UniqueConditionPieChart } from '@/components/dashboard/UniqueConditionPieChart';
import { MonthlyColumnChart } from '@/components/dashboard/MonthlyColumnChart';
import { TopTenDefenders } from '@/components/dashboard/TopTenDefenders';
import { EquipmentTable } from '@/components/dashboard/EquipmentTable';
import { EquipmentDetailDialog } from '@/components/dashboard/EquipmentDetailDialog';
import { IsoGuidelineCard } from '@/components/dashboard/IsoGuidelineCard';
import { ReportDownloadDialog } from '@/components/dashboard/ReportDownloadDialog';
import { ContactUsDialog } from '@/components/dashboard/ContactUsDialog';
import { TMLogoEmblem } from '@/components/dashboard/TMIndustrialLogo';
import { useContactInfo } from '@/lib/contactStore';
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
  Phone,
  Mail,
  Globe,
  MapPin,
  ExternalLink,
  PhoneCall,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  // Contact Info
  const { contactInfo } = useContactInfo();

  // State
  const [data, setData] = useState<VibrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedEquipmentName, setSelectedEquipmentName] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  // Filters
  const [conditionFilter, setConditionFilter] = useState<'Normal' | 'Alert' | 'Alarm' | null>(null);
  const [selectedSurveyMonth, setSelectedSurveyMonth] = useState<string | null>(null);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 pb-16 md:pb-6">
      {/* Top Header with TM Industrial Solution Branding, Live Auto-Sync, Contact Us, Report Download & Notifications Bell */}
      <HeaderNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        siteName={DEFAULT_SETTINGS.siteName}
        notifications={notifications}
        onSelectEquipment={handleSelectEquipmentByName}
        onOpenReport={() => setIsReportDialogOpen(true)}
        onOpenContact={() => setIsContactDialogOpen(true)}
        lastUpdatedTime={lastUpdated}
      />

      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1">
        {/* TAB 1: MAIN DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Top KPI Metric Cards (2x2 on Mobile, 4x1 on Desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {/* Total Monitored Assets */}
              <Card className="border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-xs">
                <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Total Assets
                    </span>
                    <div className="text-xl sm:text-3xl font-black text-slate-900 mt-0.5">
                      {uniqueStats.total}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                      <Layers className="h-3 w-3 text-blue-600 shrink-0" />
                      <span>Unique Units</span>
                    </span>
                  </div>
                  <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                    <Cpu className="h-5 w-5 sm:h-6 sm:w-6" />
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
                <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 shrink-0" />
                      <span>Normal</span>
                    </span>
                    <div className="text-xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                      {uniqueStats.normal}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                      {uniqueStats.total
                        ? Math.round((uniqueStats.normal / uniqueStats.total) * 100)
                        : 0}
                      % Health
                    </span>
                  </div>
                  <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
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
                <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 shrink-0" />
                      <span>Alert</span>
                    </span>
                    <div className="text-xl sm:text-3xl font-black text-amber-700 mt-0.5">
                      {uniqueStats.alert}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                      {uniqueStats.total
                        ? Math.round((uniqueStats.alert / uniqueStats.total) * 100)
                        : 0}
                      % Watch
                    </span>
                  </div>
                  <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
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
                <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                      <AlertOctagon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600 shrink-0" />
                      <span>Critical</span>
                    </span>
                    <div className="text-xl sm:text-3xl font-black text-red-700 mt-0.5">
                      {uniqueStats.alarm}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-red-600 font-bold">Action Needed</span>
                  </div>
                  <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                    <AlertOctagon className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TM Industrial Diagnostic Intelligence & Health Summary */}
            <Card className="border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/40 shadow-xs">
              <CardContent className="p-3.5 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-2.5 sm:gap-3.5">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="text-xs sm:text-base font-bold text-slate-900">
                          TM Industrial Solution Diagnostic Intelligence
                        </h3>
                        <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          ISO 10816-3 Audit
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                        Plant vibration health index is{' '}
                        <strong className="text-slate-900">
                          {uniqueStats.total
                            ? Math.round((uniqueStats.normal / uniqueStats.total) * 100)
                            : 0}
                          %
                        </strong>{' '}
                        normal baseline compliance across {uniqueStats.total} monitored units at{' '}
                        <strong>{DEFAULT_SETTINGS.siteName}</strong>. Focus is required on{' '}
                        <span className="font-bold text-red-700">{uniqueStats.alarm} Alarm</span> and{' '}
                        <span className="font-bold text-amber-700">{uniqueStats.alert} Alert</span> units.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="text-[10px] sm:text-[11px] font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          <span>Top Priority:</span>
                          <strong className="text-red-700 font-bold truncate max-w-[140px] sm:max-w-none">
                            {top10[0]?.equipmentName || 'Critical Pump'}
                          </strong>
                          <span className="hidden sm:inline">({top10[0]?.peakVelocity.toFixed(2) || '4.80'} mm/s)</span>
                        </div>

                        <button
                          onClick={() => setIsReportDialogOpen(true)}
                          className="text-[10px] sm:text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 ml-auto bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                        >
                          <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span>Audit Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* REQUIREMENT 1 & 2: CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
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
                <MonthlyColumnChart
                  data={data}
                  selectedMonth={selectedSurveyMonth}
                  onSelectMonth={(m) => setSelectedSurveyMonth(m)}
                />
              </div>
            </div>

            {/* REQUIREMENT 3: TOTAL 10 DEFENDER (Top 10 Bad Actors - simplified & compact) */}
            <TopTenDefenders
              data={data}
              onSelectEquipment={handleSelectEquipmentByName}
            />

            {/* REQUIREMENT 7: Equipment Vibration Matrix */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Equipment Vibration Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    {conditionFilter
                      ? `Filtered by ${conditionFilter} Condition`
                      : selectedSurveyMonth && selectedSurveyMonth !== 'latest' && selectedSurveyMonth !== 'all'
                      ? `Displaying ${selectedSurveyMonth} Survey Cycle`
                      : 'Machinery vibration severity, bearing acceleration & observations across all survey cycles'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {conditionFilter && (
                    <button
                      onClick={() => setConditionFilter(null)}
                      className="text-xs text-blue-600 font-bold hover:underline self-start sm:self-auto"
                    >
                      Clear Condition ({conditionFilter})
                    </button>
                  )}
                  {selectedSurveyMonth && selectedSurveyMonth !== 'latest' && (
                    <button
                      onClick={() => setSelectedSurveyMonth('latest')}
                      className="text-xs text-slate-600 font-semibold hover:underline self-start sm:self-auto"
                    >
                      Reset Survey (Latest)
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                <EquipmentTable
                  data={data}
                  externalConditionFilter={conditionFilter || undefined}
                  externalMonthFilter={selectedSurveyMonth}
                  onMonthChange={(m) => setSelectedSurveyMonth(m)}
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
        {/* Dedicated Corporate Contact Footer */}
        <footer className="mt-8 pt-6 pb-2 border-t border-slate-200 text-xs text-slate-600">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="flex items-center gap-3.5">
                <TMLogoEmblem className="h-12 w-12 shadow-xs border border-red-700/40 rounded-sm shrink-0" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight uppercase">
                      {contactInfo.companyName}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 rounded">
                      Reliability Engineering
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {contactInfo.tagline}
                  </p>
                </div>
              </div>

              {/* Quick Contact Links & Map Button */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{contactInfo.phone}</span>
                </a>

                <a
                  href={`mailto:${contactInfo.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  <span className="hidden sm:inline">{contactInfo.email}</span>
                  <span className="sm:hidden">Email</span>
                </a>

                <a
                  href={contactInfo.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors"
                >
                  <Globe className="h-3.5 w-3.5 text-purple-600" />
                  <span>{contactInfo.website}</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>

                <a
                  href={contactInfo.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-red-600" />
                  <span>Google Maps</span>
                  <ExternalLink className="h-3 w-3 text-red-500" />
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsContactDialogOpen(true)}
                  className="h-8 px-3 text-xs font-bold border-slate-300 bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <PhoneCall className="h-3.5 w-3.5 mr-1 text-red-400" />
                  <span>Contact Us</span>
                </Button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>© {new Date().getFullYear()} {contactInfo.companyName}. All Rights Reserved. ISO 18436 & ASNT Category Certified.</span>
              <span>Client Site: <strong>{DEFAULT_SETTINGS.siteName}</strong></span>
            </div>
          </div>
        </footer>
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

      {/* Contact Us & Details Update Modal */}
      <ContactUsDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
      />
    </div>
  );
};

export default Index;
