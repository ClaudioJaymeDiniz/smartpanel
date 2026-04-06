import { api } from '@/services/api';
import { IInvitationRepository } from '@/core/projects/domain/repositories/IInvitationRepository';
import { Invitation, InvitationCreate } from '@/core/projects/domain/entities/Invitation';
import { InvitationMapper } from '@/core/projects/mappers/InvitationMappers';

export class InvitationRepositoryImpl implements IInvitationRepository {
  async invite(data: InvitationCreate): Promise<Invitation> {
    const response = await api.post('/invitations/', data);
    return InvitationMapper.toDomain(response.data);
  }

  async listMyPending(): Promise<Invitation[]> {
    const response = await api.get('/invitations/me');
    return InvitationMapper.toDomainList(response.data);
  }

  async accept(invitationId: string): Promise<void> {
    await api.post(`/invitations/${invitationId}/accept`);
  }

  async revoke(invitationId: string): Promise<void> {
    await api.delete(`/invitations/${invitationId}`);
  }
}