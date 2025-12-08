const rateLimit = require('express-rate-limit');

// Rate limiting geral para API
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

// Rate limiting mais restrito para login
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 tentativas de login por hora
    message: {
        success: false,
        message: 'Muitas tentativas de login. Tente novamente em uma hora.'
    },
    skipSuccessfulRequests: true // Não contar tentativas bem-sucedidas
});

// Rate limiting para criação de reportes
const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // 20 reportes por hora
    message: {
        success: false,
        message: 'Limite de reportes excedido. Tente novamente em uma hora.'
    }
});

module.exports = {
    apiLimiter,
    loginLimiter,
    reportLimiter
};