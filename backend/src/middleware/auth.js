const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'denguetracker-secret-key';

const auth = {
    // Validação principal para rotas API
    authenticateToken: (req, res, next) => {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.replace('Bearer ', '');

        if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            // Garante compatibilidade com controllers que buscam req.userId ou req.user.id
            req.userId = decoded.id || decoded.userId; 
            next();
        } catch (err) {
            res.status(401).json({ error: 'Token inválido ou expirado.' });
        }
    },

    // Autorização por cargo
    authorizeRoles: (...roles) => {
        return (req, res, next) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Acesso proibido para este nível de usuário.' });
            }
            next();
        };
    },

    // Validação para conexões WebSocket
    validateSocketToken: async (token) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            // Correção: O payload do JWT usa 'id', mas o socket pode esperar userId
            return { valid: true, userId: decoded.id || decoded.userId, user: decoded };
        } catch (err) {
            return { valid: false, error: 'Socket authentication failed' };
        }
    },

    // Placeholders para compatibilidade
    setUser: (req, res, next) => next(),
    optionalAuth: (req, res, next) => next(),
    validateApiKey: (req, res, next) => next(),
    
    // Pequena melhoria: Headers de segurança básicos em vez de vazio
    securityHeaders: (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    },
    
    revokeToken: (req, res, next) => next(),
    cleanupRevokedTokens: () => 0
};

module.exports = auth;