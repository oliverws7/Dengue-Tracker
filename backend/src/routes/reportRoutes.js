// src/routes/publicReportRoutes.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { apiLimiter } = require('../middleware/rateLimit');
const { validateQuery, schemas } = require('../middleware/validators');

// Rate limit para rotas públicas
router.use(apiLimiter);

/**
 * @openapi
 * /api/reports/public:
 *   get:
 *     tags: [Relatórios Públicos]
 *     summary: Feed de relatórios públicos com filtros e paginação
 */
router.get(
  '/',
  validateQuery(schemas.query.pagination),
  async (req, res) => {
    try {
      const page = parseInt(req.query.pagina) || 1;
      const limit = parseInt(req.query.limite) || 10;
      const skip = (page - 1) * limit;

      const filter = {
        status: { $in: ['confirmado', 'eliminado', 'investigando'] },
        isPublic: true
      };

      if (req.query.tipoCriadouro) {
        filter.tipoCriadouro = req.query.tipoCriadouro;
      }

      if (req.query.cidade) {
        filter.cidade = new RegExp(
          req.query.cidade.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'i'
        );
      }

      if (req.query.bairro) {
        filter.bairro = new RegExp(
          req.query.bairro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'i'
        );
      }

      const days = parseInt(req.query.dias) || 60;
      filter.createdAt = {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      };

      const reports = await Report.find(filter)
        .select(
          'titulo descricao tipoCriadouro localizacao endereco bairro cidade status nivelRisco imagens createdAt pontosGanhos'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Report.countDocuments(filter);

      res.json({
        success: true,
        data: reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro em relatórios públicos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar relatórios'
      });
    }
  }
);

/**
 * @openapi
 * /api/reports/public/stats:
 *   get:
 *     tags: [Relatórios Públicos]
 *     summary: Estatísticas agregadas de relatórios
 */
router.get('/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.dias) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [stats] = await Report.aggregate([
      {
        $match: {
          isPublic: true,
          status: { $in: ['confirmado', 'eliminado'] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          porTipo: [
            { $group: { _id: '$tipoCriadouro', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          porBairro: [
            { $match: { bairro: { $exists: true, $ne: '' } } },
            { $group: { _id: '$bairro', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ],
          geral: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                resolvidos: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'eliminado'] }, 1, 0]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        periodo: `${days} dias`,
        totalRelatorios: stats?.geral[0]?.total || 0,
        resolvidos: stats?.geral[0]?.resolvidos || 0,
        porTipo: stats?.porTipo || [],
        bairrosAfetados: stats?.porBairro || [],
        atualizacao: new Date()
      }
    });
  } catch (error) {
    console.error('Erro em stats públicos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar estatísticas'
    });
  }
});

/**
 * @openapi
 * /api/reports/public/map:
 *   get:
 *     tags: [Relatórios Públicos]
 *     summary: GeoJSON para mapas de calor
 */
router.get('/map', async (req, res) => {
  try {
    const days = parseInt(req.query.dias) || 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const reports = await Report.find({
      isPublic: true,
      status: { $in: ['confirmado', 'investigando', 'eliminado'] },
      createdAt: { $gte: startDate },
      'localizacao.coordinates': { $exists: true, $not: { $size: 0 } }
    })
      .select('localizacao tipoCriadouro status nivelRisco createdAt')
      .limit(1000)
      .lean();

    const geoJson = {
      type: 'FeatureCollection',
      features: reports.map(r => ({
        type: 'Feature',
        geometry: r.localizacao,
        properties: {
          id: r._id,
          tipo: r.tipoCriadouro,
          status: r.status,
          risco: r.nivelRisco,
          data: r.createdAt
        }
      }))
    };

    res.json({
      success: true,
      data: geoJson,
      count: reports.length
    });
  } catch (error) {
    console.error('Erro no mapa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar dados do mapa'
    });
  }
});

module.exports = router;
