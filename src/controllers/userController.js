const User = require('../models/User');
const { gerarToken } = require('../config/jwt'); // Usa a configuração centralizada

// Cadastrar usuário
exports.cadastrar = async (req, res) => {
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

    // CORREÇÃO 1: Criar usuário SEM criptografar a senha manualmente.
    // O pre('save') no model User.js já fará a criptografia.
    const usuario = new User({
      nome,
      email,
      senha // Passa a senha em texto puro para o model tratar
    });

    await usuario.save();

    // CORREÇÃO 2: Usar o gerador de token centralizado para manter padrão
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
      error: error.message
    });
  }
};

// Login do usuário
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se usuário existe e buscar senha (que por padrão não vem na query)
    // Nota: O método select('+senha') é necessário pois geralmente a senha é ocultada
    const usuario = await User.findOne({ email });
    
    if (!usuario) {
        return res.status(401).json({
            success: false,
            message: 'Email ou senha incorretos'
        });
    }

    // CORREÇÃO 3: Usar o nome correto do método definido no Model (compararSenha)
    const isMatch = await usuario.compararSenha(senha);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

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
        role: usuario.role
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
};

// Buscar perfil do usuário
exports.getPerfil = async (req, res) => {
  try {
    // Nota: req.userId vem do middleware de auth
    const usuario = await User.findById(req.userId).select('-senha');
    
    if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        pontos: usuario.pontos,
        localizacao: usuario.localizacao
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil',
      error: error.message
    });
  }
};