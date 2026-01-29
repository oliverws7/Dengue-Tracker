const Joi = require('joi');
const { isValidObjectId } = require('mongoose');

// Função auxiliar para validar ObjectId do Mongoose
const objectIdValidator = (value, helpers) => {
  if (!isValidObjectId(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Validação de força de senha
let validatePasswordStrength;
try {
  const bcryptUtils = require('../utils/bcrypt');
  validatePasswordStrength = bcryptUtils.validatePasswordStrength;
} catch (error) {
  validatePasswordStrength = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return {
      isValid: strongPasswordRegex.test(password),
      message: strongPasswordRegex.test(password) 
        ? 'Senha válida'
        : 'A senha deve conter: minúscula, maiúscula, número e caractere especial'
    };
  };
}

// Middleware de validação genérico
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos os erros, não só o primeiro
      stripUnknown: true, // Remove campos que não estão no schema (segurança)
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));
      
      return res.status(400).json({ 
        success: false,
        error: 'Erro de validação', 
        details: errors,
        code: 'VALIDATION_ERROR'
      });
    }

    req.body = value;
    next();
  };
};

// Schemas de validação
exports.schemas = {
  // --- AUTENTICAÇÃO ---
  auth: {
    registrar: Joi.object({
      nome: Joi.string().min(3).max(100).required()
        .messages({
          'string.min': 'Nome deve ter pelo menos 3 caracteres',
          'any.required': 'Nome é obrigatório'
        }),
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Email inválido',
          'any.required': 'Email é obrigatório'
        }),
      senha: Joi.string().min(8).required()
        .custom((value, helpers) => {
          const validation = validatePasswordStrength(value);
          if (!validation.isValid) return helpers.message(validation.message);
          return value;
        }),
      role: Joi.string().valid('user', 'admin', 'moderator').default('user')
    }),

    // Login
    login: Joi.object({
      email: Joi.string().email().required(),
      senha: Joi.string().required()
    })
  },

  // --- RELATÓRIOS ---
  report: {
    criarReporte: Joi.object({
      localizacao: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).required(),
      
      endereco: Joi.string().max(255).required(),
      
      tipoCriadouro: Joi.string()
        .valid('agua-parada', 'pneu', 'vaso-planta', 'lixo', 'outro')
        .required(),
      
      descricao: Joi.string().max(500).allow('').optional(),
      
      foto: Joi.string().uri().optional(),
      
      status: Joi.string()
        .valid('pendente', 'confirmado', 'investigando', 'eliminado')
        .default('pendente')
    }),

    // Compatibilidade: Schema em Inglês (mas mapeando para chaves em PT para o Controller funcionar)
    create: Joi.object({
      localizacao: Joi.object({ // Mantido em PT para compatibilidade com Model
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      endereco: Joi.string().required(), // Mantido em PT
      tipoCriadouro: Joi.string().valid('agua-parada', 'pneu', 'vaso-planta', 'lixo', 'outro').required(),
      descricao: Joi.string().optional(),
      foto: Joi.string().uri().optional()
    }),

    atualizarStatus: Joi.object({
      reporteId: Joi.string().custom(objectIdValidator, 'ObjectId Validation').required()
        .messages({ 'any.invalid': 'ID do reporte inválido' }),
      status: Joi.string()
        .valid('pendente', 'confirmado', 'investigando', 'eliminado')
        .required()
    })
  },

  // --- USUÁRIOS ---
  user: {
    atualizarPerfil: Joi.object({
      nome: Joi.string().min(3).max(100).optional(),
      email: Joi.string().email().optional(),
      localizacao: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      }).optional()
    }),

    alterarSenha: Joi.object({
      senhaAtual: Joi.string().required(),
      novaSenha: Joi.string().min(8).required()
        .custom((value, helpers) => {
          const validation = validatePasswordStrength(value);
          if (!validation.isValid) return helpers.message(validation.message);
          return value;
        })
    })
  },

  // --- QUERY E FILTROS ---
  query: {
    pagination: Joi.object({
      pagina: Joi.number().min(1).default(1),
      limite: Joi.number().min(1).max(100).default(10),
      ordenarPor: Joi.string().optional(),
      ordem: Joi.string().valid('asc', 'desc').default('desc')
    }),

    filtrosReporte: Joi.object({
      status: Joi.string().valid('pendente', 'confirmado', 'investigando', 'eliminado').optional(),
      tipoCriadouro: Joi.string().valid('agua-parada', 'pneu', 'vaso-planta', 'lixo', 'outro').optional(),
      dataInicio: Joi.date().iso().optional(),
      dataFim: Joi.date().iso().optional(),
      cidade: Joi.string().optional(),
      bairro: Joi.string().optional()
    })
  }
};

// Middlewares Auxiliares
exports.validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Parâmetros inválidos',
      details: error.details.map(d => ({ field: d.path.join('.'), message: d.message.replace(/"/g, '') }))
    });
  }
  req.query = value;
  next();
};

exports.validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'URL inválida',
      details: error.details.map(d => ({ field: d.path.join('.'), message: d.message.replace(/"/g, '') }))
    });
  }
  req.params = value;
  next();
};

// Schema reutilizável para IDs
exports.idSchema = Joi.string().custom(objectIdValidator, 'ObjectId Validation');