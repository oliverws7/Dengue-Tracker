<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dengue Tracker Backend</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #2E7D32;
            --primary-dark: #1B5E20;
            --primary-light: #4CAF50;
            --secondary: #FF6D00;
            --accent: #D32F2F;
            --text: #333333;
            --text-light: #666666;
            --background: #F5F5F5;
            --white: #FFFFFF;
            --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header */
        .header {
            background: var(--white);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: var(--shadow);
            text-align: center;
            border-left: 5px solid var(--secondary);
        }

        .title {
            color: var(--primary-dark);
            font-size: 2.5em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }

        .title::before {
            content: '🦟';
            font-size: 1.2em;
        }

        .subtitle {
            color: var(--text-light);
            font-size: 1.2em;
            font-weight: 300;
        }

        /* Cards */
        .card {
            background: var(--white);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: var(--shadow);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-left: 4px solid var(--primary);
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            color: var(--primary-dark);
            font-size: 1.3em;
            font-weight: 600;
        }

        .card-header::before {
            content: '📋';
        }

        .tech-card .card-header::before { content: '⚙️'; }
        .features-card .card-header::before { content: '🚀'; }
        .setup-card .card-header::before { content: '🛠️'; }
        .structure-card .card-header::before { content: '📁'; }
        .endpoints-card .card-header::before { content: '🔗'; }
        .scripts-card .card-header::before { content: '💻'; }
        .status-card .card-header::before { content: '📊'; }
        .contrib-card .card-header::before { content: '🤝'; }

        /* Grid Layout */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }

        /* Lists */
        .feature-list, .tech-list, .endpoint-list {
            list-style: none;
        }

        .feature-list li, .tech-list li, .endpoint-list li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .feature-list li::before { content: '✅'; }
        .tech-list li::before { content: '💚'; }
        .endpoint-list li::before { content: '🔹'; }

        .feature-list li:last-child, .tech-list li:last-child, .endpoint-list li:last-child {
            border-bottom: none;
        }

        /* Code Blocks */
        .code-block {
            background: #2D2D2D;
            color: #F8F8F2;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            border-left: 4px solid var(--secondary);
        }

        .env-vars {
            background: #1E1E1E;
            color: #9CDCFE;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
        }

        /* Status Badges */
        .status-badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 15px;
        }

        .badge {
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
        }

        .badge-completed {
            background: #E8F5E8;
            color: var(--primary-dark);
            border: 1px solid var(--primary-light);
        }

        .badge-development {
            background: #FFF3E0;
            color: #E65100;
            border: 1px solid var(--secondary);
        }

        /* Footer */
        .footer {
            background: var(--white);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            box-shadow: var(--shadow);
            margin-top: 30px;
        }

        .developer-info {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 15px;
        }

        .developer-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5em;
            font-weight: bold;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
            }
            
            .title {
                font-size: 2em;
            }
            
            .container {
                padding: 15px;
            }
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .card {
            animation: fadeIn 0.6s ease-out;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <h1 class="title">Dengue Tracker Backend</h1>
            <p class="subtitle">Sistema completo para monitoramento, prevenção e análise de casos de dengue em tempo real</p>
        </header>

        <!-- About Section -->
        <section class="card">
            <h2 class="card-header">📋 Sobre o Projeto</h2>
            <p>O Dengue Tracker é uma plataforma backend desenvolvida para auxiliar governos, instituições de saúde e comunidades no combate à dengue através do monitoramento inteligente de casos, focos do mosquito e campanhas preventivas.</p>
        </section>

        <!-- Technologies Grid -->
        <section class="grid">
            <div class="card tech-card">
                <h2 class="card-header">🚀 Tecnologias Utilizadas</h2>
                <ul class="tech-list">
                    <li><strong>Node.js</strong> - Ambiente de execução JavaScript</li>
                    <li><strong>Express.js</strong> - Framework web para APIs</li>
                    <li><strong>MongoDB</strong> - Banco de dados NoSQL</li>
                    <li><strong>Mongoose</strong> - ODM para MongoDB</li>
                    <li><strong>JWT</strong> - Autenticação por tokens</li>
                    <li><strong>bcrypt</strong> - Criptografia de senhas</li>
                    <li><strong>CORS</strong> - Controle de acesso entre origens</li>
                </ul>
            </div>

            <div class="card features-card">
                <h2 class="card-header">⚡ Funcionalidades Principais</h2>
                <ul class="feature-list">
                    <li><strong>Monitoramento de Casos</strong> - Registro e georreferenciamento</li>
                    <li><strong>Mapeamento de Focos</strong> - Heatmaps e alertas regionais</li>
                    <li><strong>Gestão de Usuários</strong> - Múltiplos perfis de acesso</li>
                    <li><strong>Relatórios Analytics</strong> - Estatísticas e previsões</li>
                    <li><strong>Sistema de Alertas</strong> - Notificações automáticas</li>
                </ul>
            </div>
        </section>

        <!-- Setup Instructions -->
        <section class="card setup-card">
            <h2 class="card-header">🛠️ Como Executar o Projeto</h2>
            
            <h3>Pré-requisitos</h3>
            <ul class="feature-list">
                <li>Node.js 16+ instalado</li>
                <li>MongoDB 4.4+</li>
                <li>Git</li>
            </ul>

            <h3>Instalação e Configuração</h3>
            <div class="code-block">
# 1. Clone o repositório<br>
git clone https://github.com/oliverns7/DengueTracker.git<br>
cd dengue-tracker-backend<br><br>

# 2. Instale as dependências<br>
npm install<br><br>

# 3. Configure as variáveis de ambiente<br>
cp .env.example .env<br><br>

# 4. Inicie o servidor<br>
npm run dev
            </div>

            <h3>Variáveis de Ambiente</h3>
            <div class="env-vars">
PORT=3000<br>
MONGODB_URI=mongodb://localhost:27017/dengue-tracker<br>
JWT_SECRET=seu_jwt_secret_aqui<br>
NODE_ENV=development
            </div>
        </section>

        <!-- Project Structure -->
        <section class="card structure-card">
            <h2 class="card-header">📁 Estrutura do Projeto</h2>
            <div class="code-block">
dengue-tracker-backend/<br>
├── src/<br>
│   ├── controllers/     # Lógica das rotas<br>
│   ├── models/          # Schemas do MongoDB<br>
│   ├── routes/          # Definição de rotas<br>
│   ├── middleware/      # Autenticação e validações<br>
│   ├── config/          # Configurações do banco<br>
│   └── utils/           # Funções auxiliares<br>
├── .env.example         # Template de variáveis<br>
├── package.json<br>
└── server.js           # Arquivo principal
            </div>
        </section>

        <!-- API Endpoints -->
        <section class="card endpoints-card">
            <h2 class="card-header">🔗 Endpoints Principais</h2>
            <ul class="endpoint-list">
                <li><strong>POST /api/auth/register</strong> - Cadastro de usuários</li>
                <li><strong>POST /api/auth/login</strong> - Login na plataforma</li>
                <li><strong>GET /api/cases</strong> - Listar todos os casos</li>
                <li><strong>POST /api/cases</strong> - Registrar novo caso</li>
                <li><strong>GET /api/cases/stats</strong> - Estatísticas gerais</li>
                <li><strong>GET /api/foci</strong> - Listar focos mapeados</li>
                <li><strong>POST /api/foci</strong> - Registrar novo foco</li>
            </ul>
        </section>

        <!-- Scripts -->
        <section class="card scripts-card">
            <h2 class="card-header">💻 Scripts Disponíveis</h2>
            <div class="code-block">
npm start          # Produção<br>
npm run dev        # Desenvolvimento com hot-reload<br>
npm test           # Executar testes<br>
npm run lint       # Análise de código
            </div>
        </section>

        <!-- Project Status -->
        <section class="card status-card">
            <h2 class="card-header">📊 Status do Projeto</h2>
            <p><strong>🚧 Em Desenvolvimento Ativo</strong></p>
            <div class="status-badges">
                <span class="badge badge-completed">✅ Estrutura base do backend</span>
                <span class="badge badge-completed">✅ Sistema de autenticação</span>
                <span class="badge badge-completed">✅ CRUD de casos e focos</span>
                <span class="badge badge-development">🔄 Integração com mapas</span>
                <span class="badge badge-development">🔄 Sistema de notificações</span>
                <span class="badge badge-development">🔄 Dashboard administrativo</span>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="developer-info">
                <div class="developer-avatar">ON</div>
                <div>
                    <h3>Oliver Nunes</h3>
                    <p>Desenvolvedor Full Stack</p>
                </div>
            </div>
            <p>📧 Contato: • 🔗 GitHub: <a href="https://github.com/oliverws7">oliverws7</a></p>
            <p style="margin-top: 15px; color: var(--text-light);">
                <strong>💡 Juntos no combate à dengue!</strong> 🦟➡️💪
            </p>
        </footer>
    </div>

    <script>
        // Simple animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all cards for animation
        document.addEventListener('DOMContentLoaded', () => {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(card);
            });
        });
    </script>
</body>
</html>