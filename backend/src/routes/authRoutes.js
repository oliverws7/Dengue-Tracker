const express = require('express');
const router = express.Router();

// Importar Controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Importar Middlewares
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimit');

// ======================
// DOCUMENTAÇÃO SWAGGER (TAGS)
// ======================
/**
 * @openapi
 * tags:
 *   - name: Autenticação
 *     description: Gerenciamento de login e registro de usuários
 */

// ======================
// ROTAS PÚBLICAS
// ======================

/**
 * @openapi
 * /api/auth/registrar:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Cria uma nova conta de usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/registrar',
  authLimiter,
  validate(schemas.auth.registrar),
  authController.registrar
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Realiza login e retorna o Token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 default: admin@dengue.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 default: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 */
router.post(
  '/login',
  authLimiter,
  validate(schemas.auth.login),
  authController.login
);

// Rotas Alias (sem Swagger)
router.post('/register', authLimiter, validate(schemas.auth.register), authController.registrar);
router.post('/login-en', authLimiter, validate(schemas.auth.loginEn), authController.login);

// ======================
// ROTAS DO USUÁRIO (Requer Login)
// ======================

/**
 * @openapi
 * /api/auth/perfil:
 *   get:
 *     tags:
 *       - Autenticação
 *     summary: Retorna os dados do usuário logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil recuperados
 *       401:
 *         description: Não autorizado (Token inválido ou ausente)
 */
router.get('/perfil', authenticateToken, authController.perfil);
router.get('/profile', authenticateToken, authController.perfil);

// Atualizar perfil
router.put(
  '/perfil',
  authenticateToken,
  authLimiter, // Adicionar rate limit para prevenir abuso
  validate(schemas.user.atualizarPerfil),
  authController.atualizarPerfil
);

// Alterar senha
router.put(
  '/alterar-senha',
  authenticateToken,
  authLimiter, // Adicionar rate limit para prevenir abuso
  validate(schemas.user.alterarSenha),
  authController.alterarSenha
);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// ======================
// ROTAS ADMIN
// ======================

// Listar usuários
router.get(
  '/usuarios',
  authenticateToken,
  authorizeRoles('admin'),
  userController.getAllUsers
);

// Buscar usuário por ID
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

// Atualizar usuário
router.put(
  '/usuarios/:id',
  authenticateToken,
  authorizeRoles('admin'),
  validate(schemas.user.atualizarPerfil),
  userController.updateUser
);

// Deletar usuário
router.delete(
  '/usuarios/:id',
  authenticateToken,
  authorizeRoles('admin'),
  userController.deleteUser
);

// Verificar token
router.get('/verificar-token', authenticateToken, (req, res) => {
  res.json({ success: true, valid: true, user: req.user });
});

module.exports = router;
