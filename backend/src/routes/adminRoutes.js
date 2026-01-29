const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Report = require('../models/Report');
const userController = require('../controllers/userController');
const reportController = require('../controllers/reportController');

// Importa os middlewares centrais (certifique-se que o caminho está correto)
const { autenticar, autorizar } = require('../config/jwt'); 

// Aplica proteção em TODAS as rotas deste arquivo
router.use(autenticar);
router.use(autorizar('admin'));

// 1. Dashboard Admin (Com dados reais do Banco)
router.get('/dashboard', async (req, res) => {
  try {
    // Executa as contagens em paralelo para ser mais rápido
    const [totalUsers, totalReports, pendingReports, topUsers] = await Promise.all([
      User.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pendente' }),
      User.find().sort({ pontos: -1 }).limit(5).select('nome pontos')
    ]);

    res.json({
      success: true,
      data: {
        message: 'Dashboard atualizado',
        stats: {
          totalUsers,
          totalReports,
          pendingReports,
          resolvedReports: totalReports - pendingReports
        },
        topUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar dashboard',
      details: error.message
    });
  }
});

// 2. Gerenciamento de Usuários (Reutiliza userController)
router.get('/users', userController.getAllUsers);
router.delete('/users/:id', userController.deleteUser);
router.put('/users/:id', userController.updateUser); // Admin pode editar qualquer um

// 3. Gerenciamento de Relatórios (Reutiliza reportController)
router.get('/reports', reportController.listarReportes);

// Rota específica para admin forçar mudança de status (ex: "eliminado" ou "falso")
router.patch('/reports/:id/status', reportController.atualizarStatus);

module.exports = router;