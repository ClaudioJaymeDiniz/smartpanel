import { Project } from '@/core/projects/domain/entities/Project';

export class ProjectMapper {
  static toDomain(raw: any): Project {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description || undefined,
      themeColor: raw.themeColor || '#000000',
      ownerId: raw.ownerId,
      isPublic: !!raw.isPublic,
      deletedAt: raw.deletedAt ? new Date(raw.deletedAt) : null,
      forms: raw.forms || [],
    };
  }

  static toDomainList(rawList: any[]): Project[] {
    return rawList.map(item => this.toDomain(item));
  }
}