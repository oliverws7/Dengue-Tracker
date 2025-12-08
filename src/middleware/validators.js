const { body, param, query, validationResult } = require('express-validator');

// Validação de usuário
const validarUsuario = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('senha')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin', 'agente']).withMessage('Role inválida')
];

// Validação de login
const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido'),
  
  body('senha')
    .notEmpty().withMessage('Senha é obrigatória')
];

// Validação de reporte
const validarReporte = [
  body('tipoCriadouro')
    .notEmpty().withMessage('Tipo de criadouro é obrigatório')
    .isIn(['pneu', 'vaso', 'lixo', 'piscina', 'outro'])
    .withMessage('Tipo de criadouro inválido'),
  
  body('descricao')
    .trim()
    .notEmpty().withMessage('Descrição é obrigatória')
    .isLength({ min: 10, max: 500 }).withMessage('Descrição deve ter entre 10 e 500 caracteres'),
  
  body('localizacao.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude inválida'),
  
  body('localizacao.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude inválida'),
  
  body('status')
    .optional()
    .isIn(['pendente', 'em-andamento', 'resolvido', 'cancelado'])
    .withMessage('Status inválido')
];

// Middleware para checar resultados da validação
const checarValidacao = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        campo: err.path,
        mensagem: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validarUsuario,
  validarLogin,
  validarReporte,
  checarValidacao
};