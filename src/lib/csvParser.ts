import Papa from 'papaparse';
import { VibrationData } from '@/types/vibration';

export const parseVibrationData = async (csvUrl: string): Promise<VibrationData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          srNo: parseInt(row['Sr No']) || 0,
          equipmentName: row['Equipment Name'] || '',
          class: row['Class'] || '',
          area: row['Area'] || '',
          observation: row['Observation'] || '',
          recommendation: row['Recommendation'] || '',
          driven: row['Driving Equipment'] || '',
          date: row['Date'] || '',
          condition: row['Condition'] || '',
          measurements: {
            point01: {
              av: parseFloat(row['01AV']) || 0,
              hv: parseFloat(row['01HV']) || 0,
              hvg: parseFloat(row['01HVg']) || 0,
              vv: parseFloat(row['01VV']) || 0,
            },
            point02: {
              av: parseFloat(row['02AV']) || 0,
              hv: parseFloat(row['02HV']) || 0,
              hvg: parseFloat(row['02HVg']) || 0,
              vv: parseFloat(row['02VV']) || 0,
            },
            point03: {
              av: parseFloat(row['03AV']) || 0,
              hv: parseFloat(row['03HV']) || 0,
              hvg: parseFloat(row['03HVg']) || 0,
              vv: parseFloat(row['03VV']) || 0,
            },
            point04: {
              av: parseFloat(row['04AV']) || 0,
              hv: parseFloat(row['04HV']) || 0,
              hvg: parseFloat(row['04HVg']) || 0,
              vv: parseFloat(row['04VV']) || 0,
            },
          },
        }));
        resolve(data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const getConditionColor = (condition: string): string => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('good')) return 'success';
  if (lowerCondition.includes('minor')) return 'primary';
  if (lowerCondition.includes('alert')) return 'warning';
  if (lowerCondition.includes('alarm')) return 'destructive';
  return 'muted';
};
