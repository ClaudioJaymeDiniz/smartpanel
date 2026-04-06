import { create } from 'zustand';
import { Invitation } from '@/core/projects/domain/entities/Invitation';

interface InvitationState {
  pendingInvitations: Invitation[]; // Convites que EU recebi
  sentInvitations: Invitation[];    // Convites que EU enviei (para um projeto específico)
  isLoading: boolean;

  // Ações
  setPendingInvitations: (invitations: Invitation[]) => void;
  setSentInvitations: (invitations: Invitation[]) => void;
  removeInvitationFromList: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useInvitationStore = create<InvitationState>((set) => ({
  pendingInvitations: [],
  sentInvitations: [],
  isLoading: false,

  setPendingInvitations: (pendingInvitations) => set({ pendingInvitations }),
  setSentInvitations: (sentInvitations) => set({ sentInvitations }),
  
  // Remove da lista local após aceitar ou recusar, sem precisar de novo fetch
  removeInvitationFromList: (id) => set((state) => ({
    pendingInvitations: state.pendingInvitations.filter((inv) => inv.id !== id),
    sentInvitations: state.sentInvitations.filter((inv) => inv.id !== id),
  })),

  setLoading: (isLoading) => set({ isLoading }),
}));