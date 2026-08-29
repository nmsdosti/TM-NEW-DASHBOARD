import {
  VibrationData,
  NormalizedCondition,
  EquipmentDefectMetric,
  AppNotification,
  WorkOrder,
} from '@/types/vibration';

export interface DateInfo {
  timestamp: number;
  monthKey: string; // "YYYY-MM"
  monthLabel: string; // "Oct 2024"
  formattedDate: string; // "DD/MM/YYYY"
}

/**
 * Robust date parser supporting MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, and standard formats
 */
export const parseDateInfo = (dateStr: string = ''): DateInfo => {
  if (!dateStr) return { timestamp: 0, monthKey: '', monthLabel: '', formattedDate: '' };
  const s = dateStr.trim();

  const parts = s.split(/[-/.]/);
  let year = 0;
  let month = 0;
  let day = 0;

  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else if (parts[2].length === 4) {
      // MM/DD/YYYY or DD/MM/YYYY
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);
      if (p0 > 12) {
        day = p0;
        month = p1;
        year = p2;
      } else {
        month = p0;
        day = p1;
        year = p2;
      }
    }
  }

  if (!year || !month) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    } else {
      return { timestamp: 0, monthKey: '', monthLabel: '', formattedDate: s };
    }
  }

  const dt = new Date(year, month - 1, day || 1);
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const monthLabel = dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const formattedDate = `${String(day || 1).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

  return {
    timestamp: dt.getTime(),
    monthKey,
    monthLabel,
    formattedDate,
  };
};

/**
 * Normalizes raw condition text from the CSV into standard 'Normal' | 'Alert' | 'Alarm'
 */
export const normalizeCondition = (rawCondition: string = ''): NormalizedCondition => {
  const cond = (rawCondition || '').toLowerCase().trim();
  if (cond.includes('alarm') || cond.includes('critical') || cond.includes('danger') || cond.includes('severe')) {
    return 'Alarm';
  }
  if (cond.includes('alert') || cond.includes('minor') || cond.includes('caution') || cond.includes('warning')) {
    return 'Alert';
  }
  return 'Normal';
};

/**
 * Get color code for condition badge and chart
 */
export const getConditionTheme = (condition: string | NormalizedCondition) => {
  const norm = typeof condition === 'string' ? normalizeCondition(condition) : condition;
  switch (norm) {
    case 'Alarm':
      return {
        label: 'Alarm',
        color: '#ef4444', // Crimson / Red
        bg: 'bg-destructive/15',
        text: 'text-destructive',
        border: 'border-destructive/30',
        badgeVariant: 'destructive',
      };
    case 'Alert':
      return {
        label: 'Alert',
        color: '#f59e0b', // Amber / Orange
        bg: 'bg-amber-500/15',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badgeVariant: 'warning',
      };
    case 'Normal':
    default:
      return {
        label: 'Normal',
        color: '#10b981', // Emerald / Green
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badgeVariant: 'success',
      };
  }
};

/**
 * Extracts the latest record for each unique equipment
 */
export const getUniqueLatestEquipment = (data: VibrationData[]): VibrationData[] => {
  const map = new Map<string, VibrationData>();
  data.forEach((item) => {
    if (!item.equipmentName) return;
    const existing = map.get(item.equipmentName);
    if (!existing) {
      map.set(item.equipmentName, item);
    } else {
      const existingDate = parseDateInfo(existing.date).timestamp || 0;
      const currentDate = parseDateInfo(item.date).timestamp || 0;
      if (currentDate >= existingDate) {
        map.set(item.equipmentName, item);
      }
    }
  });
  return Array.from(map.values());
};

/**
 * Compute condition distribution of unique equipment based on their latest state
 */
export const getUniqueConditionDistribution = (data: VibrationData[]) => {
  const latestEquipment = getUniqueLatestEquipment(data);
  let normal = 0;
  let alert = 0;
  let alarm = 0;

  latestEquipment.forEach((item) => {
    const status = normalizeCondition(item.condition);
    if (status === 'Alarm') alarm++;
    else if (status === 'Alert') alert++;
    else normal++;
  });

  const total = latestEquipment.length;

  return {
    total,
    normal,
    alert,
    alarm,
    pieData: [
      { name: 'Normal', value: normal, color: '#10b981', percentage: total ? ((normal / total) * 100).toFixed(1) : '0' },
      { name: 'Alert', value: alert, color: '#f59e0b', percentage: total ? ((alert / total) * 100).toFixed(1) : '0' },
      { name: 'Alarm', value: alarm, color: '#ef4444', percentage: total ? ((alarm / total) * 100).toFixed(1) : '0' },
    ].filter(item => item.value > 0),
  };
};

/**
 * Calculates point-wise peak velocity and acceleration for a vibration record
 */
export const getRecordPeakValues = (item: VibrationData) => {
  const points = [
    { name: '01 (Motor NDE)', m: item.measurements.point01 },
    { name: '02 (Motor DE)', m: item.measurements.point02 },
    { name: '03 (Driven DE)', m: item.measurements.point03 },
    { name: '04 (Driven NDE)', m: item.measurements.point04 },
  ];

  let peakVel = 0;
  let peakVelPoint = '01';
  let peakAccel = 0;
  let peakAccelPoint = '01';

  points.forEach((p) => {
    const maxV = Math.max(p.m?.av || 0, p.m?.hv || 0, p.m?.vv || 0);
    if (maxV > peakVel) {
      peakVel = maxV;
      peakVelPoint = p.name;
    }
    const acc = p.m?.hvg || 0;
    if (acc > peakAccel) {
      peakAccel = acc;
      peakAccelPoint = p.name;
    }
  });

  return {
    peakVelocity: Number(peakVel.toFixed(2)),
    peakVelocityPoint: peakVelPoint,
    peakAcceleration: Number(peakAccel.toFixed(2)),
    peakAccelerationPoint: peakAccelPoint,
  };
};

/**
 * Calculates Month-Year Column Chart data
 * Vertical columns with 3 split condition colors and total unique equipment on top
 */
export const getMonthlyColumnChartData = (data: VibrationData[]) => {
  const groups: Record<
    string,
    {
      monthKey: string;
      monthLabel: string;
      timestamp: number;
      itemsByEquipment: Map<string, VibrationData>;
    }
  > = {};

  data.forEach((item) => {
    if (!item.date) return;
    const dateInfo = parseDateInfo(item.date);
    if (!dateInfo.monthKey) return;

    if (!groups[dateInfo.monthKey]) {
      groups[dateInfo.monthKey] = {
        monthKey: dateInfo.monthKey,
        monthLabel: dateInfo.monthLabel,
        timestamp: dateInfo.timestamp,
        itemsByEquipment: new Map<string, VibrationData>(),
      };
    }

    // Keep the latest record for that equipment within the specific month
    const existing = groups[dateInfo.monthKey].itemsByEquipment.get(item.equipmentName);
    if (
      !existing ||
      parseDateInfo(item.date).timestamp >= parseDateInfo(existing.date).timestamp
    ) {
      groups[dateInfo.monthKey].itemsByEquipment.set(item.equipmentName, item);
    }
  });

  const sortedGroups = Object.values(groups).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey)
  );

  return sortedGroups.map((grp) => {
    let normalCount = 0;
    let alertCount = 0;
    let alarmCount = 0;

    grp.itemsByEquipment.forEach((item) => {
      const cond = normalizeCondition(item.condition);
      if (cond === 'Alarm') alarmCount++;
      else if (cond === 'Alert') alertCount++;
      else normalCount++;
    });

    const totalUnique = grp.itemsByEquipment.size;

    return {
      monthKey: grp.monthKey,
      month: grp.monthLabel,
      totalUnique,
      Normal: normalCount,
      Alert: alertCount,
      Alarm: alarmCount,
    };
  });
};

/**
 * Top 10 Defenders / Bad Actors: Calculate top equipment with highest vibration defects
 */
export const calculateTopDefenders = (data: VibrationData[], limit = 10): EquipmentDefectMetric[] => {
  const equipGroups = new Map<string, VibrationData[]>();

  data.forEach((item) => {
    if (!item.equipmentName) return;
    const list = equipGroups.get(item.equipmentName) || [];
    list.push(item);
    equipGroups.set(item.equipmentName, list);
  });

  const metrics: EquipmentDefectMetric[] = [];

  equipGroups.forEach((records, equipmentName) => {
    // Sort latest first
    const sorted = [...records].sort(
      (a, b) => parseDateInfo(b.date).timestamp - parseDateInfo(a.date).timestamp
    );
    const latest = sorted[0];
    const condition = normalizeCondition(latest.condition);

    let alarmCount = 0;
    let alertCount = 0;
    let maxOverallVel = 0;
    let maxVelPoint = '';
    let maxOverallAccel = 0;
    let maxAccelPoint = '';

    const defectCategories = new Set<string>();

    records.forEach((rec) => {
      const c = normalizeCondition(rec.condition);
      if (c === 'Alarm') alarmCount++;
      else if (c === 'Alert') alertCount++;

      const peaks = getRecordPeakValues(rec);
      if (peaks.peakVelocity > maxOverallVel) {
        maxOverallVel = peaks.peakVelocity;
        maxVelPoint = peaks.peakVelocityPoint;
      }
      if (peaks.peakAcceleration > maxOverallAccel) {
        maxOverallAccel = peaks.peakAcceleration;
        maxAccelPoint = peaks.peakAccelerationPoint;
      }

      const obs = (rec.observation || '').toLowerCase();
      if (obs.includes('bearing')) defectCategories.add('Bearing Defect');
      if (obs.includes('looseness') || obs.includes('clearance')) defectCategories.add('Mechanical Looseness');
      if (obs.includes('misalignment')) defectCategories.add('Misalignment');
      if (obs.includes('unbalance')) defectCategories.add('Unbalance');
      if (obs.includes('lubricat')) defectCategories.add('Lubrication Deficit');
      if (obs.includes('envelop') || obs.includes('acceleration')) defectCategories.add('High Envelop g');
    });

    if (defectCategories.size === 0) {
      if (condition === 'Alarm') defectCategories.add('High Vibration Alarm');
      else if (condition === 'Alert') defectCategories.add('Warning Level Vibration');
      else defectCategories.add('Normal Operation');
    }

    // Problem Score formula (0 to 100):
    // Status weight (Alarm = 40, Alert = 20, Normal = 0)
    // Peak velocity weight (ISO 10816 Class 2 alarm > 4.5 mm/s): (vel / 4.5) * 30, max 35
    // Peak acceleration weight (alarm > 5.0 g): (accel / 10) * 25, max 25
    // Defect count weight: 5 per defect category
    let score = 0;
    if (condition === 'Alarm') score += 40;
    else if (condition === 'Alert') score += 20;

    const velScore = Math.min(35, (maxOverallVel / 4.5) * 25);
    const accelScore = Math.min(25, (maxOverallAccel / 10) * 20);
    const defectScore = Math.min(15, defectCategories.size * 5);

    score += velScore + accelScore + defectScore;
    const finalScore = Math.min(100, Math.round(score));

    metrics.push({
      equipmentName,
      area: latest.area || 'Power Plant',
      driven: latest.driven || 'Machine',
      class: latest.class || '2',
      latestDate: latest.date,
      condition,
      rawCondition: latest.condition,
      peakVelocity: maxOverallVel,
      peakVelocityPoint: maxVelPoint || '01',
      peakAcceleration: maxOverallAccel,
      peakAccelerationPoint: maxAccelPoint || '01',
      problemScore: finalScore,
      alarmCount,
      alertCount,
      totalRecords: records.length,
      latestObservation: latest.observation || 'No active defects logged',
      latestRecommendation: latest.recommendation || 'Continue routine monitoring',
      defectCategories: Array.from(defectCategories),
    });
  });

  // Sort descending by problem score, then by condition priority, then by peak velocity
  return metrics
    .sort((a, b) => {
      if (b.problemScore !== a.problemScore) return b.problemScore - a.problemScore;
      if (b.peakVelocity !== a.peakVelocity) return b.peakVelocity - a.peakVelocity;
      return b.peakAcceleration - a.peakAcceleration;
    })
    .slice(0, limit);
};

/**
 * Generate notifications for the top bell notification popover
 */
export const generateNotifications = (data: VibrationData[]): AppNotification[] => {
  const latestUnique = getUniqueLatestEquipment(data);
  const notifications: AppNotification[] = [];

  latestUnique.forEach((item) => {
    const status = normalizeCondition(item.condition);
    const peaks = getRecordPeakValues(item);

    if (status === 'Alarm') {
      notifications.push({
        id: `alarm-${item.equipmentName}-${item.date}`,
        equipmentName: item.equipmentName,
        type: 'Alarm',
        title: `CRITICAL ALARM: ${item.equipmentName}`,
        message: item.observation || `High vibration recorded (${peaks.peakVelocity} mm/s, ${peaks.peakAcceleration} g).`,
        timestamp: item.date || 'Recent',
        read: false,
        measurementSummary: `Peak Vel: ${peaks.peakVelocity} mm/s • Accel: ${peaks.peakAcceleration} g`,
      });
    } else if (status === 'Alert') {
      notifications.push({
        id: `alert-${item.equipmentName}-${item.date}`,
        equipmentName: item.equipmentName,
        type: 'Alert',
        title: `ALERT WARNING: ${item.equipmentName}`,
        message: item.observation || `Elevated vibration detected. Clearance inspection advised.`,
        timestamp: item.date || 'Recent',
        read: false,
        measurementSummary: `Peak Vel: ${peaks.peakVelocity} mm/s • Accel: ${peaks.peakAcceleration} g`,
      });
    }
  });

  return notifications;
};

/**
 * Auto-generate workorders from vibration recommendations
 */
export const generateInitialWorkOrders = (data: VibrationData[]): WorkOrder[] => {
  const latestEquipment = getUniqueLatestEquipment(data);
  const workOrders: WorkOrder[] = [];

  latestEquipment
    .filter((item) => normalizeCondition(item.condition) !== 'Normal' || (item.recommendation && item.recommendation.length > 5))
    .forEach((item, index) => {
      const status = normalizeCondition(item.condition);
      const peaks = getRecordPeakValues(item);

      let priority: WorkOrder['priority'] = 'Low';
      if (status === 'Alarm') priority = 'Emergency';
      else if (status === 'Alert') priority = 'High';
      else priority = 'Medium';

      const woStatus: WorkOrder['status'] = status === 'Alarm' ? 'Open' : index % 2 === 0 ? 'In Progress' : 'Open';

      workOrders.push({
        id: `WO-${String(index + 101).padStart(4, '0')}`,
        equipmentName: item.equipmentName,
        area: item.area || 'Power Plant',
        driven: item.driven || 'General',
        title: `${item.equipmentName} - ${status === 'Alarm' ? 'Urgent Vibration Correction' : 'Preventive Maintenance'}`,
        description: item.observation || 'Bearing vibration analysis indicated anomalies.',
        recommendation: item.recommendation || 'Inspect bearings, base tightness, and alignment.',
        priority,
        status: woStatus,
        assignedTo: index % 3 === 0 ? 'Vikram Mehta (Lead Tech)' : index % 3 === 1 ? 'Rajesh Patel (Vibe Specialist)' : 'Amit Sharma (Mechanical Eng)',
        createdAt: item.date || new Date().toISOString().split('T')[0],
        dueDate: '2026-09-15',
        peakVibe: `${peaks.peakVelocity} mm/s | ${peaks.peakAcceleration} g`,
      });
    });

  return workOrders;
};
