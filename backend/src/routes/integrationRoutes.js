// src/routes/integrationRoutes.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { apiLimiter } = require('../middleware/rateLimit');

// Middleware de segurança para API Key (Simples)
const requireApiKey = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  // Em produção, use process.env.EXTERNAL_API_KEY
  const validKey = process.env.EXTERNAL_API_KEY || 'chave-padrao-dev';
  
  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({
      success: false,
      error: 'Acesso não autorizado. API Key inválida.',
      code: 'INVALID_API_KEY'
    });
  }
  next();
};

// Aplica Rate Limit e Validação de Key
router.use(apiLimiter);
router.use(requireApiKey);

// 1. Estatísticas Gerais
router.get('/stats', async (req, res) => {
  try {
    const totalReports = await Report.countDocuments({ isPublic: true });
    const resolvedCases = await Report.countDocuments({ status: 'eliminado', isPublic: true });

    res.json({
      success: true,
      data: {
        totalReports,
        resolvedCases,
        lastUpdate: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// 2. Feed de Relatórios (Paginação)
router.get('/reports', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const reports = await Report.find({ isPublic: true })
      .select('localizacao tipoCriadouro status nivelRisco dataOcorrencia cidade -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

module.exports = router;