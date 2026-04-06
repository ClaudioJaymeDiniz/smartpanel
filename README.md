# SmartForms

## 📌 Descrição

O **SmartForms** é um sistema completo para criação, gerenciamento e análise de formulários dinâmicos. A aplicação permite que usuários criem projetos, desenvolvam formulários personalizados e coletem respostas de forma estruturada, incluindo suporte a envio de imagens e visualização em dashboards.

O sistema foi projetado com foco em **usabilidade (no-code)**, **arquitetura limpa** e **suporte offline**, permitindo que dados sejam coletados mesmo sem conexão com a internet.

---

## 🎯 Objetivo

Desenvolver uma aplicação mobile e backend robusto capaz de:

* Criar formulários dinâmicos
* Gerenciar projetos e usuários
* Coletar respostas estruturadas
* Exibir dados analíticos em dashboards
* Funcionar em cenários offline

---

## 🧱 Arquitetura do Sistema

O projeto segue os princípios de **Clean Architecture**, garantindo separação de responsabilidades:

```
📦 Projeto
├── core/           → Regras de negócio (Domain + Use Cases)
├── data/           → Implementações (Repositories, API, SQLite)
├── presentation/   → UI (React Native + Expo)
├── backend/        → API REST (FastAPI + PostgreSQL)
```

### 🔹 Backend

* API RESTful
* Autenticação com JWT
* Banco relacional (PostgreSQL)
* ORM: Prisma
* Armazenamento de imagens em nuvem (planejado)

### 🔹 Mobile

* React Native + Expo
* TypeScript
* Expo Router
* Suporte offline com SQLite
* Sincronização de dados

---

## 🚀 Planejamento por Sprints

---

## 🟢 Sprint 1 — MVP (Fundação)

### 🎯 Objetivo

Construir a base funcional do sistema, permitindo criação e resposta de formulários.

### ✅ Funcionalidades

* Cadastro e autenticação de usuários
* Criação de projetos
* Criação de formulários dinâmicos
* Renderização de formulários no mobile
* Envio de respostas
* Validação de campos obrigatórios

### 🧠 Tecnologias aplicadas

* JWT para autenticação
* Estrutura dinâmica de formulários (JSON)
* Renderização condicional no mobile

### 🎯 Resultado

Sistema funcional similar a um **Google Forms básico**, permitindo criação e coleta de dados.

---

## 🟡 Sprint 2 — Expansão

### 🎯 Objetivo

Adicionar controle de acesso e ferramentas de análise.

### ✅ Funcionalidades

* Formulários públicos e privados
* Cadastro de respondentes
* Dashboard de respostas
* Exportação de dados (CSV)
* Filtros de respostas
* Exclusão lógica (lixeira)
* Compartilhamento por link

### 🧠 Tecnologias aplicadas

* Controle de permissões por usuário
* Soft delete (arquivamento)
* Processamento de dados para exportação

### 🎯 Resultado

Sistema evolui para um produto utilizável em cenários reais.

---

## 🔴 Sprint 3 — Avançado

### 🎯 Objetivo

Escalar o sistema com funcionalidades avançadas e melhor experiência do usuário.

### ✅ Funcionalidades

* Upload de imagens nas respostas
* Visualização gráfica (dashboard)
* Edição de formulários
* Notificações (email/push)
* Limite de respostas por usuário
* Respostas offline (sync posterior)
* QR Code para acesso
* Personalização visual
* Busca em respostas
* Drag and drop de campos
* Relatórios automáticos (PDF)
* Versionamento de formulários
* Comentários em respostas
* Sistema de times
* Webhooks

### 🧠 Tecnologias aplicadas

* Armazenamento em nuvem (Cloudinary/Firebase)
* Processamento assíncrono
* Geração de relatórios
* Integrações externas

### 🎯 Resultado

Sistema completo com características de um **SaaS profissional de formulários**.

---

## 📊 Funcionalidades Principais

* 📁 Projetos organizados por usuário
* 🧩 Formulários dinâmicos
* 🧑‍🤝‍🧑 Controle de acesso (público/privado)
* 📸 Upload de imagens
* 📊 Dashboard analítico
* 📤 Exportação de dados
* 🔄 Sincronização offline
* 🔐 Segurança com JWT

---

## ⚙️ Requisitos Não Funcionais

* Arquitetura RESTful
* Banco de dados relacional (PostgreSQL)
* Armazenamento externo de mídia
* Autenticação segura com JWT
* Interface intuitiva (no-code)
* Performance em formulários longos
* Suporte offline
* Escalabilidade
* Conformidade com LGPD

---

## 🧪 Tecnologias Utilizadas

### 📱 Mobile

* React Native
* Expo
* TypeScript
* Expo Router

### 🌐 Backend

* Python (FastAPI)
* PostgreSQL
* Prisma ORM
* JWT Authentication

### 🛠️ Outros

* SQLite (offline-first)
* Axios
* Cloudinary / Firebase (planejado)

---

## ▶️ Como Executar o Projeto

### 🔹 Backend

```bash
# Instalar dependências
pip install -r requirements.txt

# Rodar servidor
uvicorn main:app --reload
```

---

### 🔹 Mobile

```bash
# Instalar dependências
npm install

# Rodar projeto
npx expo start
```

---

## 📌 Diferenciais do Projeto

* Arquitetura limpa e escalável
* Suporte offline-first
* Formulários dinâmicos (no-code)
* Sistema modular e extensível
* Preparado para crescimento (SaaS)

---

## 📈 Trabalhos Futuros

* Implementação completa de notificações
* Integração com serviços de e-mail
* Melhorias no dashboard (gráficos avançados)
* Sistema de colaboração em tempo real
* Deploy em ambiente cloud

---

## 👨‍💻 Autor

Claudio Jayme

---

## 📄 Licença

Este projeto é acadêmico e desenvolvido para fins educacionais.
