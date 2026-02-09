
---

# 🦟 DengueTracker Ecosystem

O **DengueTracker** é uma plataforma colaborativa de monitoramento e combate à dengue. Através de mecanismos de **gamificação**, a plataforma engaja a população no reporte de focos do mosquito *Aedes aegypti*, fornecendo dados georreferenciados cruciais para ações rápidas de saúde pública.

---

## 🏗️ Arquitetura do Sistema

A solução é estruturada em um ecossistema full-stack moderno:

* **Backend:** API REST robusta em **Node.js** com persistência em **MongoDB**. Gerencia autenticação JWT, processamento de imagens (focos reportados) e lógica de gamificação (pontos e conquistas).
* **Frontend:** Dashboard interativo construído com **React** e **Vite**, focado em visualização de dados em tempo real e experiência do usuário fluida.

### 📁 Estrutura de Pastas

```text
.
├── backend/
│   ├── src/
│   │   ├── controllers/    # Lógica de controle das rotas
│   │   ├── models/         # Definições de schemas (Mongoose)
│   │   ├── routes/         # Definição dos endpoints
│   │   └── middleware/     # Filtros de segurança e upload
│   ├── migrations/         # Versionamento do banco de dados
│   └── tests/              # Testes de API e WebSocket
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis e mapas
│   │   ├── contexts/       # Gerenciamento de estado (Auth/Theme)
│   │   └── pages/          # Dashboards e telas principais
└── README.md

```

---

## 🛠️ Stack Tecnológica

| Componente | Tecnologias |
| --- | --- |
| **Backend** | Node.js, Express, MongoDB (Mongoose), JWT, Multer |
| **Frontend** | React, Vite, CSS Modules, Context API |
| **Real-time** | WebSockets (integração para alertas em tempo real) |
| **DevOps** | Migrate-mongo, ESLint |

---

## 🚦 Como Iniciar

### 1. Pré-requisitos

* Node.js (v16+)
* MongoDB (Local ou Atlas)
* Git instalado

### 2. Configuração do Backend

```bash
cd backend
npm install
cp .env.example .env # Configure suas chaves e URI do MongoDB
npm run migrate      # Aplica o schema inicial ao banco
npm run dev          # Inicia em modo de desenvolvimento

```

### 3. Configuração do Frontend

```bash
cd frontend
npm install
npm run dev

```

---

## 🔌 Principais Endpoints (v2.1)

| Método | Rota | Descrição | Protegido |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Cadastro de novos usuários | ❌ |
| `POST` | `/api/auth/login` | Login e geração de token JWT | ❌ |
| `POST` | `/api/reports` | Envio de novo foco (com foto) | ✅ |
| `GET` | `/api/gamification` | Ranking e status de conquistas | ✅ |
| `GET` | `/api/public/stats` | Dados consolidados para o mapa | ❌ |

---

## 🚀 Novidades Recentes

* **Gamificação:** Novo sistema de missões e medalhas integrado ao perfil do usuário.
* **Mapa Interativo:** Visualização aprimorada no frontend com filtros por densidade de focos.
* **Segurança:** Implementação de *Rate Limiting* e validações rigorosas de schema no backend.

---

## 📄 Licença

Este projeto é open-source sob a licença [MIT](https://opensource.org/license/afl-3-0-php).

---
