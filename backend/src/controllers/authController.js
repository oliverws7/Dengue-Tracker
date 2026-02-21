const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User, PasswordReset } = require('../models');
const jwtConfig = require('../config/jwt');
const { sendVerificationEmail, sendPasswordResetCode, sendNewPasswordEmail } = require('../services/emailService');
const { Op } = require('sequelize');

const FRONTEND_URL = process.env.FRONTEND_URL;

const generateToken = (id) => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, forneça email e senha'
      });
    }
    const user = await User.findOne({
      where: { email }
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        status: 'error',
        message: 'Por favor, verifique seu email antes de fazer login'
      });
    }

    const token = generateToken(user.id);

    const userResponse = user.get({ plain: true });
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Você não está autenticado. Por favor, faça login'
      });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);

    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'O usuário associado a este token não existe mais'
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido. Por favor, faça login novamente'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Seu token expirou. Por favor, faça login novamente'
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        verificationTokenExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token de verificação inválido ou expirado'
      });
    }

    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.redirect(`${FRONTEND_URL}/?verified=true`);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, forneça um email'
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    if (user.verified) {
      return res.status(400).json({
        status: 'error',
        message: 'Este email já foi verificado'
      });
    }

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(200).json({
      status: 'success',
      message: 'Email de verificação reenviado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateRandomPassword = () => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, forneça um email'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Não existe uma conta com este email'
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        status: 'error',
        message: 'Sua conta ainda não foi verificada. Por favor, verifique seu email antes de redefinir sua senha'
      });
    }

    const resetCode = generateResetCode();

    await PasswordReset.update(
      { used: true },
      {
        where: {
          userId: user.id,
          used: false
        }
      }
    );

    await PasswordReset.create({
      userId: user.id,
      token: resetCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    await sendPasswordResetCode(user.email, user.name, resetCode);

    res.status(200).json({
      status: 'success',
      message: 'Código de recuperação de senha enviado com sucesso para seu email'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, forneça email e código de recuperação'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Não existe uma conta com este email'
      });
    }

    const passwordReset = await PasswordReset.findOne({
      where: {
        userId: user.id,
        token: resetCode,
        used: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!passwordReset) {
      return res.status(400).json({
        status: 'error',
        message: 'Código de recuperação inválido ou expirado'
      });
    }

    const newPassword = generateRandomPassword();

    user.password = newPassword;
    await user.save();

    passwordReset.used = true;
    await passwordReset.save();

    await sendNewPasswordEmail(user.email, user.name, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Senha redefinida com sucesso. Verifique seu email para a nova senha'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};