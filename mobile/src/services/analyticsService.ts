import { api } from './api';
import { AnalyticsField, DailySubmissionItem, FormAnalytics } from '@/types/analytics';

type AnalyticsResponse = {
  formId?: string;
  title?: string;
  totalSubmissions?: number;
  total?: number;
  completionRate?: number;
  dailySubmissions?: DailySubmissionItem[];
  daily?: DailySubmissionItem[];
  fields?: AnalyticsField[];
  message?: string;
};

function buildEmptyAnalytics(formId: string): FormAnalytics {
  return {
    formId,
    title: 'Analytics do formulario',
    totalSubmissions: 0,
    completionRate: 0,
    dailySubmissions: [],
    fields: [],
  };
}

function normalizeAnalytics(response: AnalyticsResponse, formId: string): FormAnalytics {
  return {
    formId: response.formId ?? formId,
    title: response.title ?? 'Analytics do formulario',
    totalSubmissions: response.totalSubmissions ?? response.total ?? 0,
    completionRate: response.completionRate ?? 0,
    dailySubmissions: response.dailySubmissions ?? response.daily ?? [],
    fields: response.fields ?? [],
  };
}

export async function getFormAnalytics(formId: string): Promise<FormAnalytics> {
  try {
    const response = await api.get(`/forms/${formId}/analytics`);
    return normalizeAnalytics(response.data as AnalyticsResponse, formId);
  } catch (error) {
    return buildEmptyAnalytics(formId);
  }
}