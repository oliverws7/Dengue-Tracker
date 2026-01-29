const User = require('../models/User');
const { gerarToken } = require('../config/jwt');

const userController = {
  // Cadastrar usuário
  cadastrar: async (req, res) => {
    try {
      const { nome, email, senha } = req.body;

      // Verificar se usuário já existe
      const usuarioExiste = await User.findOne({ email });
      if (usuarioExiste) {
        return res.status(400).json({
          success: false,
          message: 'Usuário já cadastrado com este email'
        });
      }

      // Criar usuário (o pre('save') no model criptografa a senha)
      const usuario = new User({
        nome,
        email,
        senha
      });

      await usuario.save();

      // Gerar token
      const token = gerarToken(usuario._id, usuario.role);

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        token,
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          pontos: usuario.pontos,
          role: usuario.role
        }
      });

    } catch (error) {
      console.error('❌ Erro ao cadastrar:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar usuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Login do usuário
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // Verificar se usuário existe
      const usuario = await User.findOne({ email });
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }

      // Verificar senha usando o método do model
      const isMatch = await usuario.compararSenha(senha);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }

      // Atualizar último login
      usuario.ultimoLogin = new Date();
      await usuario.save();

      // Gerar token
      const token = gerarToken(usuario._id, usuario.role);

      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        token,
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          pontos: usuario.pontos,
          role: usuario.role,
          nivel: usuario.nivel
        }
      });

    } catch (error) {
      console.error('❌ Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Buscar perfil do usuário
  getPerfil: async (req, res) => {
    try {
      // Usar req.user.id (JWT padrão) ou req.userId para compatibilidade
      const usuarioId = req.user ? req.user.id : req.userId;
      
      if (!usuarioId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuário não autenticado' 
        });
      }
      
      const usuario = await User.findById(usuarioId).select('-senha -__v');
      
      if (!usuario) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuário não encontrado' 
        });
      }

      res.json({
        success: true,
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          pontos: usuario.pontos,
          nivel: usuario.nivel,
          role: usuario.role,
          localizacao: usuario.localizacao,
          ultimoLogin: usuario.ultimoLogin
        }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Listar todos os usuários (apenas admin)
  getAllUsers: async (req, res) => {
    try {
      // Verificar se é admin
      if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores.'
        });
      }

      const usuarios = await User.find()
        .select('-senha -__v')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: usuarios.length,
        usuarios
      });
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Buscar usuário por ID
  getUserById: async (req, res) => {
    try {
      const usuario = await User.findById(req.params.id)
        .select('-senha -__v');
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        usuario
      });
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Atualizar usuário
  updateUser: async (req, res) => {
    try {
      const usuarioId = req.params.id;
      
      // Verificar permissões
      if (req.user.role !== 'admin' && req.user.id !== usuarioId) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Você só pode atualizar seu próprio perfil.'
        });
      }

      const camposPermitidos = ['nome', 'email', 'localizacao'];
      const camposParaAtualizar = {};
      
      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          camposParaAtualizar[campo] = req.body[campo];
        }
      }

      const usuarioAtualizado = await User.findByIdAndUpdate(
        usuarioId,
        camposParaAtualizar,
        { new: true, runValidators: true }
      ).select('-senha -__v');

      if (!usuarioAtualizado) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        usuario: usuarioAtualizado
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar usuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Deletar usuário (apenas admin)
  deleteUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem deletar usuários.'
        });
      }

      const usuario = await User.findByIdAndDelete(req.params.id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar usuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Exportar controller completo E aliases para compatibilidade
module.exports = {
  ...userController,
  cadastrar: userController.cadastrar,
  login: userController.login,
  getPerfil: userController.getPerfil,
  getAllUsers: userController.getAllUsers,
  getUserById: userController.getUserById,
  updateUser: userController.updateUser,
  deleteUser: userController.deleteUser
};