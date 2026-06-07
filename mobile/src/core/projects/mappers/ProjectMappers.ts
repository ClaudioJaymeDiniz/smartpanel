import { Project } from '@/core/projects/domain/entities/Project';

function normalizeColor(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return '#000000';
  }

  return value.startsWith('#') ? value : `#${value}`;
}

export class ProjectMapper {
  static toDomain(raw: any): Project {
    const themeColor = normalizeColor(raw.themeColor || raw.color);

    return {
      id: raw.id,
      name: raw.name,
      description: raw.description || undefined,
      color: themeColor,
      themeColor,
      ownerId: raw.ownerId,
      owner: raw.owner || null,
      members: raw.members || [],
      isPublic: !!raw.isPublic,
      deletedAt: raw.deletedAt ? new Date(raw.deletedAt) : null,
      forms: raw.forms || [],
    };
  }

  static toDomainList(rawList: any[]): Project[] {
    return rawList.map(item => this.toDomain(item));
  }
}