const User = require('../models/User');
const { gerarToken } = require('../config/jwt');

const userController = {

  // =========================
  // PERFIL DO USUÁRIO LOGADO
  // =========================
  getPerfil: async (req, res) => {
    try {
      const usuarioId = req.user?.id || req.userId;

      if (!usuarioId) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }

      const usuario = await User.findById(usuarioId).select('-senha -__v');

      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      res.json({ success: true, usuario });
    } catch {
      res.status(500).json({ success: false, message: 'Erro ao buscar perfil' });
    }
  },

  // =========================
  // VERIFICAR EMAIL
  // =========================
  verificarEmail: async (req, res) => {
    const { email } = req.params;
    const existe = await User.exists({ email });
    res.json({ success: true, exists: !!existe });
  },

  // =========================
  // ADMIN — LISTAR USUÁRIOS
  // =========================
  getAllUsers: async (req, res) => {
    const usuarios = await User.find().select('-senha -__v');
    res.json({ success: true, usuarios });
  },

  // =========================
  // ADMIN — BUSCAR POR ID
  // =========================
  getUserById: async (req, res) => {
    const usuario = await User.findById(req.params.id).select('-senha -__v');

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, usuario });
  },

  // =========================
  // ADMIN — ATUALIZAR USUÁRIO
  // =========================
  updateUser: async (req, res) => {
    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-senha -__v');

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, usuario });
  },

  // =========================
  // ADMIN — DELETAR USUÁRIO
  // =========================
  deleteUser: async (req, res) => {
    const usuario = await User.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, message: 'Usuário removido' });
  }
};

module.exports = userController;
