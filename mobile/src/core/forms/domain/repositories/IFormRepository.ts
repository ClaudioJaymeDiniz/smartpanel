import { Form, FormCreate } from '../entities/Form';

export interface IFormRepository {
  create(data: FormCreate): Promise<Form>;
  getByProject(projectId: string): Promise<Form[]>;
  getById(id: string): Promise<Form>;
  update(id: string, data: Partial<FormCreate>): Promise<Form>;
  getAnalytics(id: string): Promise<any>; // Dados para os gráficos
  getExportUrl(id: string): string; // URL para o download do CSV
}