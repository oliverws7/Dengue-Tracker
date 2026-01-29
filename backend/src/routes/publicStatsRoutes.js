const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { apiLimiter } = require('../middleware/rateLimit');
const { validateQuery, schemas } = require('../middleware/validators');

// GET /api/public/reports - Relatórios públicos (Feed)
router.get('/', 
  apiLimiter, // Proteção contra DDoS/Scraping
  validateQuery(schemas.query.pagination), // Valida paginação
  async (req, res) => {
    try {
      const page = parseInt(req.query.pagina) || 1;
      const limit = parseInt(req.query.limite) || 10;
      const skip = (page - 1) * limit;
      
      const { tipoCriadouro, cidade, bairro } = req.query;

      // Filtro de Segurança IMUTÁVEL
      const filter = { 
        isPublic: true,
        // Só mostra confirmados ou em processo (esconde pendentes/falsos)
        status: { $in: ['confirmado', 'investigando', 'eliminado'] } 
      };
      
      // Filtros opcionais (seguros)
      if (tipoCriadouro) filter.tipoCriadouro = tipoCriadouro;
      if (cidade) filter.cidade = new RegExp(cidade, 'i');
      if (bairro) filter.bairro = new RegExp(bairro, 'i');
      
      const reports = await Report.find(filter)
        .select('titulo descricao tipoCriadouro localizacao endereco bairro cidade status nivelRisco imagens createdAt pontosGanhos') // Whitelist de campos
        .populate('usuario', 'nome nivel avatar') // Mostra quem reportou (apenas dados públicos)
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
});

// GET /api/public/stats - Estatísticas públicas
router.get('/stats', apiLimiter, async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = await Report.aggregate([
      {
        $match: {
          isPublic: true,
          status: { $in: ['confirmado', 'eliminado'] }, // Apenas dados consolidados
          createdAt: { $gte: lastWeek }
        }
      },
      {
        $group: {
          _id: '$tipoCriadouro', // Corrigido de 'tipo' para 'tipoCriadouro'
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