import React, { useState, useMemo } from 'react';
import { VibrationData } from '@/types/vibration';
import {
  getUniqueLatestEquipment,
  normalizeCondition,
  getConditionTheme,
  getRecordPeakValues,
  parseDateInfo,
} from '@/lib/vibrationUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Cpu,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Filter,
  LayoutGrid,
  ListFilter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

interface MachinesViewProps {
  data: VibrationData[];
  onSelectEquipment: (equipmentName: string) => void;
}

type SortField = 'velocity' | 'accel' | 'condition' | 'date' | 'name';
type SortOrder = 'asc' | 'desc';

export const MachinesView: React.FC<MachinesViewProps> = ({
  data,
  onSelectEquipment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('latest');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedDriven, setSelectedDriven] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortField, setSortField] = useState<SortField>('velocity');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Extract all unique survey Month-Years from the dataset
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    data.forEach((item) => {
      if (!item.date) return;
      const info = parseDateInfo(item.date);
      if (info.monthKey) {
        months.add(info.monthKey);
      }
    });
    return Array.from(months).sort().reverse();
  }, [data]);

  // Format month key for human readability (e.g. 2024-10 -> October 2024)
  const formatMonthLabel = (mKey: string) => {
    try {
      const [year, month] = mKey.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return mKey;
    }
  };

  // Base dataset scoped by selected Month-Year filter
  const monthScopedRecords = useMemo(() => {
    if (selectedMonth === 'latest') {
      return getUniqueLatestEquipment(data);
    }
    if (selectedMonth === 'all') {
      return data;
    }
    // Specific month selected (e.g., '2024-10')
    const inMonth = data.filter((item) => {
      if (!item.date) return false;
      const info = parseDateInfo(item.date);
      return info.monthKey === selectedMonth;
    });

    // If multiple entries for same equipment in this month, get latest for each
    return getUniqueLatestEquipment(inMonth);
  }, [data, selectedMonth]);

  // Extract unique areas from the active month-scoped set
  const areas = useMemo(() => {
    const set = new Set<string>();
    data.forEach((m) => m.area && set.add(m.area));
    return Array.from(set).sort();
  }, [data]);

  // Extract unique driven types
  const drivenTypes = useMemo(() => {
    const set = new Set<string>();
    data.forEach((m) => m.driven && set.add(m.driven));
    return Array.from(set).sort();
  }, [data]);

  // Condition breakdown counts for current month scope
  const conditionStats = useMemo(() => {
    let alarm = 0;
    let alert = 0;
    let normal = 0;
    monthScopedRecords.forEach((m) => {
      const c = normalizeCondition(m.condition);
      if (c === 'Alarm') alarm++;
      else if (c === 'Alert') alert++;
      else normal++;
    });
    return { total: monthScopedRecords.length, alarm, alert, normal };
  }, [monthScopedRecords]);

  // Filter machines across search query, area, driven type, condition
  const filteredMachines = useMemo(() => {
    return monthScopedRecords.filter((m) => {
      const matchSearch =
        m.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.driven || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.observation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.recommendation || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchArea = selectedArea === 'all' || m.area === selectedArea;
      const matchDriven = selectedDriven === 'all' || m.driven === selectedDriven;
      const matchCondition =
        selectedCondition === 'all' || normalizeCondition(m.condition) === selectedCondition;

      return matchSearch && matchArea && matchDriven && matchCondition;
    });
  }, [monthScopedRecords, searchTerm, selectedArea, selectedDriven, selectedCondition]);

  // Sort machines
  const sortedMachines = useMemo(() => {
    const items = [...filteredMachines];
    const conditionPriority: Record<string, number> = {
      alarm: 3,
      alert: 2,
      normal: 1,
    };

    items.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'velocity') {
        valA = getRecordPeakValues(a).peakVelocity;
        valB = getRecordPeakValues(b).peakVelocity;
      } else if (sortField === 'accel') {
        valA = getRecordPeakValues(a).peakAcceleration;
        valB = getRecordPeakValues(b).peakAcceleration;
      } else if (sortField === 'condition') {
        valA = conditionPriority[normalizeCondition(a.condition).toLowerCase()] || 0;
        valB = conditionPriority[normalizeCondition(b.condition).toLowerCase()] || 0;
      } else if (sortField === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else {
        valA = a.equipmentName;
        valB = b.equipmentName;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [filteredMachines, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-blue-600 font-bold" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-600 font-bold" />
    );
  };

  const isAnyFilterActive =
    searchTerm !== '' ||
    selectedMonth !== 'latest' ||
    selectedArea !== 'all' ||
    selectedDriven !== 'all' ||
    selectedCondition !== 'all';

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedMonth('latest');
    setSelectedArea('all');
    setSelectedDriven('all');
    setSelectedCondition('all');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Cpu className="h-6 w-6 text-blue-600" />
              Equipment Vibration Matrix
            </h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-bold">
              ISO 10816-3 Registry
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical survey cycle analytics, 4-point RMS velocities, and defect diagnostics across all monitored equipment
          </p>
        </div>

        {/* View Mode Switcher + Asset Counter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Detailed Table Matrix View"
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Matrix Table</span>
            </button>
          </div>

          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xs">
            {sortedMachines.length} of {monthScopedRecords.length} Assets
          </span>
        </div>
      </div>

      {/* Primary Filter Control Toolbar */}
      <Card className="border-slate-200 bg-white p-4 shadow-xs space-y-3">
        {/* Row 1: Search & Month-Year Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search machinery name, defect, area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-white border-slate-300 text-slate-900 focus-visible:ring-blue-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Month-Year Survey Filter */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:hidden">
              Survey Month-Year
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Filter by Survey Month-Year"
                className="w-full h-9 pl-9 pr-3 text-xs font-semibold bg-blue-50/40 border border-blue-200 rounded-md text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
              >
                <option value="latest">Latest Survey Cycle (All Assets)</option>
                <option value="all">All Historical Records ({data.length} Total)</option>
                <optgroup label="Specific Survey Cycles (Month-Year)">
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {formatMonthLabel(m)} ({m})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Plant Area Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:hidden">
              Plant Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              aria-label="Filter by Plant Area"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Plant Areas ({areas.length})</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Driven Type Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:hidden">
              Machine Type
            </label>
            <select
              value={selectedDriven}
              onChange={(e) => setSelectedDriven(e.target.value)}
              aria-label="Filter by Machine Type"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Machine Types ({drivenTypes.length})</option>
              {drivenTypes.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Condition Filter Pills & Active Filter Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Condition Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Condition Filter:</span>

            <button
              onClick={() => setSelectedCondition('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCondition === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>All</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                {conditionStats.total}
              </span>
            </button>

            <button
              onClick={() => setSelectedCondition('Alarm')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCondition === 'Alarm'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
              }`}
            >
              <AlertOctagon className="h-3 w-3 text-red-500" />
              <span>Alarm</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-800">
                {conditionStats.alarm}
              </span>
            </button>

            <button
              onClick={() => setSelectedCondition('Alert')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCondition === 'Alert'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span>Alert</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {conditionStats.alert}
              </span>
            </button>

            <button
              onClick={() => setSelectedCondition('Normal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCondition === 'Normal'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span>Normal</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                {conditionStats.normal}
              </span>
            </button>
          </div>

          {/* Active Survey Cycle Info + Reset */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] font-semibold text-slate-500">
              Survey Cycle:{' '}
              <strong className="text-slate-900">
                {selectedMonth === 'latest'
                  ? 'Latest Inspection'
                  : selectedMonth === 'all'
                  ? 'All Historical Dates'
                  : formatMonthLabel(selectedMonth)}
              </strong>
            </span>

            {isAnyFilterActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="h-7 px-2 text-xs font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-50 gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* VIEW MODE 1: CARD GRID */}
      {viewMode === 'grid' && (
        <>
          {sortedMachines.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
              <p className="text-base font-semibold text-slate-900">No machinery match your filter criteria</p>
              <p className="text-xs text-slate-500 mt-1">
                Try selecting a different Month-Year survey cycle or resetting the filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllFilters}
                className="mt-4 text-xs bg-white border-slate-300 text-slate-700"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedMachines.map((machine) => {
                const normCond = normalizeCondition(machine.condition);
                const theme = getConditionTheme(normCond);
                const peaks = getRecordPeakValues(machine);
                const isAlarm = normCond === 'Alarm';
                const isAlert = normCond === 'Alert';

                return (
                  <Card
                    key={`${machine.equipmentName}-${machine.date}`}
                    className={`border bg-white transition-all hover:shadow-md cursor-pointer flex flex-col justify-between ${
                      isAlarm
                        ? 'border-red-200 hover:border-red-400'
                        : isAlert
                        ? 'border-amber-200 hover:border-amber-400'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                    onClick={() => onSelectEquipment(machine.equipmentName)}
                  >
                    <CardHeader className="pb-3 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                            {machine.equipmentName}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5 text-slate-500 flex items-center gap-1.5 flex-wrap">
                            <span>{machine.area}</span>
                            <span>•</span>
                            <span>{machine.driven || 'Machinery'}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">{machine.date}</span>
                          </CardDescription>
                        </div>
                        <Badge variant={theme.badgeVariant as any} className="font-bold text-xs uppercase">
                          {machine.condition}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="py-3 space-y-3 text-xs flex-1 flex flex-col justify-between">
                      {/* Peak Indicators */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Peak Velocity
                          </span>
                          <span
                            className={`text-sm font-black ${
                              peaks.peakVelocity > 4.5
                                ? 'text-red-600'
                                : peaks.peakVelocity > 2.8
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {peaks.peakVelocity.toFixed(2)} mm/s
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Peak Acceleration
                          </span>
                          <span
                            className={`text-sm font-black ${
                              peaks.peakAcceleration > 10.0
                                ? 'text-red-600'
                                : peaks.peakAcceleration > 4.5
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {peaks.peakAcceleration.toFixed(2)} g
                          </span>
                        </div>
                      </div>

                      {/* 4 Points Overview */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Vibration Points (RMS mm/s)
                        </span>
                        <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                          {[
                            { label: 'P1 NDE', m: machine.measurements.point01 },
                            { label: 'P2 DE', m: machine.measurements.point02 },
                            { label: 'P3 DE', m: machine.measurements.point03 },
                            { label: 'P4 NDE', m: machine.measurements.point04 },
                          ].map((p, idx) => {
                            const maxV = Math.max(p.m?.av || 0, p.m?.hv || 0, p.m?.vv || 0);
                            return (
                              <div
                                key={idx}
                                className={`p-1.5 rounded border ${
                                  maxV > 4.5
                                    ? 'bg-red-50 border-red-200 text-red-700'
                                    : maxV > 2.8
                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="text-[9px] font-sans font-semibold text-slate-500">
                                  {p.label}
                                </div>
                                <div className="text-xs font-bold">{maxV.toFixed(1)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Diagnostic Finding Snippet */}
                      {machine.observation && (
                        <div className="p-2 rounded bg-slate-50 border border-slate-200">
                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            <strong className="text-slate-800">Diagnostic: </strong>
                            {machine.observation}
                          </p>
                        </div>
                      )}

                      {/* Action Link */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-blue-600 font-semibold text-xs">
                        <span>Inspect Full Diagnostics & History</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 2: DENSE TABLE MATRIX */}
      {viewMode === 'table' && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <Table className="w-full text-xs">
              <TableHeader className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold">
                <TableRow className="hover:bg-transparent">
                  {/* Equipment Info */}
                  <TableHead className="w-[240px]">
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
                    >
                      <span>Equipment & Area</span>
                      {getSortIcon('name')}
                    </button>
                  </TableHead>

                  {/* Survey Date */}
                  <TableHead className="w-[120px]">
                    <button
                      onClick={() => toggleSort('date')}
                      className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
                    >
                      <span>Survey Date</span>
                      {getSortIcon('date')}
                    </button>
                  </TableHead>

                  {/* Condition */}
                  <TableHead className="w-[110px]">
                    <button
                      onClick={() => toggleSort('condition')}
                      className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
                    >
                      <span>Condition</span>
                      {getSortIcon('condition')}
                    </button>
                  </TableHead>

                  {/* Velocity */}
                  <TableHead className="w-[150px]">
                    <button
                      onClick={() => toggleSort('velocity')}
                      className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
                    >
                      <span>Peak Velocity (RMS)</span>
                      {getSortIcon('velocity')}
                    </button>
                  </TableHead>

                  {/* Acceleration */}
                  <TableHead className="w-[130px]">
                    <button
                      onClick={() => toggleSort('accel')}
                      className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
                    >
                      <span>Bearing Accel (g)</span>
                      {getSortIcon('accel')}
                    </button>
                  </TableHead>

                  {/* 4 Point RMS Matrix */}
                  <TableHead className="min-w-[190px]">4-Point RMS Matrix (mm/s)</TableHead>

                  {/* Observation */}
                  <TableHead className="min-w-[220px]">Diagnostic Finding</TableHead>

                  {/* Action */}
                  <TableHead className="w-[80px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-slate-200">
                {sortedMachines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-12 text-center text-slate-500">
                      <p className="text-sm font-bold text-slate-800">No machinery matching your filter criteria</p>
                      <p className="text-xs text-slate-500 mt-1">Try adjusting the survey cycle month or search terms.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedMachines.map((equipment, idx) => {
                    const peaks = getRecordPeakValues(equipment);
                    const normCond = normalizeCondition(equipment.condition);
                    const isAlarm = normCond === 'Alarm';
                    const isAlert = normCond === 'Alert';

                    const p1 = Math.max(equipment.measurements.point01?.av || 0, equipment.measurements.point01?.hv || 0, equipment.measurements.point01?.vv || 0);
                    const p2 = Math.max(equipment.measurements.point02?.av || 0, equipment.measurements.point02?.hv || 0, equipment.measurements.point02?.vv || 0);
                    const p3 = Math.max(equipment.measurements.point03?.av || 0, equipment.measurements.point03?.hv || 0, equipment.measurements.point03?.vv || 0);
                    const p4 = Math.max(equipment.measurements.point04?.av || 0, equipment.measurements.point04?.hv || 0, equipment.measurements.point04?.vv || 0);

                    return (
                      <TableRow
                        key={`${equipment.equipmentName}-${equipment.date}-${idx}`}
                        className={`transition-colors cursor-pointer ${
                          isAlarm
                            ? 'bg-red-50/40 hover:bg-red-50/80'
                            : isAlert
                            ? 'bg-amber-50/30 hover:bg-amber-50/70'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                        onClick={() => onSelectEquipment(equipment.equipmentName)}
                      >
                        <TableCell className="font-medium align-top py-3">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 text-sm hover:text-blue-600">
                              {equipment.equipmentName}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {equipment.area}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                {equipment.driven || 'Machine'}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top py-3 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            <span>{equipment.date}</span>
                          </div>
                        </TableCell>

                        <TableCell className="align-top py-3">
                          {isAlarm ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] bg-red-100 text-red-800 border border-red-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                              Alarm
                            </span>
                          ) : isAlert ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] bg-amber-100 text-amber-800 border border-amber-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Alert
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Normal
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="align-top py-3">
                          <div className="font-bold text-sm text-slate-900">
                            {peaks.peakVelocity.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-500">mm/s</span>
                          </div>
                        </TableCell>

                        <TableCell className="align-top py-3">
                          <div className="font-bold text-sm text-slate-800">
                            {peaks.peakAcceleration.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-500">g</span>
                          </div>
                        </TableCell>

                        <TableCell className="align-top py-3">
                          <div className="grid grid-cols-4 gap-1 text-center font-mono">
                            <div className={`p-1 rounded border ${p1 > 4.5 ? 'bg-red-100 border-red-300 text-red-800' : p1 > 2.8 ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                              <div className="text-[8px] font-sans text-slate-400">P1</div>
                              <div className="text-[10px] font-bold">{p1.toFixed(1)}</div>
                            </div>
                            <div className={`p-1 rounded border ${p2 > 4.5 ? 'bg-red-100 border-red-300 text-red-800' : p2 > 2.8 ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                              <div className="text-[8px] font-sans text-slate-400">P2</div>
                              <div className="text-[10px] font-bold">{p2.toFixed(1)}</div>
                            </div>
                            <div className={`p-1 rounded border ${p3 > 4.5 ? 'bg-red-100 border-red-300 text-red-800' : p3 > 2.8 ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                              <div className="text-[8px] font-sans text-slate-400">P3</div>
                              <div className="text-[10px] font-bold">{p3.toFixed(1)}</div>
                            </div>
                            <div className={`p-1 rounded border ${p4 > 4.5 ? 'bg-red-100 border-red-300 text-red-800' : p4 > 2.8 ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                              <div className="text-[8px] font-sans text-slate-400">P4</div>
                              <div className="text-[10px] font-bold">{p4.toFixed(1)}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top py-3 max-w-[240px]">
                          <p className="text-xs text-slate-700 line-clamp-2">
                            {equipment.observation || 'Operating within baseline limits.'}
                          </p>
                        </TableCell>

                        <TableCell className="align-top py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};
