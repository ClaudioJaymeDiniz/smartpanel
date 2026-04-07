📱 Documentação de Arquitetura Mobile: SmartPanel

Esta documentação detalha a implementação da Camada de Dados e Sincronismo do App Mobile, utilizando Clean Architecture, Zustand (Estado) e SQLite (Offline-First).
🔐 1. Módulo de Autenticação (Auth)

Gerencia o acesso do usuário, persistência de tokens e segurança das requisições.

🗄️ Persistência Local:

    Expo SecureStore: Armazena o JWT Token de forma criptografada.

    Axios Interceptor: Injeta automaticamente o Authorization: Bearer <token> em todas as chamadas para o seu servidor Linux Mint.

🛠️ Componentes Técnicos:

    AuthRepositoryImpl: Realiza o handshake com /auth/login.

    useAuthStore: Estado global que define se o usuário está isAuthenticated.

    useAuth Hook: Disponibiliza as funções signIn, signOut e isLoading.

📁 2. Módulo de Projetos (Project)

Container principal que agrupa formulários e define a identidade visual (cores).

🗄️ Modelo de Cache (SQLite):

    Tabela: projects_cache

    Estratégia: Guarda o objeto JSON completo retornado pelo backend. Permite a renderização instantânea da Home mesmo sem rede.

🚀 Fluxos Principais:

    listActive: Tenta API -> Se falhar -> Carrega do SQLite.

    create / update: Tenta API -> Se falhar -> Salva na sync_queue.

    archive: Realiza o Soft Delete via PATCH no campo deletedAt.

✉️ 3. Módulo de Convites (Invitation)

Gerencia a colaboração e permissões entre membros de um projeto.

🛠️ Lógica de Negócio (Mobile):

    InvitationMapper: Converte os enums de status (PENDING, ACCEPTED) do Python para tipos TypeScript.

    useInvitationStore: Gerencia a "Central de Notificações" do App.

🚀 Endpoints Consumidos:

    POST /invitations/: Envia novo convite.

    GET /invitations/me: Lista convites recebidos pelo usuário logado.

    POST /invitations/{id}/accept: Efetiva o vínculo no banco.

📑 4. Módulo de Formulários (Form)

O "Cérebro" do App. Interpreta o JSON dinâmico para renderizar a interface.

🗄️ Estrutura Dinâmica (Frontend):

    FormField: Interface TS que define label, type e required.

    Renderização: O App itera sobre o array structure e decide qual componente exibir (Input, Checkbox, etc).

🚀 Funcionalidades:

    getAnalytics: Consome dados agregados para exibir gráficos no Mobile.

    getExportUrl: Gera o link direto para o download do CSV processado no servidor.

📥 5. Módulo de Submissões (Submission)

Gerencia a coleta de dados e o envio de respostas.

🗄️ Estratégia de Integridade (UUID):

    ID Gerado no Mobile: O App gera um UUID antes de tentar enviar. Isso garante que, no fluxo de Sync Offline, o dado seja único e não duplique no PostgreSQL.

🛠️ Regras de Visibilidade:

    Filtro por Contexto: O App exibe apenas o histórico do coletor (/submissions/me) ou o total do dono (/submissions/form/{id}).

🔄 6. Motor de Sincronismo (Sync Engine)

O diferencial tecnológico do projeto (RF 15).

🗄️ Fila de Sincronização (SQLite):

    Tabela: sync_queue (id, endpoint, payload, method, status).

🛠️ O Hook useSync:

    Varre a tabela sync_queue.

    Tenta reexecutar as chamadas (POST, PATCH, DELETE) em ordem cronológica.

    Remove da fila apenas após confirmação 200 OK do servidor.

    Trigger: Disparado no useEffect da raiz do App (_layout.tsx) e após login bem-sucedido.

📊 Tabela de Correspondência (Backend vs Mobile)
Módulo	Backend (FastAPI + Prisma)	Mobile (React Native + Clean Arch)
Auth	OAuth2 / JWT	SecureStore / Axios Interceptor
Project	Postgres Table	projects_cache (SQLite)
Form	JSON Field (Structure)	Dynamic Component Mapping
Submission	Notification Service	UUID Client-side Generation
Sync	API Endpoints	sync_queue + useSync