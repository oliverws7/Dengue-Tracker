# 🦟 DengueTracker Ecosystem

O **DengueTracker** é uma plataforma full-stack de monitoramento e combate à dengue. O projeto utiliza mecanismos de **gamificação** para incentivar a população a reportar focos do mosquito *Aedes aegypti*, integrando dados em tempo real para ações de saúde pública.

---

## 🏗️ Arquitetura do Sistema

O projeto é dividido em duas frentes principais:

* **Backend:** API REST robusta construída em Node.js, utilizando MongoDB para persistência de dados georreferenciados e autenticação JWT.
* **Frontend:** Interface reativa para visualização de estatísticas e gestão de reportes (localizada no diretório `/frontend`).

### Estrutura de Pastas

```text
.
├── backend/
│   ├── src/              # Core da aplicação (Controllers, Models, Routes)
│   ├── migrations/       # Gestão de versionamento do banco de dados (MongoDB)
│   ├── tests/            # Testes automatizados (Unitários e Integração)
│   └── .env.example      # Template de variáveis de ambiente
├── frontend/             # Código fonte da interface do usuário
└── README.md

```

---

## 🛠️ Tecnologias Utilizadas

### **Backend**

* **Runtime:** Node.js
* **Banco de Dados:** MongoDB (com `migrate-mongo` para controle de schema)
* **Segurança:** JWT (JSON Web Tokens) e Criptografia de senhas
* **Documentação:** Swagger (disponível em `/api/docs`)

### **Frontend**

* **Em desenvolvimento**

---

## 🚦 Começando

### Pré-requisitos

* Node.js (v16 ou superior)
* MongoDB rodando localmente ou via Docker
* Gerenciador de pacotes (NPM ou Yarn)

### Instalação e Configuração

1. **Clonagem do Repositório:**
   ```bash
   git clone https://github.com/oliverws7/DengueTracker.git
   cd DengueTracker
   ```

2. **Configuração do Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   *Edite o arquivo `.env` com suas credenciais do MongoDB e porta desejada.*

3. **Migrações do Banco:**
   ```bash
   npm run migrate  # Se configurado via migrate-mongo
   ```

4. **Execução:**
   ```bash
   npm run dev
   ```

---

## 🚀 Atualizações Recentes

### **Frontend**
* **Tecnologias:** O frontend agora utiliza React com Vite para uma melhor experiência de desenvolvimento e desempenho.
* **Funcionalidades:** Adicionadas novas páginas para visualização de relatórios e gestão de usuários.

### **Backend**
* **Segurança:** Implementação de novas rotas de autenticação e autorização.
* **Banco de Dados:** Atualizações nas migrações para suportar novos campos e funcionalidades.

---

## 📦 Instalação e Configuração

### **Frontend**

1. **Configuração do Frontend:**
   ```bash
   cd frontend
   npm install
   ```
   *Edite o arquivo `vite.config.js` conforme necessário para suas configurações.*

---

## 🔌 API Reference (v2.1)

Principais endpoints disponíveis:

| Método | Endpoint | Descrição | Autenticação |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Autentica usuário e retorna token | Não |
| `POST` | `/api/reports` | Cria um novo reporte de foco | Sim (Bearer) |
| `GET` | `/api/gamification` | Retorna ranking e pontuação | Sim (Bearer) |
| `GET` | `/api/public/stats` | Estatísticas públicas para o dashboard | Não |

---

## 🧪 Testes

A qualidade do código é garantida por testes automatizados. Para executá-los:

```bash
cd backend
npm test
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](https://www.google.com/search?q=LICENSE) para detalhes.

---
