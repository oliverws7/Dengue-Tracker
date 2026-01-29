const rateLimit = require('express-rate-limit');

// Helper para obter IP do cliente de forma segura
// O express-rate-limit já faz isso internamente via req.ip, mas se precisar customizar:
const getIp = (req) => req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

// Rate limiting geral
exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    error: 'Muitas requisições deste IP. Tente novamente após 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Tenta pegar o ID do usuário se estiver logado (compatível com seus controllers)
    const userId = req.user?.id || req.userId;
    if (userId) {
      return `user:${userId}`;
    }
    return getIp(req);
  },
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      const ip = getIp(req);
      return ip === '::1' || ip === '127.0.0.1';
    }
    return false;
  }
});

// Rate limiting para autenticação (Login)
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 tentativas falhas por hora
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente após uma hora.',
    code: 'AUTH_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Importante: não bloqueia quem acerta a senha
  keyGenerator: (req) => {
    // Tenta limitar pelo email enviado no body, senão pelo IP
    // Nota: Requer que o express.json() venha ANTES deste limiter no app.js
    const email = req.body?.email;
    if (email) {
      return `auth:${email}`;
    }
    return getIp(req);
  }
});

// Rate limiting para relatórios
exports.reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: {
    success: false,
    error: 'Limite de relatórios excedido. Tente novamente após uma hora.',
    code: 'REPORT_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?.id || req.userId;
    if (userId) {
      return `user:${userId}:reports`;
    }
    return `ip:${getIp(req)}:reports`;
  }
});

// Rate limiting para API pública
exports.apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: 'Limite de requisições excedido para API pública.',
    code: 'API_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getIp(req)
});

// Rate limiting para WebSocket
exports.wsConnectionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: 'Muitas conexões WebSocket. Tente novamente mais tarde.',
    code: 'WS_CONNECTION_LIMIT'
  },
  keyGenerator: (req) => getIp(req)
});

// Rate limiting para uploads
exports.uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Limite de uploads excedido. Tente novamente após uma hora.',
    code: 'UPLOAD_LIMIT_EXCEEDED'
  },
  keyGenerator: (req) => {
    const userId = req.user?.id || req.userId;
    if (userId) {
      return `user:${userId}:uploads`;
    }
    return getIp(req);
  }
});