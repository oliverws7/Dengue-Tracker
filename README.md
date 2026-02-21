# 🦟 Dengue Tracker

![Dengue Tracker Banner](https://img.shields.io/badge/Status-Desenvolvimento-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

O **DengueTracker** é uma plataforma colaborativa de monitoramento e combate à dengue. Através de mecanismos de **gamificação**, a plataforma engaja a população no reporte de focos do mosquito *Aedes aegypti*, fornecendo dados georreferenciados cruciais para ações rápidas de saúde pública.

---

## 🏗️ Arquitetura do Sistema

A solução é estruturada em um ecossistema full-stack moderno:

* **Backend**: API REST robusta em **Node.js** com persistência em **PostgreSQL**. Gerencia autenticação JWT, processamento de imagens via AWS S3, envio de e-mails e lógica de gamificação.
* **Frontend**: Aplicação **React** com **TypeScript**, utilizando **Vite** para um desenvolvimento ágil e uma experiência de usuário fluida.

### 📁 Estrutura de Pastas Atualizada

```text
Dengue-Tracker/
├── backend/                # API RESTful
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
| **Qualidade** | ESLint, Prettier, Vitest/Jest  |

---

## 🚦 Como Iniciar

### 1. Pré-requisitos

* Node.js (v18+)
* PostgreSQL (Local ou Cloud)
* Conta AWS (para S3) e serviço de SMTP (para e-mails)

### 1. Backend
```bash
cd backend
npm install
# Configure o .env com DATABASE_URL, JWT_SECRET, AWS_ACCESS_KEY, etc.
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## � Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---
<p align="center">Desenvolvido com ❤️ para uma comunidade mais saudável.</p>
