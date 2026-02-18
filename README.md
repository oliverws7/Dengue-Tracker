
---

# 🦟 DengueTracker Ecosystem

O **DengueTracker** é uma plataforma colaborativa de monitoramento e combate à dengue. Através de mecanismos de **gamificação**, a plataforma engaja a população no reporte de focos do mosquito *Aedes aegypti*, fornecendo dados georreferenciados cruciais para ações rápidas de saúde pública.

---

## 🏗️ Arquitetura do Sistema

A solução é estruturada em um ecossistema full-stack moderno:

* **Backend**: API REST robusta em **Node.js** com persistência em **PostgreSQL** (via Sequelize). Gerencia autenticação JWT, processamento de imagens, envio de e-mails e lógica de gamificação.
* **Frontend**: Aplicação **React** com **TypeScript**, utilizando **Vite** para um desenvolvimento ágil e uma experiência de usuário fluida.

### 📁 Estrutura de Pastas Atualizada

```text
.
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações de banco de dados, JWT e S3
│   │   ├── controllers/    # Lógica de controle das rotas (Auth, User, Focus)
│   │   ├── middlewares/    # Validações de schema e segurança
│   │   ├── models/         # Definições de modelos Sequelize
│   │   ├── routes/v1/      # Definição dos endpoints versionados
│   │   └── services/       # Serviços auxiliares (ex: EmailService)
│   └── tests/              # Testes de integração e serviços
├── frontend/
│   ├── src/
│   │   ├── components/     # UI, Mapas e Modais
│   │   ├── context/        # Gerenciamento de estado de Autenticação
│   │   ├── hooks/          # Hooks customizados para estatísticas
│   │   ├── pages/          # Telas de Home e Login
│   │   └── types/          # Definições de tipos TypeScript
└── README.md

```

---

## 🛠️ Stack Tecnológica

| Componente | Tecnologias |
| --- | --- |
| **Linguagens** | JavaScript (ES6+), TypeScript |
| **Backend** | Node.js, Express, PostgreSQL (Sequelize), JWT |
| **Frontend** | React 18, Vite, CSS Modules, Context API |
| **Serviços Cloud** | AWS S3 (Armazenamento de fotos), Nodemailer |
| **Qualidade** | ESLint, Prettier, Vitest/Jest |

---

## 🚦 Como Iniciar

### 1. Pré-requisitos

* Node.js (v18+)
* PostgreSQL (Local ou Cloud)
* Conta AWS (para S3) e serviço de SMTP (para e-mails)

### 2. Configuração do Backend

```bash
cd backend
npm install
# Configure o arquivo .env na pasta backend:
# PORT=3000
# DATABASE_URL=postgres://usuario:senha@localhost:5432/dengue-tracker
# JWT_SECRET=sua_chave_secreta_aqui
# JWT_EXPIRES_IN=7d
# FRONTEND_URL=http://localhost:5173
# BASE_URL=http://localhost:3000
# EMAIL_USER=seu_email@gmail.com
# EMAIL_PASS=sua_senha_de_aplicativo (Nao a senha do email!)

npm run dev
```

### 3. Configuração do Frontend

```bash
cd frontend
npm install
npm run dev

```

---

## 🔌 Principais Endpoints (v1.0)

| Método | Rota | Descrição | Protegido |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Cadastro de novos usuários | ❌ |
| `POST` | `/api/v1/auth/login` | Login e geração de token JWT | ❌ |
| `POST` | `/api/v1/dengue-focus` | Reportar novo foco do mosquito | ✅ |
| `GET` | `/api/v1/dengue-focus` | Listar focos registrados para o mapa | ❌ |
| `GET` | `/api/v1/users/profile` | Dados do perfil e pontuação | ✅ |

---

## 🚀 Funcionalidades Implementadas

* **Geolocalização**: Visualização de focos em mapa interativo.
* **Recuperação de Senha**: Sistema de reset de senha via token por e-mail.
* **Upload de Evidências**: Integração com AWS S3 para armazenamento de fotos dos focos.
* **Segurança**: Proteção de rotas sensíveis e validação de dados com Middlewares.

---

## 📄 Licença

Este projeto é open-source sob a licença [MIT](https://opensource.org/license/afl-3-0-php).
