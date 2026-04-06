import { AuthRepositoryImpl } from '@/data/auth/repositories/AuthRepositoryImpl';

// Aumentamos o timeout porque chamadas de rede podem demorar
jest.setTimeout(15000);

describe('Módulo de Autenticação (Integração)', () => {
  const repository = new AuthRepositoryImpl();

  it('deve realizar o fluxo completo de login e busca de perfil', async () => {
    console.log("🚀 Iniciando Teste de Integração: Módulo Auth\n");

    const credentials = {
      email: "teste@teste.com",
      password: "102030"
    };

    // Teste 1: Login
    console.log("--- Teste 1: Login ---");
    const session = await repository.login(credentials);
    
    expect(session.accessToken).toBeDefined();
    console.log("✅ Login OK! Token:", session.accessToken.substring(0, 15) + "...");

    // Teste 2: GetMe
    console.log("\n--- Teste 2: GetMe ---");
    const user = await repository.getMe();
    
    expect(user.email).toBe(credentials.email);
    console.log("✅ Perfil OK! Nome:", user.name);
  });
});