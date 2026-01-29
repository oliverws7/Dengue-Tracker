const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { apiLimiter } = require('../middleware/rateLimit');

// Middleware de segurança para API Key
const requireApiKey = (req, res, next) => {
  const apiKey = req.header('x-api-key');
  // Defina EXTERNAL_API_KEY no seu arquivo .env
  const validKey = process.env.EXTERNAL_API_KEY || 'chave-segura-padrao-dev';
  
  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({
      success: false,
      error: 'Acesso não autorizado. API Key inválida ou ausente.',
      code: 'INVALID_API_KEY'
    });
  }
  next();
};

// Aplica Rate Limit e Validação de Key em todas as rotas abaixo
router.use(apiLimiter);
router.use(requireApiKey);

// 1. Estatísticas Gerais (Dados Reais)
router.get('/stats', async (req, res) => {
  try {
    const totalReports = await Report.countDocuments({ isPublic: true });
    
    // Casos considerados "ativos" (não eliminados)
    const activeCases = await Report.countDocuments({ 
      status: { $in: ['pendente', 'confirmado', 'investigando'] },
      isPublic: true 
    });

    // Casos resolvidos
    const resolvedCases = await Report.countDocuments({ 
      status: 'eliminado',
      isPublic: true 
    });

    res.json({
      success: true,
      data: {
        totalReports,
        activeCases,
        resolvedCases,
        lastUpdate: new Date()
      },
      message: 'Estatísticas em tempo real recuperadas com sucesso'
    });
  } catch (error) {
    console.error('Erro na integração /stats:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
});

// 2. Feed de Relatórios (Dados Reais com Paginação)
router.get('/reports', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Proteção: Limite máximo de 100 itens por requisição externa
    const safeLimit = Math.min(limit, 100);

    const reports = await Report.find({ isPublic: true })
      .select('localizacao tipoCriadouro status nivelRisco dataOcorrencia cidade bairro -_id') // Seleciona apenas campos públicos e seguros
      .sort({ createdAt: -1 }) // Mais recentes primeiro
      .skip(skip)
      .limit(safeLimit)
      .lean();

    const total = await Report.countDocuments({ isPublic: true });

    res.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    });
  } catch (error) {
    console.error('Erro na integração /reports:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
});

module.exports = router;