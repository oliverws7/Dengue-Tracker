const express = require('express');
const router = express.Router();

// ======================
// FALLBACK – ROTA NÃO ENCONTRADA
// ======================
// ⚠️ Este router deve ser o ÚLTIMO a ser registrado no app/server
/**
 * @openapi
 * /{path}:
 *   all:
 *     tags:
 *       - Sistema
 *     summary: Rota não encontrada
 *     description: Fallback para qualquer rota inexistente
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       404:
 *         description: Rota não encontrada
 */
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
    message: 'O recurso solicitado não existe ou a rota está incorreta.'
  });
});

module.exports = router;
