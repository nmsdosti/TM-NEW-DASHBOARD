import React from 'react';
import { VibrationData } from '@/types/vibration';

interface EquipmentTrendSvgChartProps {
  historyRecords: VibrationData[];
  equipmentName: string;
  drivenLabel?: string;
  height?: number;
}

export const EquipmentTrendSvgChart: React.FC<EquipmentTrendSvgChartProps> = ({
  historyRecords,
  equipmentName,
  drivenLabel = 'Driven',
  height = 180,
}) => {
  // Sort ascending by date
  const sorted = [...historyRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Take last 6 records max
  const last6 = sorted.slice(-6);

  if (last6.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-slate-50 border border-slate-200 rounded text-xs text-slate-400">
        No historical trend readings available
      </div>
    );
  }

  // Extract series values
  const points = last6.map((item) => {
    const d = new Date(item.date);
    const dateLabel = !isNaN(d.getTime())
      ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      : item.date;

    const p1Max = Math.max(item.measurements.point01?.av || 0, item.measurements.point01?.hv || 0, item.measurements.point01?.vv || 0);
    const p2Max = Math.max(item.measurements.point02?.av || 0, item.measurements.point02?.hv || 0, item.measurements.point02?.vv || 0);
    const p3Max = Math.max(item.measurements.point03?.av || 0, item.measurements.point03?.hv || 0, item.measurements.point03?.vv || 0);
    const p4Max = Math.max(item.measurements.point04?.av || 0, item.measurements.point04?.hv || 0, item.measurements.point04?.vv || 0);

    return {
      rawDate: item.date,
      dateLabel,
      p1: Number(p1Max.toFixed(2)),
      p2: Number(p2Max.toFixed(2)),
      p3: Number(p3Max.toFixed(2)),
      p4: Number(p4Max.toFixed(2)),
    };
  });

  // SVG dimensions
  const width = 680;
  const padding = { top: 22, right: 30, bottom: 28, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Determine Y-axis max (at least 6.0 mm/s to display ISO 2.8 and 4.5 thresholds clearly)
  const allValues = points.flatMap((p) => [p.p1, p.p2, p.p3, p.p4]);
  const maxValue = Math.max(...allValues, 5.5);
  const yMax = Math.ceil((maxValue + 0.5) / 2) * 2; // e.g. 6 or 8 or 10

  const getX = (index: number) => {
    if (points.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (points.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, yMax));
    return padding.top + chartHeight - (clamped / yMax) * chartHeight;
  };

  // Build SVG path
  const buildPath = (key: 'p1' | 'p2' | 'p3' | 'p4') => {
    if (points.length === 0) return '';
    return points
      .map((p, idx) => {
        const x = getX(idx);
        const y = getY(p[key]);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const series = [
    { key: 'p1' as const, label: 'Motor NDE', color: '#2563eb' }, // Blue
    { key: 'p2' as const, label: 'Motor DE', color: '#059669' },  // Emerald
    { key: 'p3' as const, label: `${drivenLabel} DE`, color: '#d97706' }, // Amber
    { key: 'p4' as const, label: `${drivenLabel} NDE`, color: '#7c3aed' }, // Purple
  ];

  // Y-axis grid ticks
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map((v) => Number(v.toFixed(1)));

  // ISO Threshold positions
  const alertY = getY(2.8);
  const alarmY = getY(4.5);

  return (
    <div className="w-full bg-white rounded border border-slate-200 p-2.5">
      <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100">
        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
          6-Survey Vibration Trend Analysis (mm/s RMS Peak)
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-sm inline-block" style={{ backgroundColor: s.color }} />
              <span className="text-slate-600 font-medium">{s.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
            <span className="w-2.5 h-0.5 border-t border-dashed border-amber-500 inline-block" />
            <span className="text-amber-700 font-semibold">ISO Alert (2.8)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 border-t border-dashed border-red-500 inline-block" />
            <span className="text-red-700 font-semibold">ISO Alarm (4.5)</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: `${height}px` }}>
          {/* ISO Zone Backgrounds */}
          <rect
            x={padding.left}
            y={getY(2.8)}
            width={chartWidth}
            height={Math.max(0, getY(0) - getY(2.8))}
            fill="#f0fdf4"
            opacity="0.4"
          />
          <rect
            x={padding.left}
            y={getY(4.5)}
            width={chartWidth}
            height={Math.max(0, getY(2.8) - getY(4.5))}
            fill="#fffbeb"
            opacity="0.4"
          />
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={Math.max(0, getY(4.5) - padding.top)}
            fill="#fef2f2"
            opacity="0.4"
          />

          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={getY(tick)}
                x2={width - padding.right}
                y2={getY(tick)}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={getY(tick) + 3}
                textAnchor="end"
                fontSize="9"
                fill="#64748b"
                fontWeight="500"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* ISO Warning Line (2.8 mm/s) */}
          {alertY >= padding.top && alertY <= padding.top + chartHeight && (
            <line
              x1={padding.left}
              y1={alertY}
              x2={width - padding.right}
              y2={alertY}
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
          )}

          {/* ISO Alarm Line (4.5 mm/s) */}
          {alarmY >= padding.top && alarmY <= padding.top + chartHeight && (
            <line
              x1={padding.left}
              y1={alarmY}
              x2={width - padding.right}
              y2={alarmY}
              stroke="#ef4444"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
          )}

          {/* X Axis Date Labels */}
          {points.map((p, idx) => {
            const x = getX(idx);
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={padding.top + chartHeight}
                  x2={x}
                  y2={padding.top + chartHeight + 4}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + chartHeight + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#475569"
                  fontWeight="600"
                >
                  {p.dateLabel}
                </text>
              </g>
            );
          })}

          {/* Trend Lines and Circles for each series */}
          {series.map((s) => {
            const pathData = buildPath(s.key);
            return (
              <g key={s.key}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((p, idx) => {
                  const x = getX(idx);
                  const y = getY(p[s.key]);
                  const isHigh = p[s.key] >= 4.5;
                  return (
                    <g key={idx}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isHigh ? '4' : '3'}
                        fill={isHigh ? '#ef4444' : s.color}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      {/* Show value text for latest reading or critical values */}
                      {(idx === points.length - 1 || isHigh) && (
                        <text
                          x={x}
                          y={y - 6}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="700"
                          fill={s.color}
                        >
                          {p[s.key]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
