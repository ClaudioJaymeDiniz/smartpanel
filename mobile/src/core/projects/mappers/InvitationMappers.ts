import { Invitation } from '@/core/projects/domain/entities/Invitation';

export class InvitationMapper {
  static toDomain(raw: any): Invitation {
    return {
      id: raw.id,
      email: raw.email,
      projectId: raw.projectId,
      status: raw.status as any,
      invitedAt: new Date(raw.invitedAt),
    };
  }

  static toDomainList(rawList: any[]): Invitation[] {
    return rawList.map(item => this.toDomain(item));
  }
}