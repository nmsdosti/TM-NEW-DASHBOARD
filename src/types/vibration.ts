export type NormalizedCondition = 'Normal' | 'Alert' | 'Alarm';

export interface VibrationData {
  srNo: number;
  equipmentName: string;
  class: string;
  area: string;
  observation: string;
  recommendation: string;
  driven: string;
  date: string;
  condition: string;
  measurements: {
    point01: MeasurementPoint;
    point02: MeasurementPoint;
    point03: MeasurementPoint;
    point04: MeasurementPoint;
  };
}

export interface MeasurementPoint {
  av: number; // Axial Vibration (mm/s RMS)
  hv: number; // Horizontal Vibration (mm/s RMS)
  hvg: number; // Horizontal Acceleration (g-pk)
  vv: number; // Vertical Vibration (mm/s RMS)
}

export interface EquipmentDefectMetric {
  equipmentName: string;
  area: string;
  driven: string;
  class: string;
  latestDate: string;
  condition: NormalizedCondition;
  rawCondition: string;
  peakVelocity: number; // Highest mm/s across points
  peakVelocityPoint: string;
  peakAcceleration: number; // Highest g-pk across points
  peakAccelerationPoint: string;
  problemScore: number; // 0 - 100 severity calculation
  alarmCount: number;
  alertCount: number;
  totalRecords: number;
  latestObservation: string;
  latestRecommendation: string;
  defectCategories: string[];
}

export interface WorkOrder {
  id: string;
  equipmentName: string;
  area: string;
  driven: string;
  title: string;
  description: string;
  recommendation: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Open' | 'In Progress' | 'Under Review' | 'Resolved';
  assignedTo: string;
  createdAt: string;
  dueDate: string;
  peakVibe: string;
}

export interface AppNotification {
  id: string;
  equipmentName: string;
  type: 'Alarm' | 'Alert' | 'Info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  measurementSummary?: string;
}

export interface AppSettings {
  sheetUrl: string;
  siteName: string;
  autoRefreshInterval: number; // in seconds (0 = manual)
  class2Limits: {
    normalMax: number; // default 2.8 mm/s
    alertMax: number; // default 4.5 mm/s
    alarmThreshold: number; // > 4.5 mm/s
    accelAlertMax: number; // default 5.0 g
  };
}
