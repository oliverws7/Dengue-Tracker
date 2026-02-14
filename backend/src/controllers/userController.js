const { User } = require('../models');
const { sendVerificationEmail } = require('../services/emailService');

exports.createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ 
      where: { email: req.body.email.trim().toLowerCase() } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Este email já está sendo utilizado'
      });
    }

    const existingCPF = await User.scope('withCPF').findOne({ 
      where: { cpf: req.body.cpf.replace(/[^\d]/g, '') } 
    });
    
    if (existingCPF) {
      return res.status(400).json({
        status: 'error',
        message: 'Este CPF já está cadastrado'
      });
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      cpf: req.body.cpf,
      verified: false
    });

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Usuário criado com sucesso. Verifique seu email para ativar sua conta.',
      data: userResponse
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: validationErrors[0] || 'Dados inválidos'
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      let message = 'Dados já existem no sistema';
      
      if (field === 'email') {
        message = 'Este email já está sendo utilizado';
      } else if (field === 'cpf') {
        message = 'Este CPF já está cadastrado';
      }
      
      return res.status(400).json({
        status: 'error',
        message: message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires'] }
    });
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires'] }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você só pode atualizar seu próprio perfil'
      });
    }

    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) {
      const existingUser = await User.findOne({ 
        where: { 
          email: email.trim().toLowerCase(),
          id: { [Op.ne]: req.user.id }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Este email já está sendo utilizado'
        });
      }
      
      updateData.email = email;
    }

    const [updatedRows] = await User.update(updateData, {
      where: { id: req.params.id },
      returning: true
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires'] }
    });

    res.status(200).json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: validationErrors[0] || 'Dados inválidos'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você só pode atualizar sua própria senha'
      });
    }

    const user = await User.scope('withPassword').findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, forneça a senha atual e a nova senha'
      });
    }

    const isPasswordValid = await user.matchPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Senha atual incorreta'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Senha atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você só pode excluir seu próprio perfil'
      });
    }
    
    const result = await User.deleteUserAndData(req.params.id);
    
    if (!result.success) {
      return res.status(404).json({
        status: 'error',
        message: result.message
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};