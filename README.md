# 🦟 Dengue Tracker

![Dengue Tracker Banner](https://img.shields.io/badge/Status-Desenvolvimento-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

O **Dengue Tracker** é uma solução digital completa e colaborativa para o monitoramento e combate à proliferação do mosquito *Aedes aegypti*. Através de geolocalização e engajamento comunitário, a plataforma permite que usuários identifiquem e reportem focos de dengue em tempo real.

---

## 🚀 Funcionalidades Chave

### 🗺️ Monitoramento Georreferenciado
- **Mapa Interativo**: Visualização em tempo real de focos registrados usando Leaflet.
- **Registro de Focos**: Envio de coordenadas precisas, descrição detalhada e fotos de evidência.
- **Níveis de Risco**: Classificação dinâmica (Baixo, Médio, Alto) para priorização de ações.

### 📊 Dashboard de Estatísticas
- **Dados em Tempo Real**: Painel com contagem total de focos, casos ativos e resolvidos.
- **Distribuição por Risco**: Gráficos e indicadores de porcentagem por nível de perigo.

### 🔐 Segurança e Autenticação
- **Sistema de Usuários**: Cadastro seguro com validação de CPF e E-mail.
- **Autenticação JWT**: Proteção de rotas e sessões persistentes.
- **Verificação de E-mail**: Processo de ativação de conta para garantir usuários reais.
- **Recuperação de Senha**: Sistema robusto de reset de senha via token por e-mail.

### ⚕️ Saúde e Prevenção
- **Guia de Sintomas**: Modal informativo com os principais sinais da doença e alertas de emergência.
- **Guia de Prevenção**: Dicas práticas para eliminar criadouros e proteção individual.

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** + **TypeScript**
- **Vite** (Build Tool)
- **Leaflet** (Mapas Interativos)
- **Lucide React** (Ícones Premium)
- **Context API** (Gerenciamento de Estado)

### Backend
- **Node.js** + **Express**
- **Sequelize ORM** (PostgreSQL)
- **AWS SDK** (Armazenamento de imagens no S3)
- **Nodemailer** (Comunicação por E-mail)
- **Express Validator** (Sanitização de Dados)

---

## 📁 Estrutura do Projeto

```text
Dengue-Tracker/
├── backend/                # API RESTful
│   ├── src/
│   │   ├── config/         # Database, AWS & Email settings
│   │   ├── controllers/    # Business Logic
│   │   ├── middlewares/    # Security & Validation
│   │   ├── models/         # Sequelize Definitions
│   │   ├── routes/v1/      # API Endpoints
│   │   └── services/       # Email & Third-party services
│   └── server.js           # Entry point
└── frontend/               # Single Page Application
    ├── src/
    │   ├── components/     # UI Components, Modals & Map
    │   ├── context/        # Auth & App state
    │   ├── hooks/          # Custom Hooks (Statistics, etc)
    │   ├── pages/          # View components
    │   └── styles/         # Global & Component Themes
```

---

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js (v18+)
- PostgreSQL Instalado
- Credenciais AWS (para S3)

### 1. Backend
```bash
cd backend
npm install
# Crie um arquivo .env com as variáveis:
# PORT, DATABASE_URL, JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, etc.
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
