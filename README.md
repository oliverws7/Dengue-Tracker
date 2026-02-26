# 🦟 Dengue Tracker

![Dengue Tracker Banner](https://img.shields.io/badge/Status-Conclu%C3%ADdo-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

O **Dengue Tracker** é uma plataforma colaborativa de monitoramento e combate à dengue. O sistema permite que cidadãos reportem focos do mosquito *Aedes aegypti* em tempo real, fornecendo dados georreferenciados essenciais para ações de saúde pública.

---

## 🚀 Funcionalidades Principais

- **Mapeamento Interativo**: Visualização de focos em tempo real utilizando Leaflet.
- **Reporte com Fotos**: Upload de imagens diretamente do local do foco para melhor identificação.
- **Níveis de Risco**: Classificação de focos por gravidade (Baixo, Médio, Alto).
- **Gamificação e Engajamento**: Sistema de cadastro simplificado com feedback imediato.
- **Dashboard de Estatísticas**: Monitoramento de dados globais e locais sobre a propagação.
- **Sistema de Autenticação Seguro**: Login e registro utilizando JWT (JSON Web Tokens).

---

## 🏗️ Arquitetura do Sistema

A solução utiliza uma arquitetura full-stack moderna e escalável:

*   **Backend (Render)**: API RESTful construída com **Node.js** e **Express**. Utiliza **Sequelize ORM** para comunicação com o banco **PostgreSQL**.
*   **Frontend (Vercel)**: Aplicação Single Page Application (SPA) desenvolvida com **React 18** e **TypeScript**, otimizada pelo **Vite**.

### 📁 Principais Diretórios

```text
Dengue-Tracker/
├── backend/                # API e Lógica de Servidor
│   ├── src/
│   │   ├── config/         # Configurações (DB, JWT, SMTP)
│   │   ├── controllers/    # Lógica de Negócio (Auth, Focos, Usuários)
│   │   ├── models/         # Modelagem do Banco de Dados
│   │   └── services/       # Serviços (Envio de E-mail)
├── frontend/               # Interface do Usuário
│   ├── src/
│   │   ├── components/     # Modais, Mapas e UI Dinâmica
│   │   ├── config/         # Configuração centralizada da API
│   │   ├── hooks/          # Hooks para consumo de dados e estatísticas
│   │   └── context/        # Gerenciamento global de autenticação
```

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18 / TypeScript / Vite
- Leaflet (Mapas Interativos)
- Lucide React (Ícones)
- CSS3 Moderno (Glassmorphism & Animações)

### Backend
- Node.js / Express
- PostgreSQL / Sequelize ORM
- JWT (Autenticação)
- Nodemailer (Notificações por E-mail)
- Multer (Processamento de Uploads)

---

## ⚙️ Configuração do Ambiente

O projeto utiliza variáveis de ambiente para gerenciar diferentes contextos (Desenvolvimento/Produção).

### Variáveis Necessárias (Backend)
- `DATABASE_URL`: URL de conexão do PostgreSQL.
- `JWT_SECRET`: Chave secreta para criptografia de tokens.
- `JWT_EXPIRES_IN`: Tempo de expiração do token (ex: `7d`).
- `FRONTEND_URL`: URL da aplicação React no Vercel.
- `EMAIL_USER` / `EMAIL_PASS`: Credenciais para notificações (Gmail App Password).

### Variáveis Necessárias (Frontend)
- `VITE_API_URL`: URL do backend hospedado no Render.

---

## 🌐 Deploy

Atualmente o projeto está configurado para:
- **Frontend**: Hospedado no **Vercel** com integração contínua via GitHub.
- **Backend**: Hospedado no **Render** como um Web Service conectado ao PostgreSQL.

---
<p align="center">Desenvolvido com foco na saúde pública e tecnologia social.</p>
