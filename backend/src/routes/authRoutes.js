const express = require('express');
const router = express.Router();

// Importar Controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Importar Middlewares (baseado nos arquivos corrigidos anteriormente)
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimit');

// ======================
// ROTAS PÚBLICAS
// ======================

// Registro
router.post('/registrar', 
    authLimiter, 
    validate(schemas.auth.registrar), 
    authController.registrar
);

// Login
router.post('/login',
    authLimiter,
    validate(schemas.auth.login),
    authController.login
);

// Rotas em inglês (Alias para compatibilidade)
router.post('/register', authLimiter, validate(schemas.auth.register), authController.registrar);
router.post('/login-en', authLimiter, validate(schemas.auth.loginEn), authController.login);

// ======================
// ROTAS DO USUÁRIO (Requer Login)
// ======================

// Perfil do usuário logado
router.get('/perfil', authenticateToken, authController.perfil);
router.get('/profile', authenticateToken, authController.perfil); // Alias

// Atualizar o próprio perfil
router.put('/perfil',
    authenticateToken,
    validate(schemas.user.atualizarPerfil),
    authController.atualizarPerfil
);

// Alterar senha
router.put('/alterar-senha',
    authenticateToken,
    validate(schemas.user.alterarSenha),
    authController.alterarSenha
);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// ======================
// ROTAS ADMIN (Gerenciamento de Usuários)
// ======================

// Listar todos usuários
router.get('/usuarios',
    authenticateToken,
    authorizeRoles('admin'),
    userController.getAllUsers
);

// Buscar usuário por ID
router.get('/usuarios/:id',
    authenticateToken,
    (req, res, next) => {
        // Permite admin ver qualquer um, ou usuário ver a si mesmo
        if (req.user.role === 'admin' || req.user.id === req.params.id) {
            return next();
        }
        return res.status(403).json({ success: false, error: 'Acesso negado' });
    },
    userController.getUserById
);

// Atualizar usuário (Admin)
router.put('/usuarios/:id',
    authenticateToken,
    authorizeRoles('admin'), // Apenas admin altera outros usuários por aqui
    validate(schemas.user.atualizarPerfil),
    userController.updateUser
);

// Deletar usuário (Admin)
router.delete('/usuarios/:id',
    authenticateToken,
    authorizeRoles('admin'),
    userController.deleteUser
);

// ======================
// ROTAS DE UTILIDADE
// ======================

router.get('/verificar-token', authenticateToken, (req, res) => {
    res.json({
        success: true,
        valid: true,
        user: req.user
    });
});

module.exports = router;