import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VibrationData } from '@/types/vibration';
import {
  getUniqueConditionDistribution,
  getUniqueLatestEquipment,
  normalizeCondition,
} from '@/lib/vibrationUtils';
import { exportToFullCSV, exportDefectsCSV } from '@/lib/exportUtils';
import { downloadReportAsPdf, PdfGenerationProgress } from '@/lib/pdfDownloadUtils';
import { ReportCoverPage } from '../report/ReportCoverPage';
import { ReportIndexPage } from '../report/ReportIndexPage';
import { ReportEquipmentPage } from '../report/ReportEquipmentPage';
import { ReportServicesPage } from '../report/ReportServicesPage';
import {
  Download,
  FileText,
  Printer,
  Calendar,
  Building2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: VibrationData[];
  siteName?: string;
}

export const ReportDownloadDialog: React.FC<ReportDownloadDialogProps> = ({
  open,
  onOpenChange,
  data,
  siteName = 'Shree Durga Syntex',
}) => {
  // Configurable options for the report
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'defects'>('all');
  const [customClientName, setCustomClientName] = useState<string>(siteName);
  const [reportDate, setReportDate] = useState<string>(
    new Date().toLocaleDateString('en-US', { dateStyle: 'long' })
  );
  const [reportId, setReportId] = useState<string>(
    `TMIS/VIB/${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}/R01`
  );
  const [viewTab, setViewTab] = useState<'all' | 'cover' | 'index' | 'equipment' | 'services'>('all');

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<PdfGenerationProgress | null>(null);

  // Extract unique survey months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    data.forEach((item) => {
      if (!item.date) return;
      const date = new Date(item.date);
      if (!isNaN(date.getTime())) {
        const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(mKey);
      }
    });
    return Array.from(months).sort().reverse();
  }, [data]);

  // Group all historical records by equipment name for trend graphs
  const historyByEquipment = useMemo(() => {
    const map = new Map<string, VibrationData[]>();
    data.forEach((item) => {
      if (!item.equipmentName) return;
      const list = map.get(item.equipmentName) || [];
      list.push(item);
      map.set(item.equipmentName, list);
    });
    return map;
  }, [data]);

  // Filtered dataset according to selected survey month
  const scopedData = useMemo(() => {
    if (selectedMonth === 'all') return data;
    return data.filter((item) => {
      if (!item.date) return false;
      const date = new Date(item.date);
      if (isNaN(date.getTime())) return false;
      const itemMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return itemMonth === selectedMonth;
    });
  }, [data, selectedMonth]);

  // Unique latest equipment list
  const latestEquipment = useMemo(() => {
    const list = getUniqueLatestEquipment(scopedData);
    if (scopeFilter === 'defects') {
      return list.filter((item) => {
        const cond = normalizeCondition(item.condition);
        return cond === 'Alarm' || cond === 'Alert';
      });
    }
    return list;
  }, [scopedData, scopeFilter]);

  const uniqueStats = useMemo(() => {
    return getUniqueConditionDistribution(scopedData);
  }, [scopedData]);

  // Total pages calculation: 1 (Cover) + 1 (Index) + N (Equipment) + 1 (Services)
  const totalPages = 3 + latestEquipment.length;

  /**
   * Directly downloads the report as a high-fidelity PDF file
   * capturing the exact on-screen visual styling.
   */
  const handleDirectDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      // Ensure full report is rendered in DOM for capture
      const previousViewTab = viewTab;
      if (viewTab !== 'all') {
        setViewTab('all');
        // Allow React render cycle to complete
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const sanitizedClient = customClientName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `TMIS_Vibration_Audit_Report_${sanitizedClient}_${dateStr}.pdf`;

      await downloadReportAsPdf({
        reportContainerId: 'printable-report',
        filename,
        onProgress: (progress) => {
          setPdfProgress(progress);
        },
      });

      toast.success(`Report downloaded successfully as "${filename}"`);
      if (previousViewTab !== 'all') {
        setViewTab(previousViewTab);
      }
    } catch (err: any) {
      console.error('PDF generation failed:', err);
      toast.error(`PDF generation failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  const handlePrintPDF = () => {
    if (viewTab !== 'all') {
      setViewTab('all');
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleExportFullCSV = () => {
    exportToFullCSV(scopedData, customClientName);
    toast.success('Downloaded Full Vibration Audit CSV');
  };

  const handleExportDefectsCSV = () => {
    exportDefectsCSV(scopedData, customClientName);
    toast.success('Downloaded Critical Defects Log CSV');
  };

  const surveyPeriodLabel =
    selectedMonth === 'all' ? 'All Survey Cycles / Baseline Audit' : `Survey Cycle: ${selectedMonth}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[94vh] overflow-y-auto bg-slate-100 border border-slate-200 text-slate-900 shadow-2xl p-0">
        {/* Modal Top Control Bar */}
        <div className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-700 text-white shadow-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  Official Vibration Audit & Diagnostic Report
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 font-bold text-[10px]">
                    Direct Customer PDF
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Includes Cover Page, Index Register, Dedicated Equipment Diagnostic Sheets with 6-Survey Trends, & Services Portfolio.
                </DialogDescription>
              </div>
            </div>

            {/* Primary Action Buttons: Direct PDF Download & CSVs */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportDefectsCSV}
                className="h-9 text-xs font-semibold bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
                title="Export critical Alert & Alarm equipment to CSV"
              >
                <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-600" />
                Defects CSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportFullCSV}
                className="h-9 text-xs font-semibold bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
                title="Export complete 4-point measurement database to CSV"
              >
                <Download className="h-4 w-4 mr-1.5 text-blue-600" />
                Full Data CSV
              </Button>

              {/* Direct PDF Download Button */}
              <Button
                size="sm"
                onClick={handleDirectDownloadPDF}
                disabled={isGeneratingPdf}
                className="h-9 px-4 text-xs font-extrabold bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all gap-1.5"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Generating PDF ({pdfProgress?.percentage ?? 0}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download PDF Report ({totalPages} Pages)</span>
                  </>
                )}
              </Button>

              {/* Auxiliary Physical Print Option */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrintPDF}
                className="h-9 px-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                title="Open browser print dialog for physical printing"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* PDF Generation Progress Bar (Shown while compiling) */}
          {isGeneratingPdf && pdfProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  {pdfProgress.message}
                </span>
                <span>{pdfProgress.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${pdfProgress.percentage}%` }}
                />
              </div>
              <p className="text-[10px] text-blue-700">
                Rendering crisp vector charts, tables, and diagnostics at 300 DPI high fidelity...
              </p>
            </div>
          )}

          {/* Configuration & Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
            {/* Survey Month */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Survey Cycle:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Survey Cycle Filter"
                className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="all">All Survey Cycles ({data.length} records)</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    Cycle: {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Asset Scope:
              </label>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value as any)}
                aria-label="Asset Scope Filter"
                className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="all">All Monitored Assets ({uniqueStats.total})</option>
                <option value="defects">
                  Defects Only (Alarm & Alert: {uniqueStats.alarm + uniqueStats.alert})
                </option>
              </select>
            </div>

            {/* Client Name Customizer */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Customer / Plant Name:
              </label>
              <Input
                type="text"
                value={customClientName}
                onChange={(e) => setCustomClientName(e.target.value)}
                placeholder="Customer Name"
                className="h-8 text-xs bg-slate-50 border-slate-300"
              />
            </div>

            {/* Report Reference */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Report Reference ID:
              </label>
              <Input
                type="text"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                placeholder="Report ID"
                className="h-8 text-xs bg-slate-50 border-slate-300 font-mono"
              />
            </div>
          </div>

          {/* Preview Navigation Tabs (Hidden in Print) */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Preview View:
              </span>
              <button
                type="button"
                onClick={() => setViewTab('all')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  viewTab === 'all'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Full Multi-Page Report ({totalPages} Pages)
              </button>
              <button
                type="button"
                onClick={() => setViewTab('cover')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  viewTab === 'cover'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                1. Cover Page
              </button>
              <button
                type="button"
                onClick={() => setViewTab('index')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  viewTab === 'index'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                2. Index Page
              </button>
              <button
                type="button"
                onClick={() => setViewTab('equipment')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  viewTab === 'equipment'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                3. Equipment Sheets ({latestEquipment.length})
              </button>
              <button
                type="button"
                onClick={() => setViewTab('services')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  viewTab === 'services'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                4. TMIS Services
              </button>
            </div>

            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              ISO 10816-3 Compliant Format
            </span>
          </div>
        </div>

        {/* Printable Multi-Page Report Body */}
        <div id="printable-report" className="p-4 sm:p-8 space-y-8 bg-slate-100 print:bg-white print:p-0 print:space-y-0">
          {/* 1. FRONT / COVER PAGE */}
          {(viewTab === 'all' || viewTab === 'cover') && (
            <div className="page-break">
              <ReportCoverPage
                clientName={customClientName}
                reportDate={reportDate}
                surveyPeriod={surveyPeriodLabel}
                totalEquipment={latestEquipment.length}
                normalCount={uniqueStats.normal}
                alertCount={uniqueStats.alert}
                alarmCount={uniqueStats.alarm}
                reportId={reportId}
                pageNumber={1}
                totalPages={totalPages}
              />
            </div>
          )}

          {/* 2. INDEX / TABLE OF CONTENTS PAGE */}
          {(viewTab === 'all' || viewTab === 'index') && (
            <div className="page-break">
              <ReportIndexPage
                equipmentList={latestEquipment}
                clientName={customClientName}
                reportDate={reportDate}
                startEquipmentPageNumber={3}
                pageNumber={2}
                totalPages={totalPages}
              />
            </div>
          )}

          {/* 3. INDIVIDUAL EQUIPMENT DIAGNOSTIC PAGES (1 Full Page per Equipment) */}
          {(viewTab === 'all' || viewTab === 'equipment') &&
            latestEquipment.map((eq, index) => {
              const history = historyByEquipment.get(eq.equipmentName) || [eq];
              const equipPageNumber = 3 + index;

              return (
                <div key={eq.equipmentName} className="page-break">
                  <ReportEquipmentPage
                    currentRecord={eq}
                    historyRecords={history}
                    clientName={customClientName}
                    reportDate={reportDate}
                    pageNumber={equipPageNumber}
                    totalPages={totalPages}
                  />
                </div>
              );
            })}

          {/* 4. TM INDUSTRIAL SOLUTION SERVICES SHOWCASE PAGE */}
          {(viewTab === 'all' || viewTab === 'services') && (
            <div className="page-break">
              <ReportServicesPage
                clientName={customClientName}
                pageNumber={totalPages}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
