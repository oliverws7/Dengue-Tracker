require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Documentação
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Validação de Ambiente
const validateEnv = require('./utils/validateEnv'); 
validateEnv();

// Configurações e Middlewares Personalizados
const { generalLimiter } = require('./middleware/rateLimit');
const corsMiddleware = require('./middleware/cors');
const healthCheck = require('./middleware/health');

// Inicialização
const app = express();
const server = http.createServer(app);

// ======================
// 1. SEGURANÇA E MIDDLEWARES GLOBAIS
// ======================
app.use(helmet({ 
  crossOriginResourcePolicy: false 
}));
app.use(corsMiddleware);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Sanitização de dados
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate Limiting Global
app.use(generalLimiter);

// ======================
// 2. ARQUIVOS ESTÁTICOS (UPLOADS)
// ======================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// 3. DOCUMENTAÇÃO (SWAGGER) - MODO SEGURO
// ======================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DengueTracker API',
      version: '2.1.0',
      description: 'API profissional para monitoramento e combate à dengue',
      contact: {
        name: "Suporte Técnico",
        email: "suporte@denguetracker.com"
      }
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      }
    }
  },
  // 🔥 CORREÇÃO CRÍTICA AQUI: 
  // Removi './src/routes/*.js' para o servidor parar de ler os arquivos quebrados.
  // Ele vai ler APENAS este arquivo (server.js) agora.
  apis: ['./src/server.js', './src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ======================
// 4. CONEXÃO COM BANCO DE DADOS
// ======================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado com sucesso!'))
  .catch(err => {
    console.error('❌ Erro fatal ao conectar no MongoDB:', err.message);
    process.exit(1);
  });

// ======================
// 5. CONFIGURAÇÃO WEBSOCKET
// ======================
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

const { validateSocketToken } = require('./config/jwt'); 
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  
  if (!token) {
    socket.isAuthenticated = false;
    return next();
  }
  
  try {
    const result = await validateSocketToken(token);
    if (result.valid) {
      socket.userId = result.userId;
      socket.isAuthenticated = true;
      next();
    } else {
      next(new Error('Token inválido'));
    }
  } catch (err) {
    next(new Error('Erro ao validar token'));
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket conectado: ${socket.id}`);
  
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} entrou na sala ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket desconectado: ${socket.id}`);
  });
});

global.io = io;

// ======================
// 6. ROTAS (ROUTERS)
// ======================
/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Verifica status da API
 *     responses:
 *       200:
 *         description: API Online
 */

app.get("/", (req, res) => {
  res.json({ 
    status: "online", 
    message: "🚀 DengueTracker API v2.1 rodando", 
    docs: "/api-docs" 
  });
});

// Health Check
app.use('/health', healthCheck);

// ======================
// 6. DEFINIÇÃO DE ROTAS
// ======================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/gamification', require('./routes/gamificationRoutes'));
app.use('/api/integrations', require('./routes/integrationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/external', require('./routes/externalRoutes'));

// ======================
// 7. TRATAMENTO DE ERROS GLOBAIS
// ======================

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Erro não tratado:', err.stack);
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;

  res.status(500).json({
    success: false,
    error: errorMessage,
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// ======================
// 8. INICIALIZAÇÃO DO SERVIDOR
// ======================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 Documentação: http://localhost:${PORT}/api-docs`);
    console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB desconectado.');
      process.exit(0);
    });
  });
});

module.exports = { app, server, io };