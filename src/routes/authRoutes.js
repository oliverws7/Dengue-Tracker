const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticar, autorizar } = require('../config/jwt');
const { validarUsuario, validarLogin, checarValidacao } = require('../middleware/validators');
const { loginLimiter } = require('../middleware/rateLimit');

// Rotas públicas
router.post('/registrar', 
    validarUsuario, 
    checarValidacao, 
    authController.registrar
);

router.post('/login', 
    loginLimiter,
    validarLogin, 
    checarValidacao, 
    authController.login
);

// Rotas protegidas
router.get('/perfil', 
    autenticar, 
    authController.perfil
);

router.put('/perfil', 
    autenticar, 
    authController.atualizarPerfil
);

router.put('/alterar-senha', 
    autenticar, 
    authController.alterarSenha
);

router.post('/logout', 
    autenticar, 
    authController.logout
);

// Rota admin para listar todos usuários (exemplo)
router.get('/usuarios', 
    autenticar, 
    autorizar('admin'), 
    async (req, res) => {
        // Implementar listagem de usuários
    }
);

module.exports = router;