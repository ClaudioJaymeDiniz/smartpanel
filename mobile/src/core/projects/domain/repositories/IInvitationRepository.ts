import { Invitation, InvitationCreate } from '../entities/Invitation';

export interface IInvitationRepository {
  invite(data: InvitationCreate): Promise<Invitation>;
  listMyPending(): Promise<Invitation[]>;
  accept(invitationId: string): Promise<void>;
  revoke(invitationId: string): Promise<void>;
}