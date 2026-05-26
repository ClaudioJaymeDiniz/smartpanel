export interface AnalyticsSeriesItem {
  label: string;
  count: number;
}

export interface AnalyticsField {
  fieldId: string;
  label: string;
  type: string;
  totalAnswered: number;
  emptyCount: number;
  chart: 'pie' | 'bar' | 'line' | string;
  series: AnalyticsSeriesItem[];
  stats?: Record<string, number> | null;
}

export interface DailySubmissionItem {
  date: string;
  count: number;
}

export interface FormAnalytics {
  formId: string;
  title: string;
  totalSubmissions: number;
  completionRate: number;
  dailySubmissions: DailySubmissionItem[];
  fields: AnalyticsField[];
}
