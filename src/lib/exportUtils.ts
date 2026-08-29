import { VibrationData, EquipmentDefectMetric } from '@/types/vibration';
import { getRecordPeakValues, normalizeCondition } from './vibrationUtils';

/**
 * Generates and downloads a complete vibration audit CSV file containing all measurements
 */
export function exportToFullCSV(data: VibrationData[], siteName: string = 'Shree Durga Syntex') {
  if (!data || data.length === 0) return;

  const headers = [
    'Site Name',
    'Equipment Name',
    'Plant Area',
    'Driven Machine',
    'ISO Machine Class',
    'Survey Date',
    'Condition Status',
    'Peak Velocity (mm/s RMS)',
    'Peak Acceleration (g-pk)',
    'P1 Motor NDE AV',
    'P1 Motor NDE HV',
    'P1 Motor NDE VV',
    'P1 Motor NDE HVg (g)',
    'P2 Motor DE AV',
    'P2 Motor DE HV',
    'P2 Motor DE VV',
    'P2 Motor DE HVg (g)',
    'P3 Driven DE AV',
    'P3 Driven DE HV',
    'P3 Driven DE VV',
    'P3 Driven DE HVg (g)',
    'P4 Driven NDE AV',
    'P4 Driven NDE HV',
    'P4 Driven NDE VV',
    'P4 Driven NDE HVg (g)',
    'Diagnostic Finding / Observation',
    'Engineering Action Recommendation',
  ];

  const rows = data.map((item) => {
    const peaks = getRecordPeakValues(item);
    const m = item.measurements;

    const escape = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      escape(siteName),
      escape(item.equipmentName),
      escape(item.area),
      escape(item.driven || 'Machinery'),
      escape(item.class || 'Class II'),
      escape(item.date),
      escape(item.condition),
      escape(peaks.peakVelocity.toFixed(2)),
      escape(peaks.peakAcceleration.toFixed(2)),
      escape(m.point01?.av ?? 0),
      escape(m.point01?.hv ?? 0),
      escape(m.point01?.vv ?? 0),
      escape(m.point01?.hvg ?? 0),
      escape(m.point02?.av ?? 0),
      escape(m.point02?.hv ?? 0),
      escape(m.point02?.vv ?? 0),
      escape(m.point02?.hvg ?? 0),
      escape(m.point03?.av ?? 0),
      escape(m.point03?.hv ?? 0),
      escape(m.point03?.vv ?? 0),
      escape(m.point03?.hvg ?? 0),
      escape(m.point04?.av ?? 0),
      escape(m.point04?.hv ?? 0),
      escape(m.point04?.vv ?? 0),
      escape(m.point04?.hvg ?? 0),
      escape(item.observation || 'Normal operating levels'),
      escape(item.recommendation || 'Continue routine monitoring'),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadBlob(csvContent, `TM_INDUSTRIAL_Vibration_Report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Generates and downloads a focused defect log CSV for Alert & Alarm assets
 */
export function exportDefectsCSV(data: VibrationData[], siteName: string = 'Shree Durga Syntex') {
  const defects = data.filter((item) => {
    const norm = normalizeCondition(item.condition);
    return norm === 'Alarm' || norm === 'Alert';
  });

  if (defects.length === 0) return;

  const headers = [
    'Site Name',
    'Equipment Name',
    'Plant Area',
    'Driven Machine',
    'Condition Status',
    'Survey Date',
    'Peak Velocity (mm/s RMS)',
    'Peak Bearing Accel (g)',
    'Diagnostic Finding',
    'Remedial Recommendation',
  ];

  const rows = defects.map((item) => {
    const peaks = getRecordPeakValues(item);
    const escape = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
    return [
      escape(siteName),
      escape(item.equipmentName),
      escape(item.area),
      escape(item.driven),
      escape(item.condition),
      escape(item.date),
      escape(peaks.peakVelocity.toFixed(2)),
      escape(peaks.peakAcceleration.toFixed(2)),
      escape(item.observation),
      escape(item.recommendation),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadBlob(csvContent, `TM_INDUSTRIAL_Critical_Defects_Log_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
