import { api } from '@/services/api';
import axios from 'axios';
import { ISubmissionRepository } from '@/core/forms/domain/repositories/ISubmissionRepository';
import { Submission, SubmissionCreate } from '@/core/forms/domain/entities/Submission';
import { SubmissionMapper } from '@/core/forms/mappers/SubmissionMapper';
import { normalizeSubmissionFormData } from '@/services/formImage';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('smartpanel.db');

async function queueSubmission(endpoint: string, payload: any, method: 'POST' | 'PATCH') {
  db.runSync(
    'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
    [endpoint, JSON.stringify(payload), method, 'pending']
  );
}

function createLocalSubmission(data: SubmissionCreate): Submission {
  return {
    id: data.id,
    formData: data.formData,
    formId: data.formId,
    userId: 'local-user',
    createdAt: new Date(),
  } as Submission;
}

export class SubmissionRepositoryImpl implements ISubmissionRepository {
  
  // 1. ENVIAR RESPOSTA (O coração do Sync Offline)
  async send(data: SubmissionCreate): Promise<Submission> {
    let normalizedData = data;

    try {
      normalizedData = {
        ...data,
        formData: await normalizeSubmissionFormData(data.formData),
      };
    } catch (uploadError) {
      if (axios.isAxiosError(uploadError) && !uploadError.response) {
        await queueSubmission('/submissions/', data, 'POST');
        console.log(`Submissao ${data.id} salva localmente para sincronizacao futura.`);
        return createLocalSubmission(data);
      }

      throw uploadError;
    }

    try {
      // Tenta enviar para o FastAPI no Linux Mint
      const response = await api.post('/submissions/', normalizedData);
      return SubmissionMapper.toDomain(response.data);
    } catch (error) {
      // Só trata como offline quando não há resposta HTTP.
      // Em caso de 4xx/5xx do backend, propagamos erro para a UI.
      if (axios.isAxiosError(error) && !error.response) {
        await queueSubmission('/submissions/', normalizedData, 'POST');

        console.log(`Submissao ${data.id} salva localmente para sincronizacao futura.`);

        return createLocalSubmission(normalizedData);
      }

      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as any)?.detail;
        throw new Error(detail || 'Falha ao enviar resposta para o servidor.');
      }

      throw error;
    }
  }

  // 2. LISTAR MEU HISTÓRICO (Coletor vendo suas próprias respostas)
  async listMyHistory(): Promise<Submission[]> {
    try {
      const response = await api.get('/submissions/me');
      return SubmissionMapper.toDomainList(response.data);
    } catch (error) {
      // Opcional: Você pode criar uma tabela submissions_cache se quiser 
      // que o coletor veja o histórico dele offline.
      return []; 
    }
  }

  // 3. LISTAR POR FORMULÁRIO (Dono vendo os resultados)
  async listByForm(formId: string): Promise<Submission[]> {
    try {
      const response = await api.get(`/submissions/form/${formId}`);
      return SubmissionMapper.toDomainList(response.data);
    } catch (error) {
      console.warn("Offline: Não é possível listar respostas de terceiros sem conexão.");
      return [];
    }
  }

  // 4. ATUALIZAR RESPOSTA (Correção de dados)
  async update(id: string, formData: Record<string, any>): Promise<Submission> {
    let normalizedFormData = formData;

    try {
      normalizedFormData = await normalizeSubmissionFormData(formData);
    } catch (uploadError) {
      if (axios.isAxiosError(uploadError) && !uploadError.response) {
        await queueSubmission(`/submissions/${id}`, { formData }, 'PATCH');

        return {
          id,
          formData,
          userId: 'local-user',
          formId: 'unknown',
          createdAt: new Date(),
        } as Submission;
      }

      throw uploadError;
    }

    const payload = { formData: normalizedFormData };
    try {
      const response = await api.patch(`/submissions/${id}`, payload);
      return SubmissionMapper.toDomain(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        await queueSubmission(`/submissions/${id}`, payload, 'PATCH');

        return {
          id,
          formData: normalizedFormData,
          userId: 'local-user',
          formId: 'unknown',
          createdAt: new Date(),
        } as Submission;
      }

      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as any)?.detail;
        throw new Error(detail || 'Falha ao atualizar resposta no servidor.');
      }

      throw error;
    }
  }
}