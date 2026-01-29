const express = require('express');
const router = express.Router();

// Fallback para rotas não encontradas
// IMPORTANTE: Este router deve ser o ÚLTIMO a ser carregado no seu app.js
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
    message: 'O recurso solicitado não existe ou a rota está incorreta.'
  });
});

module.exports = router;