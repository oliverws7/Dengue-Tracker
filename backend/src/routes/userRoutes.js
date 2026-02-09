// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @openapi
 * tags:
 *   - name: Usuarios
 *     description: Gestão de perfis e conta
 */

/**
 * @openapi
 * /api/users/perfil:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtém os dados do perfil do usuário logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *       401:
 *         description: Não autorizado
 */
router.get('/perfil', authenticateToken, userController.getPerfil);

/**
 * @openapi
 * /api/users/verificar-email/{email}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Verifica se um email já está cadastrado
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado da verificação
 *       400:
 *         description: Email inválido
 */
router.get('/verificar-email/:email', userController.verificarEmail);

module.exports = router;
