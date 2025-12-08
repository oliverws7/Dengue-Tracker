const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'sua-chave-secreta-aqui-mude-em-producao',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'dengue-tracker-api'
};

// Gerar token
const gerarToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role: role },
        JWT_CONFIG.secret,
        { expiresIn: JWT_CONFIG.expiresIn, issuer: JWT_CONFIG.issuer }
    );
};

// Verificar token
const verificarToken = (token) => {
    try {
        return jwt.verify(token, JWT_CONFIG.secret);
    } catch (error) {
        throw new Error('Token inválido ou expirado');
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
    autenticar,
    autorizar,
    JWT_CONFIG
};