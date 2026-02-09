const express = require("express");
const router = express.Router();
const gamificationController = require("../controllers/gamificationController");
const { authenticateToken } = require("../middleware/auth");

// ======================
// DOCUMENTAÇÃO SWAGGER (TAGS)
// ======================
/**
 * @openapi
 * tags:
 *   - name: Gamificacao
 *     description: Sistema de pontos, ranking e conquistas
 */

// ======================
// RANKING
// ======================
/**
 * @openapi
 * /api/gamification/ranking:
 *   get:
 *     tags:
 *       - Gamificacao
 *     summary: Retorna o ranking global de usuários
 *     responses:
 *       200:
 *         description: Lista de usuários ordenada por pontos
 */
router.get("/ranking", gamificationController.getRanking);

// ======================
// ESTATÍSTICAS
// ======================
/**
 * @openapi
 * /api/gamification/estatisticas:
 *   get:
 *     tags:
 *       - Gamificacao
 *     summary: Retorna estatísticas globais do sistema
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
router.get("/estatisticas", gamificationController.getEstatisticasGlobais);

// ======================
// RECOMPENSA DIÁRIA
// ======================
/**
 * @openapi
 * /api/gamification/recompensa-diaria:
 *   post:
 *     tags:
 *       - Gamificacao
 *     summary: Resgata a pontuação diária do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recompensa resgatada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.post(
  "/recompensa-diaria",
  authenticateToken,
  gamificationController.recompensaDiaria
);

module.exports = router;
