export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED';

export interface Invitation {
  id: string;
  email: string;
  projectId: string;
  status: InvitationStatus;
  invitedAt: Date;
}

export interface InvitationCreate {
  email: string;
  projectId: string;
}