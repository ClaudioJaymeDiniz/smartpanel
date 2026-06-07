import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { getFormAnalytics } from '@/services/analyticsService';
import type { AnalyticsField, FormAnalytics } from '@/types/analytics';
import { THEME } from '@/styles/theme';

type ChartKind = 'bar' | 'pie' | 'line';
type ChartDataItem = { label: string; value: number };

const ACCENT = THEME.colors.primary;
const CHART_COLORS = ['#059669', '#0EA5A3', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function normalizeChartKind(value: string | undefined): ChartKind {
  return value === 'pie' || value === 'line' || value === 'bar' ? value : 'bar';
}

function formatPercent(value: number): string {
  const normalizedValue = value > 1 ? value : value * 100;
  return `${normalizedValue.toFixed(1)}%`;
}

function formatDateLabel(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year.slice(-2)}`;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildPdfHtml(analytics: FormAnalytics): string {
  const dailyRows = analytics.dailySubmissions
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(formatDateLabel(item.date))}</td>
          <td>${item.count}</td>
        </tr>`
    )
    .join('');

  const fieldSections = analytics.fields
    .map((field) => {
      const total = field.series.reduce((sum, item) => sum + item.count, 0);
      const rows = field.series
        .map((item) => {
          const ratio = total > 0 ? item.count / total : 0;
          return `
            <tr>
              <td>${escapeHtml(item.label)}</td>
              <td>${item.count}</td>
              <td>${formatPercent(ratio)}</td>
            </tr>`;
        })
        .join('');

      const statsLabel = buildStatsLabel(field.stats);

      return `
        <section>
          <h2>${escapeHtml(field.label)}</h2>
          <p>Tipo: ${escapeHtml(field.type)} | Respondido: ${field.totalAnswered}</p>
          ${statsLabel ? `<p>${escapeHtml(statsLabel)}</p>` : ''}
          <table>
            <thead>
              <tr><th>Resposta</th><th>Quantidade</th><th>Percentual</th></tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="3">Sem valores para este campo.</td></tr>'}</tbody>
          </table>
        </section>`;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
          h1 { font-size: 24px; margin: 0 0 6px; }
          h2 { font-size: 16px; margin: 24px 0 6px; }
          p { color: #475569; margin: 4px 0 12px; }
          .summary { display: flex; gap: 12px; margin: 18px 0; }
          .metric { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; flex: 1; }
          .metric strong { display: block; font-size: 22px; color: ${ACCENT}; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f8fafc; }
          section { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(analytics.title || 'Analytics do formulário')}</h1>
        <p>Relatório exportado do dashboard.</p>
        <div class="summary">
          <div class="metric"><strong>${analytics.totalSubmissions}</strong>Total de respostas</div>
          <div class="metric"><strong>${formatPercent(analytics.completionRate)}</strong>Taxa de preenchimento</div>
        </div>
        <section>
          <h2>Respostas por dia</h2>
          <table>
            <thead><tr><th>Data</th><th>Quantidade</th></tr></thead>
            <tbody>${dailyRows || '<tr><td colspan="2">Sem respostas no período.</td></tr>'}</tbody>
          </table>
        </section>
        ${fieldSections}
      </body>
    </html>`;
}

function MiniBarChart({ data, emptyLabel }: { data: ChartDataItem[]; emptyLabel: string }) {
  const maxValue = useMemo(() => Math.max(...data.map((item) => item.value), 1), [data]);

  if (data.length === 0) return <Text style={styles.emptyChartText}>{emptyLabel}</Text>;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chartScrollContent}>
      {data.map((item, index) => {
        const normalizedValue = Math.max(item.value, 0.1);
        const spacer = Math.max(maxValue - normalizedValue, 0.1);
        const color = CHART_COLORS[index % CHART_COLORS.length];

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

function PieChart({ data, emptyLabel }: { data: ChartDataItem[]; emptyLabel: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (data.length === 0 || total === 0)
    return <Text style={styles.emptyChartText}>{emptyLabel}</Text>;

  return (
    <View style={styles.pieWrap}>
      <Svg width={136} height={136} viewBox="0 0 136 136">
        <G rotation="-90" origin="68, 68">
          {data.map((item, index) => {
            const ratio = item.value / total;
            const dashLength = ratio * circumference;
            const dashOffset = -offset;
            offset += dashLength;

            return (
              <Circle
                key={`${item.label}-${index}`}
                cx="68"
                cy="68"
                r={radius}
                fill="none"
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                strokeWidth="28"
              />
            );
          })}
        </G>
        <Circle cx="68" cy="68" r="34" fill="#FFFFFF" />
        <SvgText x="68" y="64" textAnchor="middle" fill="#0F172A" fontSize="18" fontWeight="700">
          {total}
        </SvgText>
        <SvgText x="68" y="82" textAnchor="middle" fill="#64748B" fontSize="10">
          total
        </SvgText>
      </Svg>

      <View style={styles.legendWrap}>
        {data.map((item, index) => {
          const ratio = item.value / total;
          return (
            <View style={styles.legendRow} key={`${item.label}-legend-${index}`}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
                ]}
              />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.legendValue}>{formatPercent(ratio)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function LineChart({ data, emptyLabel }: { data: ChartDataItem[]; emptyLabel: string }) {
  const width = Math.max(data.length * 54, 260);
  const height = 154;
  const paddingX = 24;
  const top = 16;
  const bottom = 42;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const chartHeight = height - top - bottom;

  if (data.length === 0) return <Text style={styles.emptyChartText}>{emptyLabel}</Text>;

  const points = data.map((item, index) => {
    const availableWidth = width - paddingX * 2;
    const x =
      data.length === 1 ? width / 2 : paddingX + (availableWidth / (data.length - 1)) * index;
    const y = top + chartHeight - (item.value / maxValue) * chartHeight;
    return { ...item, x, y };
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={width} height={height}>
        <Line
          x1={paddingX}
          y1={top + chartHeight}
          x2={width - paddingX}
          y2={top + chartHeight}
          stroke="#CBD5E1"
          strokeWidth="1"
        />
        <Line
          x1={paddingX}
          y1={top}
          x2={paddingX}
          y2={top + chartHeight}
          stroke="#CBD5E1"
          strokeWidth="1"
        />
        <Polyline
          points={points.map((point) => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke={ACCENT}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {points.map((point, index) => (
          <G key={`${point.label}-${index}`}>
            <Circle cx={point.x} cy={point.y} r="4" fill={ACCENT} />
            <SvgText x={point.x} y={point.y - 8} textAnchor="middle" fill="#475569" fontSize="10">
              {point.value}
            </SvgText>
            <SvgText x={point.x} y={height - 14} textAnchor="middle" fill="#64748B" fontSize="10">
              {point.label.length > 8 ? `${point.label.slice(0, 7)}…` : point.label}
            </SvgText>
          </G>
        ))}
      </Svg>
    </ScrollView>
  );
}

function InteractiveFieldCard({
  field,
  totalSubmissions,
}: {
  field: AnalyticsField;
  totalSubmissions: number;
}) {
  const [currentChart, setCurrentChart] = useState<ChartKind>(normalizeChartKind(field.chart));

  const chartData = useMemo(
    () =>
      field.series
        .filter((item) => item.count > 0)
        .map((item) => ({ label: item.label, value: item.count })),
    [field.series]
  );
  const statsLabel = buildStatsLabel(field.stats);
  const answeredRate = totalSubmissions ? field.totalAnswered / totalSubmissions : 0;

  return (
    <View style={styles.cardGrafico}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.chartTitle}>{field.label}</Text>
          <Text style={styles.chartMeta}>
            Tipo: {field.type} | Respondido: {field.totalAnswered} ({formatPercent(answeredRate)})
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            accessibilityLabel="Ver gráfico de barras"
            style={[styles.toggleBtn, currentChart === 'bar' && styles.toggleBtnActive]}
            onPress={() => setCurrentChart('bar')}>
            <Ionicons
              name="bar-chart"
              size={15}
              color={currentChart === 'bar' ? '#FFF' : '#64748B'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Ver gráfico de pizza"
            style={[styles.toggleBtn, currentChart === 'pie' && styles.toggleBtnActive]}
            onPress={() => setCurrentChart('pie')}>
            <Ionicons
              name="pie-chart"
              size={15}
              color={currentChart === 'pie' ? '#FFF' : '#64748B'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Ver gráfico de linha"
            style={[styles.toggleBtn, currentChart === 'line' && styles.toggleBtnActive]}
            onPress={() => setCurrentChart('line')}>
            <Ionicons
              name="trending-up"
              size={15}
              color={currentChart === 'line' ? '#FFF' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {statsLabel ? <Text style={styles.statsLine}>{statsLabel}</Text> : null}

      <View style={styles.chartArea}>
        {currentChart === 'pie' ? (
          <PieChart data={chartData} emptyLabel="Sem distribuição para este campo." />
        ) : currentChart === 'line' ? (
          <LineChart data={chartData} emptyLabel="Sem pontos para exibir em linha." />
        ) : (
          <MiniBarChart data={chartData} emptyLabel="Sem valores para este campo." />
        )}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const params = useLocalSearchParams<{
    formularioId?: string | string[];
    id?: string | string[];
  }>();
  const formId = normalizeParam(params.formularioId) || normalizeParam(params.id);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!formId) {
      setErrorMessage('ID do formulário não informado na rota.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!refreshing) setLoading(true);

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

  const handleExportPdf = useCallback(async () => {
    if (!analytics || exporting) return;

    try {
      setExporting(true);
      const { uri } = await Print.printToFileAsync({
        html: buildPdfHtml(analytics),
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar dashboard',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF gerado', `Arquivo criado em: ${uri}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível gerar o PDF.';
      Alert.alert('Erro ao exportar PDF', message);
    } finally {
      setExporting(false);
    }
  }, [analytics, exporting]);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  const completionRate = analytics?.completionRate ?? 0;
  const dailyData = useMemo(
    () =>
      (analytics?.dailySubmissions || []).map((item) => ({
        label: formatDateLabel(item.date),
        value: item.count,
      })),
    [analytics?.dailySubmissions]
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Dashboard' }} />

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
          }>
          <View style={styles.pageHeader}>
            <View style={styles.pageTitleWrap}>
              <Text style={styles.title}>{analytics?.title || 'Analytics do formulário'}</Text>
              <Text style={styles.subtitle}>Painel dinâmico por tipo de campo</Text>
            </View>

            <TouchableOpacity
              accessibilityLabel="Exportar dashboard em PDF"
              disabled={!analytics || exporting}
              style={[
                styles.exportButton,
                (!analytics || exporting) && styles.exportButtonDisabled,
              ]}
              onPress={handleExportPdf}>
              {exporting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.exportButtonText}>{exporting ? 'Gerando' : 'PDF'}</Text>
            </TouchableOpacity>
          </View>

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
            <LineChart data={dailyData} emptyLabel="Sem respostas para exibir no período." />
          </View>

          {(analytics?.fields || []).map((field) => (
            <InteractiveFieldCard
              key={field.fieldId}
              field={field}
              totalSubmissions={analytics?.totalSubmissions ?? 0}
            />
          ))}

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
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pageTitleWrap: { flex: 1 },
  title: { fontSize: 24, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
  subtitle: { marginTop: 4, color: THEME.colors.textSecondary, fontFamily: 'Manrope-Regular' },
  exportButton: {
    height: 40,
    minWidth: 84,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  exportButtonDisabled: { opacity: 0.55 },
  exportButtonText: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Jakarta-Bold' },
  row: { flexDirection: 'row', gap: 12 },
  cardMini: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  cardValue: { fontSize: 26, fontFamily: 'Jakarta-Bold', color: ACCENT },
  cardLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    fontFamily: 'Manrope-Regular',
  },
  cardGrafico: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardTitleWrap: { flex: 1 },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Jakarta-Bold',
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  chartMeta: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    fontFamily: 'Manrope-Regular',
  },
  statsLine: { fontSize: 12, color: '#334155', marginBottom: 10, fontFamily: 'Manrope-Regular' },
  chartArea: { marginTop: 8 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: ACCENT },
  chartScrollContent: { paddingRight: 8, gap: 10 },
  barItem: { width: 58, alignItems: 'center' },
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
  barSpacer: { width: '100%' },
  barFill: { width: '100%', borderRadius: 7 },
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
  pieWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legendWrap: { flex: 1, gap: 7 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontFamily: 'Manrope-Regular',
  },
  legendValue: { color: THEME.colors.textSecondary, fontSize: 12, fontFamily: 'Manrope-Regular' },
  emptyChartText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: 'Manrope-Regular',
  },
  errorCard: {
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    gap: 8,
  },
  errorTitle: { fontSize: 15, color: '#991B1B', fontFamily: 'Jakarta-Bold' },
  errorText: { color: '#B91C1C', fontFamily: 'Manrope-Regular' },
  retryButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  retryText: { color: '#991B1B', fontFamily: 'Jakarta-Bold', fontSize: 12 },
});
