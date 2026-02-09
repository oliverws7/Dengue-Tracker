const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { apiLimiter } = require('../middleware/rateLimit');

// ======================
// DOCUMENTAÇÃO SWAGGER (TAGS)
// ======================
/**
 * @openapi
 * tags:
 *   - name: Gamificacao
 *     description: Sistema de ranking e pontuação
 *   - name: IntegracaoExterna
 *     description: Endpoints públicos para integração externa
 */

// ======================
// GAMIFICATION
// ======================
/**
 * @openapi
 * /api/gamification/ranking:
 *   get:
 *     tags:
 *       - Gamificacao
 *     summary: Retorna o ranking global
 *     responses:
 *       200:
 *         description: Ranking retornado com sucesso
 */
router.get('/ranking', (req, res) => {
  res.json({
    success: true,
    ranking: []
  });
});

// ======================
// SEGURANÇA (API KEY)
// ======================
const requireApiKey = (req, res, next) => {
  const apiKey = req.header('x-api-key');
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

// Aplica Rate Limit + API Key
router.use(apiLimiter);
router.use(requireApiKey);

// ======================
// INTEGRAÇÃO EXTERNA
// ======================

/**
 * @openapi
 * /api/external/stats:
 *   get:
 *     tags:
 *       - IntegracaoExterna
 *     summary: Retorna estatísticas públicas do sistema
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
router.get('/stats', async (req, res) => {
  try {
    const totalReports = await Report.countDocuments({ isPublic: true });

    const activeCases = await Report.countDocuments({
      status: { $in: ['pendente', 'confirmado', 'investigando'] },
      isPublic: true
    });

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
      }
    });
  } catch (error) {
    console.error('Erro /stats:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
});

/**
 * @openapi
 * /api/external/reports:
 *   get:
 *     tags:
 *       - IntegracaoExterna
 *     summary: Retorna relatórios públicos com paginação
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de relatórios retornada
 */
router.get('/reports', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const reports = await Report.find({ isPublic: true })
      .select('localizacao tipoCriadouro status nivelRisco dataOcorrencia cidade bairro -_id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Report.countDocuments({ isPublic: true });

    res.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro /reports:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
});

module.exports = router;
