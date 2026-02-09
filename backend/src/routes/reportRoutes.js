const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// --- CORREÇÃO AQUI: Extraindo a função do objeto ---
const { authenticateToken } = require('../middleware/auth'); 
const { validate, schemas } = require('../middleware/validators');

// ======================
// ROTAS PRIVADAS (Requer Login)
// ======================

// 1. Criar novo relatório (Foco/Caso)
router.post(
  '/', 
  authenticateToken,               // Agora é a função correta
  validate(schemas.report.create), // Validação do Joi
  reportController.criarReporte
);

// 2. Listar meus relatórios
router.get(
  '/meus', 
  authenticateToken, 
  reportController.listarMeusReportes
);

// 3. Atualizar status (Admin)
router.put(
  '/status', 
  authenticateToken, 
  reportController.atualizarStatus
);

// ======================
// ROTAS PÚBLICAS
// ======================

// 4. Listar todos (Feed/Mapa)
router.get(
  '/', 
  reportController.listarReportes
);

module.exports = router;