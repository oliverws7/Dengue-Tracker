const cors = require('cors');

// Tenta pegar do .env, senão usa os padrões de desenvolvimento
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

const corsOptions = {
    origin: function (origin, callback) {
        // Permite requests sem origin (mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            console.error('🚫 CORS bloqueado:', origin);
            return callback(new Error('A política de CORS não permite acesso desta origem.'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400, // 24 horas
    preflightContinue: false,
    optionsSuccessStatus: 204
};

module.exports = cors(corsOptions);