require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const helmet = require("helmet");

const app = express();
const server = http.createServer(app);

// Configuração de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || [
    "http://localhost:3000", 
    "http://localhost:8081", 
    "http://localhost:19006",
    "http://localhost:5000"  // Adicionado para teste local
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  maxAge: 86400 // 24 horas
};

// Middleware de segurança - VERSÃO PARA DESENVOLVIMENTO
if (process.env.NODE_ENV === 'production') {
  // Só usar CSP estrita em produção
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: "same-site" }
  }));
} else {
  // Em desenvolvimento: Helmet básico SEM CSP que bloqueia scripts
  app.use(helmet({
    contentSecurityPolicy: false, // ⚠️ DESABILITA CSP para desenvolvimento
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false
  }));
}

// Aplicar CORS
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting global
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: {
    success: false,
    message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Static files (protegido)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Configurar WebSocket com opções robustas
const io = socketIo(server, {
  cors: {
    origin: "*", // Permitir todas as origens durante desenvolvimento
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true // Compatibilidade
});

// Log quando o servidor Socket.IO estiver pronto
io.engine.on("connection", (rawSocket) => {
  console.log("🔧 Socket.IO engine: Nova conexão raw detectada");
});

// Sistema de salas e usuários online
const usuariosOnline = new Map();
const salasAtivas = new Set();

// WebSocket Connection Handler
io.on("connection", (socket) => {
  console.log("=".repeat(50));
  console.log("🎉 NOVA CONEXÃO WEBSOCKET ESTABELECIDA!");
  console.log(`🔌 Socket ID: ${socket.id}`);
  console.log(`🌐 Origin: ${socket.handshake.headers.origin}`);
  console.log(`📨 User-Agent: ${socket.handshake.headers['user-agent']}`);
  console.log("=".repeat(50));
  
  // Enviar mensagem de boas-vindas IMEDIATAMENTE
  socket.emit("conexao-estabelecida", {
    event: "conexao-estabelecida",
    message: "✅ Conectado ao Dengue Tracker!",
    socketId: socket.id,
    timestamp: new Date().toISOString(),
    server: "Dengue Tracker API v2.0",
    endpoints: {
      ping: "Envie {event: 'ping'}",
      usuario_entrou: "Envie {event: 'usuario-entrou', usuarioId: '...', nome: '...'}",
      ranking: "Envie {event: 'entrar-sala-ranking'}"
    }
  });

  // Evento: Ping para manter conexão
  socket.on("ping", () => {
    console.log(`🏓 Ping recebido de ${socket.id}`);
    socket.emit("pong", { 
      event: "pong",
      timestamp: new Date().toISOString(),
      message: "Pong do servidor Dengue Tracker!",
      receivedAt: new Date().toISOString()
    });
  });

  // Evento: Teste simples
  socket.on("hello", (data) => {
    console.log("👋 Hello recebido:", data);
    socket.emit("hello-response", { 
      event: "hello-response",
      message: "Olá do servidor Dengue Tracker!",
      yourData: data,
      timestamp: new Date().toISOString()
    });
  });

  // Evento: Usuário entra no app
  socket.on("usuario-entrou", (dadosUsuario) => {
    try {
      const { usuarioId, nome } = dadosUsuario;
      
      // Validar dados
      if (!usuarioId || !nome) {
        return socket.emit("erro", { 
          event: "erro",
          message: "Dados incompletos. Precisa de usuarioId e nome." 
        });
      }
      
      // Registrar usuário online
      usuariosOnline.set(usuarioId, {
        socketId: socket.id,
        nome: nome,
        conectadoEm: new Date(),
        ultimaAtividade: new Date()
      });

      // Entrar na sala do usuário
      socket.join(`usuario:${usuarioId}`);
      
      // Entrar na sala global
      socket.join("sala-global");
      
      console.log(`👤 ${nome} entrou no app (ID: ${usuarioId})`);
      console.log(`📊 Usuários online agora: ${usuariosOnline.size}`);
      
      // Notificar todos sobre usuários online
      io.to("sala-global").emit("usuarios-online-atualizados", {
        event: "usuarios-online-atualizados",
        success: true,
        totalOnline: usuariosOnline.size,
        usuarios: Array.from(usuariosOnline.values()).map(u => ({
          nome: u.nome,
          conectadoEm: u.conectadoEm
        })),
        timestamp: new Date().toISOString()
      });

      // Confirmar para o usuário
      socket.emit("usuario-autenticado", {
        event: "usuario-autenticado",
        success: true,
        message: `Bem-vindo, ${nome}!`,
        usuarioId: usuarioId,
        timestamp: new Date().toISOString(),
        salas: ["usuario:" + usuarioId, "sala-global"]
      });
      
    } catch (error) {
      console.error("Erro em usuario-entrou:", error);
      socket.emit("erro", { 
        event: "erro",
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Evento: Entrar na sala de ranking
  socket.on("entrar-sala-ranking", (dados) => {
    socket.join("sala-ranking");
    console.log(`📊 ${socket.id} entrou na sala de ranking`);
    
    // Enviar dados de ranking fake para teste
    const rankingFake = [
      { nome: "João Silva", pontos: 150, nivel: "caçador" },
      { nome: "Maria Santos", pontos: 120, nivel: "caçador" },
      { nome: "Pedro Oliveira", pontos: 90, nivel: "iniciante" }
    ];
    
    socket.emit("ranking-atualizado", {
      event: "ranking-atualizado",
      sala: "ranking",
      message: "Você entrou na sala de ranking",
      ranking: rankingFake,
      timestamp: new Date().toISOString()
    });
  });

  // Evento: Entrar na sala de admin
  socket.on("entrar-sala-admin", (dados) => {
    socket.join("sala-admin");
    console.log(`🛡️ ${socket.id} entrou na sala admin`);
    
    socket.emit("sala-entrada-confirmada", {
      event: "sala-entrada-confirmada",
      sala: "admin",
      message: "Você entrou na sala admin (somente desenvolvimento)",
      timestamp: new Date().toISOString()
    });
  });

  // Evento: Simular novo reporte
  socket.on("novo-reporte", (dadosReporte) => {
    try {
      console.log("📋 Novo reporte simulado:", dadosReporte);
      
      // Emitir para sala global
      io.to("sala-global").emit("reporte-criado", {
        event: "reporte-criado",
        success: true,
        reporte: dadosReporte,
        timestamp: new Date().toISOString(),
        message: "Novo foco de dengue reportado na sua área!"
      });
      
      // Se tiver coordenadas, emitir para área específica
      if (dadosReporte.localizacao) {
        const { lat, lng } = dadosReporte.localizacao;
        const salaArea = `area:${lat.toFixed(2)}:${lng.toFixed(2)}`;
        io.to(salaArea).emit("reporte-na-area", {
          event: "reporte-na-area",
          reporte: dadosReporte,
          area: salaArea,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error("Erro em novo-reporte:", error);
    }
  });

  // Evento: Simular conquista
  socket.on("conquista-desbloqueada", (dadosConquista) => {
    console.log("🏆 Conquista desbloqueada:", dadosConquista);
    
    // Emitir para o usuário específico
    if (dadosConquista.usuarioId) {
      io.to(`usuario:${dadosConquista.usuarioId}`).emit("conquista-notificacao", {
        event: "conquista-notificacao",
        conquista: dadosConquista,
        message: "🎉 Parabéns! Você desbloqueou uma nova conquista!",
        timestamp: new Date().toISOString()
      });
    }
    
    // Também emitir para sala global
    io.to("sala-global").emit("conquista-global", {
      event: "conquista-global",
      message: `🎊 ${dadosConquista.nome || "Um usuário"} desbloqueou uma conquista!`,
      timestamp: new Date().toISOString()
    });
  });

  // Evento: Ouvir reportes de uma área específica
  socket.on("ouvir-area", (dadosArea) => {
    try {
      const { lat, lng, raio } = dadosArea;
      
      // Validar coordenadas
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return socket.emit("erro", { 
          event: "erro",
          message: "Coordenadas inválidas" 
        });
      }
      
      const salaArea = `area:${lat.toFixed(2)}:${lng.toFixed(2)}`;
      socket.join(salaArea);
      console.log(`🗺️ ${socket.id} ouvindo área ${salaArea} (raio: ${raio}km)`);
      
      socket.emit("area-configurada", {
        event: "area-configurada",
        sala: salaArea,
        lat: lat,
        lng: lng,
        raio: raio,
        message: `🔔 Agora ouvindo reportes na área ${salaArea}`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Erro em ouvir-area:", error);
      socket.emit("erro", { 
        event: "erro",
        message: "Erro ao configurar área" 
      });
    }
  });

  // Evento: Obter estatísticas
  socket.on("obter-estatisticas", () => {
    socket.emit("estatisticas-atualizadas", {
      event: "estatisticas-atualizadas",
      totalUsuarios: usuariosOnline.size,
      salasAtivas: Array.from(salasAtivas),
      timestamp: new Date().toISOString(),
      estatisticas: {
        usuariosOnline: usuariosOnline.size,
        conexoesAtivas: io.engine.clientsCount,
        memoria: process.memoryUsage()
      }
    });
  });

  // Evento: Disconnect
  socket.on("disconnect", (reason) => {
    console.log("=".repeat(40));
    console.log("❌ Cliente desconectado:", socket.id);
    console.log("📝 Motivo:", reason);
    console.log("=".repeat(40));
    
    // Remover usuário dos online
    for (const [usuarioId, dados] of usuariosOnline.entries()) {
      if (dados.socketId === socket.id) {
        usuariosOnline.delete(usuarioId);
        console.log(`👋 ${dados.nome} saiu do app`);
        
        // Notificar sobre mudança de usuários online
        io.to("sala-global").emit("usuarios-online-atualizados", {
          success: true,
          totalOnline: usuariosOnline.size,
          usuarios: Array.from(usuariosOnline.values()).map(u => ({
            nome: u.nome,
            conectadoEm: u.conectadoEm
          })),
          event: "usuarios-online-atualizados",
          timestamp: new Date().toISOString()
        });
        break;
      }
    }
  });

  // Evento: Error handling
  socket.on("error", (error) => {
    console.error("💥 Erro no WebSocket:", error);
  });
});

// Conectar MongoDB
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dengue-tracker", mongoOptions)
  .then(() => console.log("✅ MongoDB conectado com sucesso!"))
  .catch(err => {
    console.log("❌ MongoDB erro:", err.message);
    // Tentar reconectar após 5 segundos
    setTimeout(() => {
      console.log("🔄 Tentando reconectar ao MongoDB...");
      mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    }, 5000);
  });

// ⚠️ IMPORTANTE: Tornar io disponível globalmente
global.io = io;

// Importar e usar rotas
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes"); 
const gamificationRoutes = require("./routes/gamificationRoutes");
const authRoutes = require("./routes/authRoutes"); // Nova rota de autenticação

app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/auth", authRoutes); // Nova rota

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "online",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    websockets: io.engine?.clientsCount || 0,
    event: "health-check",
    environment: process.env.NODE_ENV || "development"
  });
});

// Rota para teste WebSocket SUPER SIMPLES
app.get("/teste-simples", (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Teste WebSocket SUPER Simples</title>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .status { padding: 10px; font-weight: bold; margin: 10px 0; }
      .connected { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
      .disconnected { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      button { padding: 10px 15px; margin: 5px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; }
      button:hover { background: #2980b9; }
      button:disabled { background: #95a5a6; cursor: not-allowed; }
      #log { background: #f5f5f5; padding: 15px; margin-top: 20px; border-radius: 5px; height: 400px; overflow-y: auto; font-family: 'Courier New', monospace; }
      .log-entry { margin-bottom: 5px; padding: 5px; border-bottom: 1px solid #ddd; }
    </style>
  </head>
  <body>
    <h1>🧪 Teste WebSocket SUPER Simples</h1>
    
    <div class="status disconnected" id="status">⚫ DESCONECTADO</div>
    
    <div>
      <button onclick="connect()" id="btnConnect">🔗 Conectar</button>
      <button onclick="sendPing()" id="btnPing" disabled>🏓 Enviar Ping</button>
      <button onclick="testUser()" id="btnUser" disabled>👤 Testar Usuário</button>
      <button onclick="testReport()" id="btnReport" disabled>📋 Testar Reporte</button>
      <button onclick="disconnect()" id="btnDisconnect" disabled>❌ Desconectar</button>
    </div>
    
    <div id="log"></div>

    <script>
      let socket = null;
      const log = document.getElementById('log');
      const status = document.getElementById('status');
      
      function addLog(message, type = 'info') {
        const time = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = \`<strong>[\${time}]</strong> \${message}\`;
        
        if (type === 'success') logEntry.style.color = 'green';
        if (type === 'error') logEntry.style.color = 'red';
        if (type === 'warning') logEntry.style.color = 'orange';
        
        log.appendChild(logEntry);
        log.scrollTop = log.scrollHeight;
      }
      
      function updateUI(connected) {
        const statusDiv = document.getElementById('status');
        if (connected) {
          statusDiv.className = 'status connected';
          statusDiv.textContent = '✅ CONECTADO';
          document.getElementById('btnConnect').disabled = true;
          document.getElementById('btnPing').disabled = false;
          document.getElementById('btnUser').disabled = false;
          document.getElementById('btnReport').disabled = false;
          document.getElementById('btnDisconnect').disabled = false;
        } else {
          statusDiv.className = 'status disconnected';
          statusDiv.textContent = '⚫ DESCONECTADO';
          document.getElementById('btnConnect').disabled = false;
          document.getElementById('btnPing').disabled = true;
          document.getElementById('btnUser').disabled = true;
          document.getElementById('btnReport').disabled = true;
          document.getElementById('btnDisconnect').disabled = true;
        }
      }
      
      function connect() {
        if (socket && socket.readyState === WebSocket.OPEN) {
          addLog('⚠️ Já está conectado!', 'warning');
          return;
        }
        
        addLog('🔗 Conectando ao servidor WebSocket...');
        
        try {
          socket = new WebSocket('ws://localhost:5000');
          
          socket.onopen = function() {
            addLog('✅ CONEXÃO ESTABELECIDA COM SUCESSO!', 'success');
            updateUI(true);
          };
          
          socket.onmessage = function(event) {
            try {
              const data = JSON.parse(event.data);
              addLog(\`📨 \${data.event}: \${JSON.stringify(data).substring(0, 150)}\${JSON.stringify(data).length > 150 ? '...' : ''}\`);
            } catch (e) {
              addLog(\`📨 Mensagem: \${event.data}\`);
            }
          };
          
          socket.onerror = function(error) {
            addLog(\`💥 Erro na conexão: \${error.message || 'Erro desconhecido'}\`, 'error');
            updateUI(false);
          };
          
          socket.onclose = function(event) {
            addLog(\`❌ Conexão fechada. Código: \${event.code}, Razão: "\${event.reason || 'Sem razão'}"\`, 'error');
            updateUI(false);
            socket = null;
          };
          
        } catch (error) {
          addLog(\`💥 Falha ao criar WebSocket: \${error.message}\`, 'error');
          updateUI(false);
        }
      }
      
      function sendPing() {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          addLog('⚠️ Não está conectado!', 'warning');
          return;
        }
        
        addLog('🏓 Enviando ping para o servidor...');
        socket.send(JSON.stringify({ event: 'ping' }));
      }
      
      function testUser() {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          addLog('⚠️ Não está conectado!', 'warning');
          return;
        }
        
        const userId = 'test_' + Date.now();
        const userName = 'Usuário Teste ' + Math.floor(Math.random() * 1000);
        
        const data = {
          event: 'usuario-entrou',
          usuarioId: userId,
          nome: userName
        };
        
        addLog(\`👤 Enviando usuário: \${userName} (ID: \${userId})\`);
        socket.send(JSON.stringify(data));
      }
      
      function testReport() {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          addLog('⚠️ Não está conectado!', 'warning');
          return;
        }
        
        const data = {
          event: 'novo-reporte',
          reporte: {
            id: 'report_' + Date.now(),
            tipo: 'pneu',
            descricao: 'Pneu abandonado com água parada',
            localizacao: {
              lat: -23.55 + (Math.random() - 0.5) * 0.01,
              lng: -46.63 + (Math.random() - 0.5) * 0.01
            },
            usuario: 'Usuário Teste',
            pontos: 10,
            timestamp: new Date().toISOString()
          }
        };
        
        addLog('📋 Enviando reporte simulado...');
        socket.send(JSON.stringify(data));
      }
      
      function disconnect() {
        if (socket) {
          addLog('🛑 Fechando conexão...');
          socket.close();
          socket = null;
        }
        updateUI(false);
      }
      
      // Auto-conectar após 1 segundo
      setTimeout(() => {
        addLog('⏳ Iniciando conexão automática...');
        connect();
      }, 1000);
    </script>
  </body>
  </html>
  `;
  res.send(html);
});

// Rota básica
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "🚀 API Dengue Tracker funcionando!",
    version: "2.0.0",
    security: "🔐 Segurança implementada (CSP desabilitada em dev)",
    websockets: "🔔 WebSockets ativos!",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      reports: "/api/reports", 
      gamification: "/api/gamification",
      health: "/health",
      testeSimples: "/teste-simples"
    },
    environment: process.env.NODE_ENV || "development",
    event: "api-info",
    websocket_test: "Abra /teste-simples para testar WebSocket"
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
    path: req.path,
    event: "not-found",
    suggestions: ["/", "/health", "/teste-simples", "/api/gamification/ranking"]
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("💥 Erro no servidor:", err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "development" ? err.message : "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    event: "server-error"
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(60));
  console.log("🚀 SERVIDOR DENGUE TRACKER INICIADO!");
  console.log("=".repeat(60));
  console.log(`✅ Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🔗 Teste Simples: http://localhost:${PORT}/teste-simples`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Info: http://localhost:${PORT}/`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI ? "Atlas" : "Local"}`);
  console.log("=".repeat(60));
  console.log("🔔 WebSockets PRONTOS para conexões!");
  console.log("=".repeat(60));
});

module.exports = { io, server };