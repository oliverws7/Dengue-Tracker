const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importação no topo (Performance)

// Controllers
const userController = require('../controllers/userController');
const authController = require('../controllers/authController'); // Necessário para senha/login

// Middlewares
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validate, schemas, validateQuery, validateParams } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimit');

// ======================
// 1. ROTAS PÚBLICAS
// ======================

// Cadastro (Redireciona para userController.cadastrar ou authController.registrar dependendo da sua estrutura)
router.post('/cadastrar',
    authLimiter,
    validate(schemas.auth.registrar),
    userController.cadastrar
);

// Alias em Inglês
router.post('/register', authLimiter, validate(schemas.auth.register), userController.cadastrar);

// Login (Geralmente fica no authController)
router.post('/login',
    authLimiter,
    validate(schemas.auth.login),
    authController.login
);

// Alias em Inglês
router.post('/login-en', authLimiter, validate(schemas.auth.loginEn), authController.login);

// Verificação de disponibilidade de email
router.get('/verificar-email/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();
        // Otimização: countDocuments é mais rápido que findOne para checagem simples
        const count = await User.countDocuments({ email });
        
        res.json({
            success: true,
            disponivel: count === 0,
            mensagem: count > 0 ? 'Email já em uso' : 'Email disponível'
        });
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// ======================
// 2. ROTAS PROTEGIDAS (Perfil e Configurações)
// ======================

// Perfil do usuário logado
router.get('/perfil', authenticateToken, userController.getPerfil);
router.get('/profile', authenticateToken, userController.getPerfil); // Alias

// Atualizar perfil
router.put('/perfil',
    authenticateToken,
    validate(schemas.user.atualizarPerfil),
    userController.updateUser // Assume que o controller sabe lidar com req.user.id se não vier params
);

// Alterar senha (Delego para authController que já tem a lógica de hash)
router.put('/alterar-senha',
    authenticateToken,
    validate(schemas.user.alterarSenha),
    authController.alterarSenha
);

// Upload de Avatar (Simplificado - idealmente usaria middleware de upload)
router.post('/avatar', authenticateToken, async (req, res) => {
    try {
        const { avatarUrl } = req.body;
        if (!avatarUrl) return res.status(400).json({ success: false, message: 'URL obrigatória' });

        const usuario = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarUrl },
            { new: true }
        ).select('nome avatar');

        res.json({ success: true, message: 'Avatar atualizado', usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar avatar' });
    }
});

// ======================
// 3. ROTAS ADMIN (Gerenciamento)
// ======================

// Middleware para Admin em todas as rotas abaixo
router.use(authenticateToken, authorizeRoles('admin'));

// Listar usuários (com paginação)
router.get('/',
    validateQuery(schemas.query.pagination),
    userController.getAllUsers
);

// Estatísticas de Usuários (Dashboard)
router.get('/estatisticas', async (req, res) => {
    try {
        const [porNivel, porRole, crescimento, total, ativos] = await Promise.all([
            User.aggregate([{ $group: { _id: '$nivel', total: { $sum: 1 } } }]),
            User.aggregate([{ $group: { _id: '$role', total: { $sum: 1 } } }]),
            User.aggregate([
                { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, total: { $sum: 1 } } },
                { $sort: { _id: -1 } },
                { $limit: 6 }
            ]),
            User.countDocuments(),
            User.countDocuments({ ativo: true })
        ]);

        res.json({
            success: true,
            estatisticas: {
                total,
                ativos,
                inativos: total - ativos,
                porNivel,
                porRole,
                crescimento
            }
        });
    } catch (error) {
        console.error('Erro Stats:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar estatísticas' });
    }
});

// Operações em usuários específicos por ID
router.route('/:id')
    .get(validateParams({ id: schemas.idSchema }), userController.getUserById)
    .put(validateParams({ id: schemas.idSchema }), validate(schemas.user.atualizarPerfil), userController.updateUser)
    .delete(validateParams({ id: schemas.idSchema }), userController.deleteUser);

// Ativar/Desativar usuário
router.put('/:id/status',
    validateParams({ id: schemas.idSchema }),
    async (req, res) => {
        try {
            const { ativo } = req.body;
            if (typeof ativo !== 'boolean') {
                return res.status(400).json({ success: false, message: 'Campo "ativo" booleano obrigatório' });
            }

            const usuario = await User.findByIdAndUpdate(
                req.params.id,
                { ativo },
                { new: true }
            ).select('nome email ativo');

            if (!usuario) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

            res.json({
                success: true,
                message: `Usuário ${ativo ? 'ativado' : 'desativado'}`,
                usuario
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Erro ao alterar status' });
        }
    }
);

// ======================
// 4. HEALTH CHECK
// ======================
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'operational',
        service: 'Users API',
        timestamp: new Date()
    });
});

module.exports = router;