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
 *   - name: IntegracaoExterna
 *     description: Endpoints públicos para integração via API Key
 */

// ======================
// SEGURANÇA (API KEY)
// ======================
const requireApiKey = (req, res, next) => {
  const apiKey = req.header('x-api-key');
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

// Aplica Rate Limit e API Key
router.use(apiLimiter);
router.use(requireApiKey);

// ======================
// ESTATÍSTICAS GERAIS
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
 *       401:
 *         description: API Key inválida
 */
router.get('/stats', async (req, res) => {
  try {
    const totalReports = await Report.countDocuments({ isPublic: true });
    const resolvedCases = await Report.countDocuments({
      status: 'eliminado',
      isPublic: true
    });

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

// ======================
// FEED DE RELATÓRIOS
// ======================
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
 *       401:
 *         description: API Key inválida
 */
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
      data: reports,
      pagination: {
        page,
        limit,
        total: reports.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

module.exports = router;
