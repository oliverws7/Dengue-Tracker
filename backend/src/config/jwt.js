const jwt = require('jsonwebtoken');
require('dotenv').config();

// Validação crítica de segurança
if (!process.env.JWT_SECRET) {
    throw new Error('❌ CRÍTICO: JWT_SECRET não está definido no .env');
}

const JWT_CONFIG = {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    issuer: process.env.JWT_ISSUER || 'dengue-tracker-api',
    audience: process.env.JWT_AUDIENCE || 'dengue-tracker-app'
};

// Gerar token
const gerarToken = (userId, role) => {
    if (!userId) {
        throw new Error('userId é obrigatório para gerar token');
    }
    
    if (!role) {
        role = 'user';
    }
    
    return jwt.sign(
        { id: userId, role: role },
        JWT_CONFIG.secret,
        { 
            expiresIn: JWT_CONFIG.expiresIn,
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience
        }
    );
};

// Verificar token
const verificarToken = (token) => {
    try {
        return jwt.verify(token, JWT_CONFIG.secret, {
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience
        });
    } catch (error) {
        throw new Error('Token inválido ou expirado: ' + error.message);
    }
};

// Validar token para WebSocket
const validateSocketToken = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_CONFIG.secret, {
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience
        });
        return { valid: true, userId: decoded.id, user: decoded };
    } catch (err) {
        return { valid: false, error: 'Socket authentication failed: ' + err.message };
    }
};

// Middleware de autenticação
const autenticar = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticação não fornecido'
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = verificarToken(token);
        req.user = decoded;
        req.userId = decoded.id; // ADICIONAR ESTA LINHA para compatibilidade com reportController
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

// Middleware de autorização por role
const autorizar = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Permissões insuficientes.'
            });
        }
        
        next();
    };
};

module.exports = {
    gerarToken,
    verificarToken,
    validateSocketToken,
    autenticar,
    autorizar,
    JWT_CONFIG
};