import React, { useState, useMemo } from 'react';
import { VibrationData } from '@/types/vibration';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRecordPeakValues, normalizeCondition, getConditionTheme } from '@/lib/vibrationUtils';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Activity,
  Zap,
  Gauge,
  Layers,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EquipmentTableProps {
  data: VibrationData[];
  onEquipmentClick: (equipment: VibrationData) => void;
}

type SortField = 'velocity' | 'accel' | 'condition' | 'date' | 'name';
type SortOrder = 'asc' | 'desc';

export const EquipmentTable: React.FC<EquipmentTableProps> = ({
  data,
  onEquipmentClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('velocity');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Extract unique months from data
  const availableMonths = useMemo(() => {
    const months = new Set(
      data.map((item) => {
        const date = new Date(item.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    );
    return Array.from(months).sort().reverse();
  }, [data]);

  // Extract unique areas
  const availableAreas = useMemo(() => {
    const areas = new Set<string>();
    data.forEach((item) => item.area && areas.add(item.area));
    return Array.from(areas).sort();
  }, [data]);

  // Condition counts for status quick-toggle pills
  const conditionCounts = useMemo(() => {
    let normal = 0;
    let alert = 0;
    let alarm = 0;
    data.forEach((item) => {
      const c = normalizeCondition(item.condition);
      if (c === 'Alarm') alarm++;
      else if (c === 'Alert') alert++;
      else normal++;
    });
    return { all: data.length, normal, alert, alarm };
  }, [data]);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Month
      if (selectedMonth !== 'all') {
        const date = new Date(item.date);
        const itemMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (itemMonth !== selectedMonth) return false;
      }

      // Area
      if (selectedArea !== 'all' && item.area !== selectedArea) {
        return false;
      }

      // Condition
      if (selectedCondition !== 'all') {
        const norm = normalizeCondition(item.condition);
        if (norm !== selectedCondition) return false;
      }

      // Search Query
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchName = item.equipmentName.toLowerCase().includes(q);
        const matchArea = item.area.toLowerCase().includes(q);
        const matchDriven = (item.driven || '').toLowerCase().includes(q);
        const matchObs = (item.observation || '').toLowerCase().includes(q);
        const matchRec = (item.recommendation || '').toLowerCase().includes(q);
        if (!matchName && !matchArea && !matchDriven && !matchObs && !matchRec) {
          return false;
        }
      }

      return true;
    });
  }, [data, selectedMonth, selectedArea, selectedCondition, searchTerm]);

  // Sort Data
  const sortedData = useMemo(() => {
    const items = [...filteredData];
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
  }, [filteredData, sortField, sortOrder]);

  // Pagination slice
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

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

  return (
    <div className="space-y-4">
      {/* Top Filter & Control Toolbar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 rounded-t-xl space-y-3">
        {/* Row 1: Search and Status Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search machinery, area, defect, observation..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 text-xs bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600"
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

          {/* Condition Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold mr-1 text-[11px]">Filter Condition:</span>

            <button
              onClick={() => {
                setSelectedCondition('all');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                selectedCondition === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>All</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
                {conditionCounts.all}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCondition('Alarm');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                selectedCondition === 'Alarm'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
              }`}
            >
              <AlertOctagon className="h-3 w-3 text-red-500" />
              <span>Alarm</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-800">
                {conditionCounts.alarm}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCondition('Alert');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                selectedCondition === 'Alert'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span>Alert</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {conditionCounts.alert}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCondition('Normal');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                selectedCondition === 'Normal'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span>Normal</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                {conditionCounts.normal}
              </span>
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdowns (Area, Month, Page Size) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            {/* Area Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Area:</span>
              <select
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter Area"
                className="h-8 px-2.5 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="all">All Plant Areas</option>
                {availableAreas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Survey:</span>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter Survey Month"
                className="h-8 px-2.5 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="all">All Survey Cycles</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Counter & Reset */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="font-semibold text-slate-700">
              Showing <strong className="text-slate-900">{sortedData.length}</strong> of {data.length} records
            </span>
            {(searchTerm || selectedArea !== 'all' || selectedCondition !== 'all' || selectedMonth !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedArea('all');
                  setSelectedCondition('all');
                  setSelectedMonth('all');
                  setCurrentPage(1);
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main High-Density Industrial Table */}
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
                  <span>Equipment & Asset Info</span>
                  {getSortIcon('name')}
                </button>
              </TableHead>

              {/* Date */}
              <TableHead className="w-[110px]">
                <button
                  onClick={() => toggleSort('date')}
                  className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
                >
                  <span>Survey Date</span>
                  {getSortIcon('date')}
                </button>
              </TableHead>

              {/* Condition Status */}
              <TableHead className="w-[120px]">
                <button
                  onClick={() => toggleSort('condition')}
                  className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
                >
                  <span>Condition</span>
                  {getSortIcon('condition')}
                </button>
              </TableHead>

              {/* Peak Velocity (mm/s) */}
              <TableHead className="w-[170px]">
                <button
                  onClick={() => toggleSort('velocity')}
                  className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
                >
                  <span>Peak Velocity (RMS)</span>
                  {getSortIcon('velocity')}
                </button>
              </TableHead>

              {/* Peak Acceleration (g) */}
              <TableHead className="w-[130px]">
                <button
                  onClick={() => toggleSort('accel')}
                  className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900"
                >
                  <span>Bearing Accel (g)</span>
                  {getSortIcon('accel')}
                </button>
              </TableHead>

              {/* 4 Point Vibration Grid */}
              <TableHead className="min-w-[200px]">4-Point RMS Matrix (mm/s)</TableHead>

              {/* Findings */}
              <TableHead className="min-w-[220px]">Diagnostic Finding & Recommendation</TableHead>

              {/* Action */}
              <TableHead className="w-[90px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-200">
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="p-12 text-center text-slate-500">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">No machinery matching your filter criteria</p>
                    <p className="text-xs text-slate-500">Try adjusting search keywords or resetting filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((equipment, idx) => {
                const peaks = getRecordPeakValues(equipment);
                const normCond = normalizeCondition(equipment.condition);
                const isAlarm = normCond === 'Alarm';
                const isAlert = normCond === 'Alert';

                // Peak Velocity progress indicator percentage (4.5 mm/s is Alarm threshold, cap at 100%)
                const velPercent = Math.min(Math.round((peaks.peakVelocity / 7.0) * 100), 100);

                // Check 4 point maximums
                const p1 = Math.max(equipment.measurements.point01?.av || 0, equipment.measurements.point01?.hv || 0, equipment.measurements.point01?.vv || 0);
                const p2 = Math.max(equipment.measurements.point02?.av || 0, equipment.measurements.point02?.hv || 0, equipment.measurements.point02?.vv || 0);
                const p3 = Math.max(equipment.measurements.point03?.av || 0, equipment.measurements.point03?.hv || 0, equipment.measurements.point03?.vv || 0);
                const p4 = Math.max(equipment.measurements.point04?.av || 0, equipment.measurements.point04?.hv || 0, equipment.measurements.point04?.vv || 0);

                return (
                  <TableRow
                    key={`${equipment.equipmentName}-${equipment.date}-${idx}`}
                    className={`transition-colors cursor-pointer group ${
                      isAlarm
                        ? 'bg-red-50/40 hover:bg-red-50/80'
                        : isAlert
                        ? 'bg-amber-50/30 hover:bg-amber-50/70'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => onEquipmentClick(equipment)}
                  >
                    {/* Equipment Name & Class */}
                    <TableCell className="font-medium align-top py-3">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                          {equipment.equipmentName}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {equipment.area}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {equipment.driven || 'Machine'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Survey Date */}
                    <TableCell className="align-top py-3 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{equipment.date}</span>
                      </div>
                    </TableCell>

                    {/* Condition Status Badge */}
                    <TableCell className="align-top py-3">
                      <div className="flex items-center gap-1.5">
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
                      </div>
                    </TableCell>

                    {/* Peak Velocity Gauge & Value */}
                    <TableCell className="align-top py-3">
                      <div className="space-y-1 min-w-[140px]">
                        <div className="flex items-baseline justify-between">
                          <span
                            className={`text-sm font-extrabold ${
                              isAlarm
                                ? 'text-red-700'
                                : isAlert
                                ? 'text-amber-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {peaks.peakVelocity.toFixed(2)}{' '}
                            <span className="text-[10px] font-normal text-slate-500">mm/s</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            P{peaks.peakVelocityPoint.slice(0, 2)}
                          </span>
                        </div>
                        {/* Progress visual bar */}
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isAlarm
                                ? 'bg-red-600'
                                : isAlert
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${velPercent}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Peak Bearing Acceleration (g) */}
                    <TableCell className="align-top py-3">
                      <div>
                        <span
                          className={`text-sm font-bold ${
                            peaks.peakAcceleration > 10.0
                              ? 'text-red-700 font-black'
                              : peaks.peakAcceleration > 4.5
                              ? 'text-amber-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {peaks.peakAcceleration.toFixed(2)}{' '}
                          <span className="text-[10px] font-normal text-slate-500">g</span>
                        </span>
                        {peaks.peakAcceleration > 4.5 && (
                          <span className="block text-[10px] font-semibold text-amber-700">
                            Bearing Warn
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 4 Points Vibration Mini Matrix */}
                    <TableCell className="align-top py-3">
                      <div className="grid grid-cols-4 gap-1 text-center font-mono">
                        <div className={`p-1 rounded border ${p1 > 4.5 ? 'bg-red-100 border-red-300 text-red-800' : p1 > 2.8 ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          <div className="text-[8px] font-sans font-semibold text-slate-400 uppercase">P1</div>
                          <div className="text-[11px] font-bold">{p1.toFixed(1)}</div>
                        </div>

                        <div className={`p-1 rounded border ${p2 > 4.5 ? 'bg-red-100 border-red-300 text-red-800' : p2 > 2.8 ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          <div className="text-[8px] font-sans font-semibold text-slate-400 uppercase">P2</div>
                          <div className="text-[11px] font-bold">{p2.toFixed(1)}</div>
                        </div>

                        <div className={`p-1 rounded border ${p3 > 4.5 ? 'bg-red-100 border-red-300 text-red-800' : p3 > 2.8 ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          <div className="text-[8px] font-sans font-semibold text-slate-400 uppercase">P3</div>
                          <div className="text-[11px] font-bold">{p3.toFixed(1)}</div>
                        </div>

                        <div className={`p-1 rounded border ${p4 > 4.5 ? 'bg-red-100 border-red-300 text-red-800' : p4 > 2.8 ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          <div className="text-[8px] font-sans font-semibold text-slate-400 uppercase">P4</div>
                          <div className="text-[11px] font-bold">{p4.toFixed(1)}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Diagnostic Finding & Recommendation */}
                    <TableCell className="align-top py-3 max-w-[260px]">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-700 line-clamp-1">
                          <strong className="text-slate-900">Observation: </strong>
                          {equipment.observation || 'Operating within standard baseline.'}
                        </p>
                        {equipment.recommendation && (
                          <p className="text-[11px] text-blue-700 line-clamp-1 font-medium">
                            <strong>Action: </strong>
                            {equipment.recommendation}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions Button */}
                    <TableCell className="align-top py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        title="View Detailed Analytics"
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

      {/* Pagination Footer Controls */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-200 rounded-b-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            aria-label="Rows per page"
            className="h-8 px-2 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>
            Page <strong className="text-slate-900">{currentPage}</strong> of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 bg-white border-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0 bg-white border-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
