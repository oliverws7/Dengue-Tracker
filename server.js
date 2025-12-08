require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configuração de CORS
const corsOptions = {
  origin: "*", // Permitir todas as origens para desenvolvimento
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  maxAge: 86400
};

// Middleware básico
app.use(cors(corsOptions));
app.use(express.json());

// Configurar WebSocket
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Sistema de usuários online
const usuariosOnline = new Map();

// WebSocket Connection Handler
io.on("connection", (socket) => {
  console.log("✅ NOVA CONEXÃO:", socket.id);
  
  // Enviar mensagem de boas-vindas
  socket.emit("conexao-estabelecida", {
    event: "conexao-estabelecida",
    message: "Conectado ao Dengue Tracker!",
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Evento: Ping
  socket.on("ping", () => {
    console.log("🏓 Ping recebido de", socket.id);
    socket.emit("pong", {
      event: "pong",
      message: "Pong do servidor!",
      timestamp: new Date().toISOString()
    });
  });

  // Evento: Usuário entra
  socket.on("usuario-entrou", (dadosUsuario) => {
    const { usuarioId, nome } = dadosUsuario || {};
    
    if (!usuarioId || !nome) {
      return socket.emit("erro", {
        event: "erro",
        message: "Dados incompletos"
      });
    }
    
    // Registrar usuário online
    usuariosOnline.set(usuarioId, {
      socketId: socket.id,
      nome: nome,
      conectadoEm: new Date()
    });

    // Entrar na sala do usuário
    socket.join(`usuario:${usuarioId}`);
    
    // Entrar na sala global
    socket.join("sala-global");
    
    console.log(`👤 ${nome} entrou no app`);
    
    // Notificar todos sobre usuários online
    io.to("sala-global").emit("usuarios-online-atualizados", {
      event: "usuarios-online-atualizados",
      success: true,
      totalOnline: usuariosOnline.size,
      usuarios: Array.from(usuariosOnline.values()).map(u => ({
        nome: u.nome,
        conectadoEm: u.conectadoEm
      }))
    });

    // Confirmar para o usuário
    socket.emit("usuario-autenticado", {
      event: "usuario-autenticado",
      success: true,
      message: `Bem-vindo, ${nome}!`,
      usuarioId: usuarioId
    });
  });

  // Evento: Entrar na sala de ranking
  socket.on("entrar-sala-ranking", () => {
    socket.join("sala-ranking");
    console.log(`📊 ${socket.id} entrou na sala de ranking`);
    
    // Enviar ranking fake para teste
    const rankingFake = [
      { nome: "João Silva", pontos: 150, nivel: "caçador" },
      { nome: "Maria Santos", pontos: 120, nivel: "caçador" },
      { nome: "Pedro Oliveira", pontos: 90, nivel: "iniciante" }
    ];
    
    socket.emit("ranking-atualizado", {
      event: "ranking-atualizado",
      ranking: rankingFake,
      message: "Você entrou na sala de ranking"
    });
  });

  // Evento: Simular novo reporte
  socket.on("novo-reporte", (dadosReporte) => {
    console.log("📋 Novo reporte:", dadosReporte);
    
    // Emitir para sala global
    io.to("sala-global").emit("reporte-criado", {
      event: "reporte-criado",
      reporte: dadosReporte,
      message: "Novo foco de dengue reportado!"
    });
  });

  // Evento: Simular conquista
  socket.on("conquista-desbloqueada", (dadosConquista) => {
    console.log("🏆 Conquista:", dadosConquista);
    
    // Emitir para o usuário
    if (dadosConquista.usuarioId) {
      io.to(`usuario:${dadosConquista.usuarioId}`).emit("conquista-notificacao", {
        event: "conquista-notificacao",
        conquista: dadosConquista,
        message: "Parabéns! Conquista desbloqueada!"
      });
    }
  });

  // Evento: Ouvir área
  socket.on("ouvir-area", (dadosArea) => {
    const { lat, lng, raio } = dadosArea || {};
    
    if (lat === undefined || lng === undefined) {
      return socket.emit("erro", {
        event: "erro",
        message: "Coordenadas necessárias"
      });
    }
    
    const salaArea = `area:${lat.toFixed(2)}:${lng.toFixed(2)}`;
    socket.join(salaArea);
    console.log(`🗺️ ${socket.id} ouvindo área ${salaArea}`);
    
    socket.emit("area-configurada", {
      event: "area-configurada",
      sala: salaArea,
      lat: lat,
      lng: lng,
      raio: raio,
      message: `Ouvindo área ${salaArea}`
    });
  });

  // Evento: Disconnect
  socket.on("disconnect", () => {
    console.log("❌ Desconectado:", socket.id);
    
    // Remover usuário dos online
    for (const [usuarioId, dados] of usuariosOnline.entries()) {
      if (dados.socketId === socket.id) {
        usuariosOnline.delete(usuarioId);
        console.log(`👋 ${dados.nome} saiu`);
        
        // Notificar sobre mudança
        io.to("sala-global").emit("usuarios-online-atualizados", {
          event: "usuarios-online-atualizados",
          totalOnline: usuariosOnline.size,
          usuarios: Array.from(usuariosOnline.values()).map(u => ({
            nome: u.nome,
            conectadoEm: u.conectadoEm
          }))
        });
        break;
      }
    }
  });
});

// Conectar MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dengue-tracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB conectado"))
.catch(err => console.log("❌ MongoDB erro:", err.message));

global.io = io;

// Importar rotas
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes"); 
const gamificationRoutes = require("./routes/gamificationRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/auth", authRoutes);

// ✅ SUA PÁGINA HTML NA RAIZ (porta 5000)
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste WebSocket - Dengue Tracker</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .status { padding: 10px; border-radius: 5px; margin-bottom: 20px; font-weight: bold; }
        .connected { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .disconnected { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px; }
        button { padding: 10px 15px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; }
        button:hover { background: #2980b9; }
        button:disabled { background: #95a5a6; cursor: not-allowed; }
        .area-control { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        input { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; width: 100px; }
        .logs { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; font-family: monospace; height: 300px; overflow-y: auto; }
        .log-entry { margin-bottom: 5px; padding: 5px; border-bottom: 1px solid #34495e; }
        .log-time { color: #3498db; }
        .log-event { color: #2ecc71; }
        .log-error { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔌 Teste WebSocket - Dengue Tracker</h1>
        
        <div id="status" class="status disconnected">
            ⚫ Desconectado
        </div>
        
        <div class="controls">
            <button onclick="connectWebSocket()" id="btnConnect">🔄 Conectar</button>
            <button onclick="simulateUser()" id="btnUser" disabled>👤 Simular Usuário Entrando</button>
            <button onclick="simulateReport()" id="btnReport" disabled>📋 Simular Novo Reporte</button>
            <button onclick="simulateAchievement()" id="btnAchieve" disabled>🏆 Simular Conquista</button>
            <button onclick="enterRankingRoom()" id="btnRanking" disabled>📊 Entrar Sala Ranking</button>
            <button onclick="disconnectWebSocket()" id="btnDisconnect" disabled>❌ Desconectar</button>
        </div>
        
        <div class="area-control">
            <h3>🗺️ Ouvir Área Específica</h3>
            <div>
                <input type="number" id="lat" step="0.01" value="-23.55" placeholder="Latitude">
                <input type="number" id="lng" step="0.01" value="-46.63" placeholder="Longitude">
                <input type="number" id="raio" value="1" placeholder="Raio (km)">
                <button onclick="listenToArea()" id="btnArea" disabled>Ouvir Área</button>
            </div>
        </div>
        
        <div>
            <h3>📝 Log de Eventos:</h3>
            <div class="logs" id="logContainer">
                <!-- Logs aparecerão aqui -->
            </div>
        </div>
        
        <div style="margin-top: 20px; color: #7f8c8d; font-size: 12px;">
            <p>🔗 Servidor: <span id="serverUrl">ws://localhost:5000</span></p>
            <p>🆔 Socket ID: <span id="socketId">-</span></p>
            <p>👥 Usuários Online: <span id="onlineCount">0</span></p>
        </div>
    </div>

    <script>
        let socket = null;
        const logContainer = document.getElementById('logContainer');
        const statusDiv = document.getElementById('status');
        const socketIdSpan = document.getElementById('socketId');
        const onlineCountSpan = document.getElementById('onlineCount');
        
        // Configuração
        const serverUrl = 'ws://localhost:5000';
        document.getElementById('serverUrl').textContent = serverUrl;
        
        function log(message, type = 'info') {
            const time = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = \`<span class="log-time">[\${time}]</span> <span class="log-event \${type}">\${message}</span>\`;
            logContainer.appendChild(logEntry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
        
        function updateStatus(connected) {
            const statusDiv = document.getElementById('status');
            if (connected) {
                statusDiv.className = 'status connected';
                statusDiv.innerHTML = '✅ Conectado';
                document.getElementById('btnConnect').disabled = true;
                document.getElementById('btnDisconnect').disabled = false;
                document.getElementById('btnUser').disabled = false;
                document.getElementById('btnReport').disabled = false;
                document.getElementById('btnAchieve').disabled = false;
                document.getElementById('btnRanking').disabled = false;
                document.getElementById('btnArea').disabled = false;
            } else {
                statusDiv.className = 'status disconnected';
                statusDiv.innerHTML = '⚫ Desconectado';
                document.getElementById('btnConnect').disabled = false;
                document.getElementById('btnDisconnect').disabled = true;
                document.getElementById('btnUser').disabled = true;
                document.getElementById('btnReport').disabled = true;
                document.getElementById('btnAchieve').disabled = true;
                document.getElementById('btnRanking').disabled = true;
                document.getElementById('btnArea').disabled = true;
                socketIdSpan.textContent = '-';
            }
        }
        
        function connectWebSocket() {
            if (socket && socket.readyState === WebSocket.OPEN) {
                log('⚠️ Já conectado', 'warning');
                return;
            }
            
            log(\`🔗 Conectando ao servidor: \${serverUrl}...\`);
            
            try {
                socket = new WebSocket(serverUrl);
                
                socket.onopen = function(event) {
                    log('✅ Conexão WebSocket estabelecida!', 'success');
                    updateStatus(true);
                    socketIdSpan.textContent = 'Conectado';
                    
                    // Enviar ping para testar
                    setTimeout(() => {
                        socket.send(JSON.stringify({ event: 'ping' }));
                    }, 1000);
                };
                
                socket.onmessage = function(event) {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.event === 'pong') {
                            log(\`🏓 Pong recebido: \${data.timestamp}\`);
                        } else if (data.event === 'usuarios-online-atualizados') {
                            onlineCountSpan.textContent = data.totalOnline || 0;
                            log(\`👥 Usuários online: \${data.totalOnline}\`, 'info');
                        } else if (data.event === 'usuario-autenticado') {
                            log(\`👤 \${data.message}\`, 'success');
                        } else if (data.event === 'ranking-atualizado') {
                            log(\`📊 Ranking recebido com \${data.ranking.length} usuários\`, 'info');
                        } else if (data.event === 'reporte-criado') {
                            log(\`📋 Novo reporte: \${data.message}\`, 'info');
                        } else if (data.event === 'conquista-notificacao') {
                            log(\`🏆 \${data.message}\`, 'success');
                        } else if (data.event === 'area-configurada') {
                            log(\`🗺️ \${data.message}\`, 'info');
                        } else {
                            log(\`📨 Evento: \${data.event} - \${JSON.stringify(data).substring(0, 100)}\${JSON.stringify(data).length > 100 ? '...' : ''}\`, 'info');
                        }
                    } catch (e) {
                        log(\`📨 Mensagem: \${event.data}\`, 'info');
                    }
                };
                
                socket.onclose = function(event) {
                    log(\`❌ Conexão fechada. Código: \${event.code}, Razão: "\${event.reason || 'Sem razão'}"\`, 'error');
                    updateStatus(false);
                };
                
                socket.onerror = function(error) {
                    log(\`💥 Erro no WebSocket: \${error.message || 'Erro desconhecido'}\`, 'error');
                    updateStatus(false);
                };
                
            } catch (error) {
                log(\`💥 Erro ao conectar: \${error.message}\`, 'error');
                updateStatus(false);
            }
        }
        
        function disconnectWebSocket() {
            if (socket) {
                log('🛑 Desconectando...');
                socket.close();
                socket = null;
            }
            updateStatus(false);
        }
        
        function simulateUser() {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                log('⚠️ Conecte primeiro!', 'warning');
                return;
            }
            
            const usuarioId = 'test_' + Date.now();
            const nome = 'Usuário Teste ' + Math.floor(Math.random() * 100);
            
            const data = {
                event: 'usuario-entrou',
                usuarioId: usuarioId,
                nome: nome
            };
            
            socket.send(JSON.stringify(data));
            log(\`👤 Simulando usuário: \${nome} (\${usuarioId})\`);
        }
        
        function simulateReport() {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                log('⚠️ Conecte primeiro!', 'warning');
                return;
            }
            
            const data = {
                event: 'novo-reporte',
                reporte: {
                    id: 'report_' + Date.now(),
                    tipo: 'pneu',
                    localizacao: {
                        lat: -23.55 + (Math.random() - 0.5) * 0.1,
                        lng: -46.63 + (Math.random() - 0.5) * 0.1
                    },
                    usuario: 'Teste',
                    pontos: 10
                }
            };
            
            socket.send(JSON.stringify(data));
            log('📋 Simulando novo reporte de dengue');
        }
        
        function simulateAchievement() {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                log('⚠️ Conecte primeiro!', 'warning');
                return;
            }
            
            const data = {
                event: 'conquista-desbloqueada',
                conquista: {
                    id: 'achievement_' + Date.now(),
                    nome: 'Caçador de Focos',
                    descricao: 'Reportou 10 focos de dengue',
                    usuario: 'Usuário Teste'
                }
            };
            
            socket.send(JSON.stringify(data));
            log('🏆 Simulando conquista desbloqueada');
        }
        
        function enterRankingRoom() {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                log('⚠️ Conecte primeiro!', 'warning');
                return;
            }
            
            const data = {
                event: 'entrar-sala-ranking'
            };
            
            socket.send(JSON.stringify(data));
            log('📊 Entrando na sala de ranking');
        }
        
        function listenToArea() {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                log('⚠️ Conecte primeiro!', 'warning');
                return;
            }
            
            const lat = parseFloat(document.getElementById('lat').value) || -23.55;
            const lng = parseFloat(document.getElementById('lng').value) || -46.63;
            const raio = parseFloat(document.getElementById('raio').value) || 1;
            
            const data = {
                event: 'ouvir-area',
                lat: lat,
                lng: lng,
                raio: raio
            };
            
            socket.send(JSON.stringify(data));
            log(\`🗺️ Ouvindo área: \${lat.toFixed(4)}, \${lng.toFixed(4)} (raio: \${raio}km)\`);
        }
        
        // Auto-conectar ao carregar a página
        window.onload = function() {
            log('📄 Página de teste WebSocket carregada');
            log('🔄 Conectando automaticamente em 1 segundo...');
            
            setTimeout(() => {
                connectWebSocket();
            }, 1000);
        };
    </script>
</body>
</html>
  `);
});

// Health check (mantém API)
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "online",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    websockets: io.engine?.clientsCount || 0,
    environment: process.env.NODE_ENV || "development"
  });
});

// API info em outra rota
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API Dengue Tracker",
    version: "2.0.0",
    endpoints: {
      users: "/api/users",
      reports: "/api/reports",
      gamification: "/api/gamification",
      auth: "/api/auth",
      health: "/health"
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 DENGUE TRACKER BACKEND INICIADO!');
  console.log('='.repeat(60));
  console.log(`🌐 Interface WebSocket: http://localhost:${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 API Info: http://localhost:${PORT}/api`);
  console.log('='.repeat(60));
  console.log('🔌 WebSocket pronto para conexões!');
  console.log('='.repeat(60));
});