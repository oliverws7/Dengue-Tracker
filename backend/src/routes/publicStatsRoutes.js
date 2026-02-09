const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { apiLimiter } = require('../middleware/rateLimit');
const { validateQuery, schemas } = require('../middleware/validators');

// ======================
// DOCUMENTAÇÃO SWAGGER (TAGS)
// ======================
/**
 * @openapi
 * tags:
 *   - name: Publico
 *     description: Endpoints públicos de acesso a dados consolidados
 */

// ======================
// RELATÓRIOS PÚBLICOS (FEED)
// ======================
/**
 * @openapi
 * /api/public/reports:
 *   get:
 *     tags:
 *       - Publico
 *     summary: Retorna relatórios públicos com filtros e paginação
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: tipoCriadouro
 *         schema:
 *           type: string
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *       - in: query
 *         name: bairro
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de relatórios retornada com sucesso
 */
router.get(
  '/',
  apiLimiter,
  validateQuery(schemas.query.pagination),
  async (req, res) => {
    try {
      const page = parseInt(req.query.pagina) || 1;
      const limit = parseInt(req.query.limite) || 10;
      const skip = (page - 1) * limit;

      const { tipoCriadouro, cidade, bairro } = req.query;

      const filter = {
        isPublic: true,
        status: { $in: ['confirmado', 'investigando', 'eliminado'] }
      };

      if (tipoCriadouro) filter.tipoCriadouro = tipoCriadouro;
      if (cidade) filter.cidade = new RegExp(cidade, 'i');
      if (bairro) filter.bairro = new RegExp(bairro, 'i');

      const reports = await Report.find(filter)
        .select(
          'titulo descricao tipoCriadouro localizacao endereco bairro cidade status nivelRisco imagens createdAt pontosGanhos'
        )
        .populate('usuario', 'nome nivel avatar')
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

// ======================
// ESTATÍSTICAS PÚBLICAS
// ======================
/**
 * @openapi
 * /api/public/stats:
 *   get:
 *     tags:
 *       - Publico
 *     summary: Retorna estatísticas públicas dos últimos 7 dias
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
router.get('/stats', apiLimiter, async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = await Report.aggregate([
      {
        $match: {
          isPublic: true,
          status: { $in: ['confirmado', 'eliminado'] },
          createdAt: { $gte: lastWeek }
        }
      },
      {
        $group: {
          _id: '$tipoCriadouro',
          count: { $sum: 1 },
          resolvidos: {
            $sum: { $cond: [{ $eq: ['$status', 'eliminado'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: stats,
      periodo: 'Últimos 7 dias',
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Erro em estatísticas públicas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar estatísticas'
    });
  }
});

module.exports = router;
