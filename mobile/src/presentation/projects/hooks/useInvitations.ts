import { useCallback } from 'react';
import { InvitationRepositoryImpl } from '@/data/projects/repositories/InvitationRepositoryImpl';
import { useInvitationStore } from '../store/useInvitationStore';

export function useInvitations() {
  const repository = new InvitationRepositoryImpl();
  const { 
    pendingInvitations, 
    setPendingInvitations, 
    removeInvitationFromList,
    setLoading, 
    isLoading 
  } = useInvitationStore();

  // Busca convites pendentes para o usuário logado
  const fetchMyInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repository.listMyPending();
      setPendingInvitations(data);
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptInvite = async (id: string) => {
    try {
      await repository.accept(id);
      removeInvitationFromList(id); // Remove da UI imediatamente
      // Dica: Aqui você poderia disparar um refresh na lista de projetos
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
    }
  };

  const declineInvite = async (id: string) => {
    try {
      await repository.revoke(id);
      removeInvitationFromList(id);
    } catch (error) {
      console.error("Erro ao recusar convite:", error);
    }
  };

  return {
    pendingInvitations,
    isLoading,
    fetchMyInvitations,
    acceptInvite,
    declineInvite
  };
}