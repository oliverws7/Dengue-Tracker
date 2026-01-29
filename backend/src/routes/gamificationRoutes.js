const express = require("express");
const router = express.Router();

// Controllers e Middlewares
const gamificationController = require("../controllers/gamificationController");
const { authenticateToken } = require("../middleware/auth");
const { validateQuery, schemas } = require("../middleware/validators");

// Models (Importar no topo, nunca dentro das rotas)
const User = require("../models/User");
const Report = require("../models/Report");

// ======================
// ROTAS PÚBLICAS
// ======================

// Ranking de usuários
router.get("/ranking", 
    validateQuery(schemas.query.pagination), 
    gamificationController.getRanking
);

// Estatísticas globais
router.get("/estatisticas", 
    gamificationController.getEstatisticasGlobais
);

// Ranking por cidade/bairro (Filtros)
router.get("/ranking/local", 
    validateQuery(schemas.query.filtrosReporte),
    async (req, res) => {
        try {
            const { cidade, bairro } = req.query;
            let filtro = {};
            
            if (cidade) filtro.cidade = new RegExp(cidade, 'i'); // Case insensitive
            if (bairro) filtro.bairro = new RegExp(bairro, 'i');
            
            const ranking = await User.find(filtro)
                .select("nome pontos nivel cidade bairro avatar")
                .sort({ pontos: -1 })
                .limit(20)
                .lean(); // .lean() para performance
                
            res.json({
                success: true,
                ranking,
                filtros: { cidade, bairro }
            });
        } catch (error) {
            console.error('Erro no ranking local:', error);
            res.status(500).json({
                success: false,
                message: "Erro ao buscar ranking local"
            });
        }
    }
);

// Leaderboard com paginação
router.get("/leaderboard/:periodo", 
    validateQuery(schemas.query.pagination),
    async (req, res) => {
        try {
            const { periodo } = req.params; // 'semanal', 'mensal', 'total'
            const page = parseInt(req.query.pagina) || 1;
            const limit = parseInt(req.query.limite) || 20;
            const skip = (page - 1) * limit;
            
            // TODO: Implementar filtro real de data para 'semanal'/'mensal'
            // Por enquanto usa pontuação total
            const ranking = await User.find()
                .select("nome pontos nivel avatar")
                .sort({ pontos: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
                
            const total = await User.countDocuments();
            
            res.json({
                success: true,
                periodo,
                ranking,
                paginacao: {
                    pagina: page,
                    limite: limit,
                    total,
                    totalPaginas: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Erro no leaderboard:', error);
            res.status(500).json({
                success: false,
                message: "Erro ao buscar leaderboard"
            });
        }
    }
);

// ======================
// ROTAS PROTEGIDAS
// ======================

// Perfil Gamificado
router.get("/perfil", 
    authenticateToken,
    gamificationController.getPerfil
);

// Conquistas
router.get("/conquistas", 
    authenticateToken,
    gamificationController.verificarConquistas
);

// Resgatar Recompensa
router.post("/recompensa-diaria", 
    authenticateToken,
    gamificationController.recompensaDiaria
);

// Estatísticas Pessoais Detalhadas
router.get("/minhas-estatisticas", 
    authenticateToken,
    async (req, res) => {
        try {
            // Usa o ID do middleware (req.user.id ou req.userId)
            const userId = req.user.id || req.userId;

            const [usuario, estatisticasReportes] = await Promise.all([
                User.findById(userId).select("pontos nivel reportesRealizados focosEliminados conquistas").lean(),
                Report.getEstatisticas(userId)
            ]);
            
            if (!usuario) {
                return res.status(404).json({ success: false, message: "Usuário não encontrado" });
            }

            // Calcula posição no ranking global
            const usuariosAcima = await User.countDocuments({ pontos: { $gt: usuario.pontos } });
            
            res.json({
                success: true,
                estatisticas: {
                    usuario: {
                        pontos: usuario.pontos,
                        nivel: usuario.nivel,
                        reportesRealizados: usuario.reportesRealizados,
                        focosEliminados: usuario.focosEliminados,
                        totalConquistas: usuario.conquistas?.length || 0
                    },
                    reportes: estatisticasReportes,
                    posicaoRanking: usuariosAcima + 1
                }
            });
        } catch (error) {
            console.error("Erro ao buscar estatísticas pessoais:", error);
            res.status(500).json({
                success: false,
                message: "Erro ao buscar estatísticas pessoais"
            });
        }
    }
);

// ======================
// UTILITÁRIOS
// ======================

router.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "Gamification API",
        status: "operational",
        timestamp: new Date().toISOString()
    });
});

module.exports = router;