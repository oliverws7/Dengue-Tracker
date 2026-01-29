const User = require('../models/User');
const { gerarToken } = require('../config/jwt');

const authController = {
    // Registrar novo usuário
    registrar: async (req, res) => {
        try {
            const { nome, email, senha, role } = req.body;
            
            // Verificar se email já existe
            const usuarioExistente = await User.findOne({ email });
            if (usuarioExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }
            
            // Criar novo usuário
            const novoUsuario = new User({
                nome,
                email,
                senha,
                role: role || 'user'
            });
            
            await novoUsuario.save();
            
            // Gerar token
            const token = gerarToken(novoUsuario._id, novoUsuario.role);
            
            res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: {
                    usuario: {
                        id: novoUsuario._id,
                        nome: novoUsuario.nome,
                        email: novoUsuario.email,
                        role: novoUsuario.role,
                        nivel: novoUsuario.nivel,
                        pontos: novoUsuario.pontos
                    },
                    token
                }
            });
            
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao registrar usuário',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },
    
    // Login de usuário
    login: async (req, res) => {
        try {
            const { email, senha } = req.body;
            
            // Buscar usuário
            const usuario = await User.findOne({ email });
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }
            
            // Verificar se conta está ativa
            if (!usuario.ativo) {
                return res.status(401).json({
                    success: false,
                    message: 'Conta desativada. Entre em contato com o administrador.'
                });
            }
            
            // Verificar senha
            const senhaValida = await usuario.compararSenha(senha);
            if (!senhaValida) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }
            
            // Atualizar último login
            usuario.ultimoLogin = new Date();
            await usuario.save();
            
            // Gerar token
            const token = gerarToken(usuario._id, usuario.role);
            
            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    usuario: {
                        id: usuario._id,
                        nome: usuario.nome,
                        email: usuario.email,
                        role: usuario.role,
                        nivel: usuario.nivel,
                        pontos: usuario.pontos
                    },
                    token
                }
            });
            
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao fazer login',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },
    
    // Perfil do usuário logado
    perfil: async (req, res) => {
        try {
            const usuario = await User.findById(req.user.id)
                .select('-senha -__v');
            
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }
            
            res.json({
                success: true,
                data: usuario
            });
            
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar perfil',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },
    
    // Atualizar perfil
    atualizarPerfil: async (req, res) => {
        try {
            const { nome, email } = req.body;
            const camposParaAtualizar = {};
            
            if (nome) camposParaAtualizar.nome = nome;
            if (email) camposParaAtualizar.email = email;
            
            const usuarioAtualizado = await User.findByIdAndUpdate(
                req.user.id,
                camposParaAtualizar,
                { new: true, runValidators: true }
            ).select('-senha -__v');
            
            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                data: usuarioAtualizado
            });
            
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar perfil',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },
    
    // Alterar senha
    alterarSenha: async (req, res) => {
        try {
            const { senhaAtual, novaSenha } = req.body;
            
            const usuario = await User.findById(req.user.id);
            
            // Verificar senha atual
            const senhaValida = await usuario.compararSenha(senhaAtual);
            if (!senhaValida) {
                return res.status(401).json({
                    success: false,
                    message: 'Senha atual incorreta'
                });
            }
            
            // Atualizar senha
            usuario.senha = novaSenha;
            await usuario.save();
            
            res.json({
                success: true,
                message: 'Senha alterada com sucesso'
            });
            
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao alterar senha',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },
    
    // Logout (cliente deve remover token)
    logout: (req, res) => {
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    }
};

// Exportar o objeto controller E os aliases de compatibilidade corretamente
module.exports = {
    ...authController,
    register: authController.registrar,
    login: authController.login,
    getProfile: authController.perfil
};