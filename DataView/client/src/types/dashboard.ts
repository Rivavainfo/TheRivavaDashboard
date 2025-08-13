export interface DataRow {
  [key: string]: any;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  trend: number;
  trendDirection: 'up' | 'down';
  icon: string;
  color: string;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  icon: string;
}

export interface DataSource {
  type: 'csv' | 'firebase';
  data: DataRow[];
  lastUpdated: Date;
  isConnected: boolean;
}

export interface FirebaseConfig {
  projectId: string;
  collectionName: string;
}
