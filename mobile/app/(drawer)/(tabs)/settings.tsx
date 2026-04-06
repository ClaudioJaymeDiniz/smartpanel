import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Container from '@/components/common/Container';
import SmartAlert from '@/components/common/SmartAlert';
import { THEME } from '@/styles/theme';
import { useSync } from '@/presentation/shared/hooks/useSync';
import { useAlert } from '@/presentation/shared/hooks/useAlert';
import { db } from '@/services/sqlite';

export default function Settings() {
  const { syncPendingActions, isSyncing } = useSync();
  const { alertConfig, showAlert, hideAlert } = useAlert();
  const [pendingCount, setPendingCount] = useState(0);

  // Função para contar quantos itens estão "presos" no SQLite
  const updatePendingCount = () => {
    try {
      const result = db.getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM sync_queue WHERE status = "pending"'
      );
      setPendingCount(result?.count || 0);
    } catch (error) {
      console.error("Erro ao contar fila:", error);
    }
  };

  useEffect(() => {
    updatePendingCount();
    // Atualiza a contagem a cada 5 segundos ou quando o componente focar
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (pendingCount === 0) {
      showAlert("Tudo em dia!", "Não existem dados pendentes para sincronização no momento.");
      return;
    }

    try {
      await syncPendingActions();
      updatePendingCount();
      showAlert("Sincronização Concluída", "Os dados foram enviados para o seu servidor Linux Mint.");
    } catch (error) {
      showAlert("Falha no Sync", "Verifique se o seu servidor backend está rodando corretamente.");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Ajustes do Sistema',
        headerTitleStyle: { fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary }
      }} />

      <SmartAlert {...alertConfig} onCancel={hideAlert} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Container>
          
          {/* Card de Status de Dados */}
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Ionicons 
                name={pendingCount > 0 ? "cloud-upload-outline" : "cloud-done-outline"} 
                size={32} 
                color={pendingCount > 0 ? THEME.colors.secondary : THEME.colors.primary} 
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Sincronização de Dados</Text>
              <Text style={styles.statusSubtitle}>
                {pendingCount > 0 
                  ? `Você tem ${pendingCount} item(s) aguardando conexão.` 
                  : "Todos os dados estão salvos na nuvem."}
              </Text>
            </View>
          </View>

          {/* Botão de Ação Manual */}
          <TouchableOpacity 
            style={[styles.syncButton, isSyncing && styles.disabledButton]} 
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="sync" size={20} color="#FFF" />
                <Text style={styles.syncButtonText}>Sincronizar Agora</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Seção de Informações Técnicas */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informações da Aplicação</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versão</Text>
              <Text style={styles.infoValue}>1.0.0-build.2026</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ambiente</Text>
              <Text style={styles.infoValue}>Produção (Linux Mint Server)</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Banco de Dados</Text>
              <Text style={styles.infoValue}>SQLite Local Ativo</Text>
            </View>
          </View>

          <View style={styles.creditsContainer}>
            <Text style={styles.creditsText}>SmartPanel Open Source Project</Text>
            <Text style={styles.developerText}>Desenvolvido por Claudio Jayme</Text>
          </View>

        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { paddingTop: 20 },
  
  statusCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 20
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  statusInfo: { flex: 1 },
  statusTitle: { ...THEME.fonts.title, fontSize: 16 },
  statusSubtitle: { ...THEME.fonts.body, fontSize: 13, color: THEME.colors.textSecondary },

  syncButton: {
    backgroundColor: THEME.colors.primary,
    height: 55,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 3,
    marginBottom: 40
  },
  disabledButton: { opacity: 0.7 },
  syncButtonText: { ...THEME.fonts.button },

  infoSection: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  sectionTitle: { ...THEME.fonts.title, fontSize: 16, marginBottom: 15 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.inputBg
  },
  infoLabel: { ...THEME.fonts.body, color: THEME.colors.textSecondary },
  infoValue: { ...THEME.fonts.body, fontFamily: 'Manrope-SemiBold', color: THEME.colors.textPrimary },

  creditsContainer: { marginTop: 40, alignItems: 'center', marginBottom: 20 },
  creditsText: { ...THEME.fonts.body, fontSize: 12, color: THEME.colors.textSecondary },
  developerText: { ...THEME.fonts.body, fontSize: 12, color: THEME.colors.primary, fontFamily: 'Manrope-SemiBold' }
});