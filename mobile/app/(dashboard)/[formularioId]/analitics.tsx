import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { getFormAnalytics } from '@/services/analyticsService';
import type { AnalyticsField, FormAnalytics } from '@/types/analytics';
import { THEME } from '@/styles/theme';

const ACCENT = THEME.colors.primary;
const BAR_COLORS = ['#059669', '#0EA5A3', '#3B82F6', '#F59E0B', '#EF4444'];

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function buildStatsLabel(stats: Record<string, number> | null | undefined): string | null {
  if (!stats) return null;

  const entries = Object.entries(stats);
  if (entries.length === 0) return null;

  return entries
    .map(([key, rawValue]) => {
      const value = Number.isInteger(rawValue) ? rawValue : Number(rawValue.toFixed(2));
      return `${key}: ${value}`;
    })
    .join(' | ');
}

function MiniBarChart({
  data,
  emptyLabel,
}: {
  data: Array<{ label: string; value: number }>;
  emptyLabel: string;
}) {
  const maxValue = useMemo(() => {
    const values = data.map((item) => item.value);
    return Math.max(...values, 1);
  }, [data]);

  if (data.length === 0) {
    return <Text style={styles.emptyChartText}>{emptyLabel}</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScrollContent}>
      {data.map((item, index) => {
        const normalizedValue = Math.max(item.value, 0.1);
        const spacer = Math.max(maxValue - normalizedValue, 0.1);
        const color = BAR_COLORS[index % BAR_COLORS.length];

        return (
          <View style={styles.barItem} key={`${item.label}-${index}`}>
            <Text style={styles.barValue}>{item.value}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barSpacer, { flex: spacer }]} />
              <View style={[styles.barFill, { flex: normalizedValue, backgroundColor: color }]} />
            </View>
            <Text style={styles.barLabel} numberOfLines={2}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function DistributionList({
  data,
  emptyLabel,
}: {
  data: Array<{ label: string; value: number }>;
  emptyLabel: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0 || total === 0) {
    return <Text style={styles.emptyChartText}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.distributionWrap}>
      {data.map((item, index) => {
        const ratio = item.value / total;
        const color = BAR_COLORS[index % BAR_COLORS.length];

        return (
          <View style={styles.distributionRow} key={`${item.label}-${index}`}>
            <View style={styles.distributionHeader}>
              <Text style={styles.distributionLabel}>{item.label}</Text>
              <Text style={styles.distributionValue}>
                {item.value} ({formatPercent(ratio)})
              </Text>
            </View>
            <View style={styles.distributionTrack}>
              <View style={[styles.distributionFill, { width: `${Math.max(ratio * 100, 2)}%`, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function FieldChart({ field }: { field: AnalyticsField }) {
  const chartData = field.series.map((item) => ({ label: item.label, value: item.count }));

  if (field.chart === 'pie') {
    return <DistributionList data={chartData} emptyLabel="Sem distribuicao para este campo." />;
  }

  if (field.chart === 'line') {
    return <MiniBarChart data={chartData} emptyLabel="Sem pontos de serie temporal." />;
  }

  return <MiniBarChart data={chartData} emptyLabel="Sem valores para este campo." />;
}

export default function AnalyticsScreen() {
  const params = useLocalSearchParams<{ formularioId?: string | string[]; id?: string | string[] }>();
  const formId = normalizeParam(params.formularioId) || normalizeParam(params.id);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!formId) {
      setErrorMessage('ID do formulario nao informado na rota.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!refreshing) {
      setLoading(true);
    }

    try {
      const response = await getFormAnalytics(formId);
      setAnalytics(response);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar analytics.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [formId, refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  const completionRate = analytics?.completionRate ?? 0;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Analytics do formulario' }} />

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadAnalytics();
              }}
              colors={[ACCENT]}
            />
          }
        >
          <Text style={styles.title}>{analytics?.title || 'Analytics do formulario'}</Text>
          <Text style={styles.subtitle}>Painel dinamico por tipo de campo</Text>

          <View style={styles.row}>
            <View style={styles.cardMini}>
              <Text style={styles.cardValue}>{analytics?.totalSubmissions ?? 0}</Text>
              <Text style={styles.cardLabel}>Total de respostas</Text>
            </View>
            <View style={styles.cardMini}>
              <Text style={styles.cardValue}>{formatPercent(completionRate)}</Text>
              <Text style={styles.cardLabel}>Taxa de preenchimento</Text>
            </View>
          </View>

          <View style={styles.cardGrafico}>
            <Text style={styles.chartTitle}>Respostas por dia</Text>
            <MiniBarChart
              data={(analytics?.dailySubmissions || []).map((item) => ({
                label: item.date,
                value: item.count,
              }))}
              emptyLabel="Sem respostas para exibir no periodo."
            />
          </View>

          {(analytics?.fields || []).map((field) => {
            const statsLabel = buildStatsLabel(field.stats);
            const answeredRate = analytics?.totalSubmissions
              ? (field.totalAnswered / analytics.totalSubmissions) * 100
              : 0;

            return (
              <View style={styles.cardGrafico} key={field.fieldId}>
                <Text style={styles.chartTitle}>{field.label}</Text>
                <Text style={styles.chartMeta}>
                  Tipo: {field.type} | Respondido: {field.totalAnswered} ({answeredRate.toFixed(1)}%)
                </Text>

                {statsLabel ? <Text style={styles.statsLine}>{statsLabel}</Text> : null}

                <FieldChart field={field} />
              </View>
            );
          })}

          {errorMessage ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Erro ao carregar analytics</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.colors.background },
  container: { flex: 1, backgroundColor: THEME.colors.background },
  content: { padding: 16, gap: 14, paddingBottom: 36 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 24,
    fontFamily: 'Jakarta-Bold',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    color: THEME.colors.textSecondary,
    fontFamily: 'Manrope-Regular',
  },
  row: { flexDirection: 'row', gap: 12 },
  cardMini: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  cardValue: {
    fontSize: 26,
    fontFamily: 'Jakarta-Bold',
    color: ACCENT,
  },
  cardLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    fontFamily: 'Manrope-Regular',
  },
  cardGrafico: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Jakarta-Bold',
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  chartMeta: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'Manrope-Regular',
  },
  statsLine: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 10,
    fontFamily: 'Manrope-Regular',
  },
  chartScrollContent: {
    paddingRight: 8,
    gap: 10,
  },
  barItem: {
    width: 58,
    alignItems: 'center',
  },
  barTrack: {
    width: 34,
    height: 120,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  barSpacer: {
    width: '100%',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barValue: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    fontFamily: 'Manrope-Regular',
  },
  barLabel: {
    marginTop: 6,
    fontSize: 11,
    textAlign: 'center',
    color: '#475569',
    fontFamily: 'Manrope-Regular',
  },
  distributionWrap: {
    gap: 10,
  },
  distributionRow: {
    gap: 6,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionLabel: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.textPrimary,
    fontFamily: 'Manrope-Regular',
    marginRight: 8,
  },
  distributionValue: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: 'Manrope-Regular',
  },
  distributionTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 999,
  },
  emptyChartText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: 'Manrope-Regular',
  },
  errorCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    gap: 8,
  },
  errorTitle: {
    fontSize: 15,
    color: '#991B1B',
    fontFamily: 'Jakarta-Bold',
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Manrope-Regular',
  },
  retryButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
  },
  retryText: {
    color: '#991B1B',
    fontFamily: 'Jakarta-Bold',
    fontSize: 12,
  },
});
