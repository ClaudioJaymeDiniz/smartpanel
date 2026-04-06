import { Form } from '@/core/forms/domain/entities/Form';

export class FormMapper {
  static toDomain(raw: any): Form {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      isPublic: Boolean(raw.isPublic),
      projectId: raw.projectId,
      // Garante que a estrutura venha como array, mesmo do JSON do banco
      structure: Array.isArray(raw.structure) ? raw.structure : [],
      createdAt: new Date(raw.createdAt),
      deletedAt: raw.deletedAt ? new Date(raw.deletedAt) : null,
    };
  }

  static toDomainList(rawList: any[]): Form[] {
    return rawList.map(item => this.toDomain(item));
  }
}