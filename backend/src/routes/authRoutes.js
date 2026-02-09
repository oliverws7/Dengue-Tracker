const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Middlewares
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimit');

/**
 * @openapi
 * tags:
 *   - name: Autenticação
 *     description: Gerenciamento de login e registro de usuários
 */

// ======================
// ROTAS PÚBLICAS
// ======================

router.post(
  '/registrar',
  authLimiter,
  validate(schemas.auth.registrar),
  authController.registrar
);

router.post(
  '/login',
  authLimiter,
  validate(schemas.auth.login),
  authController.login
);

// Aliases
router.post(
  '/register',
  authLimiter,
  validate(schemas.auth.registrar),
  authController.registrar
);

router.post(
  '/login-en',
  authLimiter,
  validate(schemas.auth.login),
  authController.login
);

// ======================
// ROTAS AUTENTICADAS
// ======================

// PERFIL (NOME CORRETO DA FUNÇÃO)
router.get('/perfil', authenticateToken, authController.perfil);
router.get('/profile', authenticateToken, authController.perfil);

// ======================
// ROTAS ADMIN
// ======================

router.get(
  '/usuarios',
  authenticateToken,
  authorizeRoles('admin'),
  userController.getAllUsers
);

router.get(
  '/usuarios/:id',
  authenticateToken,
  (req, res, next) => {
    if (req.user.role === 'admin' || req.user.id === req.params.id) {
      return next();
    }
    return res.status(403).json({ success: false, error: 'Acesso negado' });
  },
  userController.getUserById
);

router.put(
  '/usuarios/:id',
  authenticateToken,
  authorizeRoles('admin'),
  validate(schemas.user.atualizarPerfil),
  userController.updateUser
);

router.delete(
  '/usuarios/:id',
  authenticateToken,
  authorizeRoles('admin'),
  userController.deleteUser
);

// ======================
// TOKEN
// ======================

router.get('/verificar-token', authenticateToken, (req, res) => {
  res.json({ success: true, valid: true, user: req.user });
});

module.exports = router;
