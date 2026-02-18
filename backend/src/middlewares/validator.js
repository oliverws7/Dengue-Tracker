const { body, validationResult } = require('express-validator');

/**
 * Funções Auxiliares de Validação
 */
const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  
  return true;
};

const validateBrazilianCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  const brazilBounds = {
    north: 5.27,
    south: -33.75,
    east: -28.65,
    west: -73.99
  };
  
  return (
    latitude >= brazilBounds.south &&
    latitude <= brazilBounds.north &&
    longitude >= brazilBounds.west &&
    longitude <= brazilBounds.east
  );
};

const validateS3Url = (url) => {
  if (!url) return true;
  const s3UrlPattern = /^https?:\/\/.*\.s3.*\.amazonaws\.com\/.*$/i;
  return s3UrlPattern.test(url);
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Dados de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Middlewares de Validação
 */
const validateUserCreation = [
  body('name')
    .notEmpty().withMessage('Nome é obrigatório')
    .trim(),
  
  body('email')
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('cpf')
    .notEmpty().withMessage('CPF é obrigatório')
    .matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('Formato de CPF inválido (use 11 dígitos ou formato 000.000.000-00)'),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Senha é obrigatória'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  handleValidationErrors
];

const validatePasswordUpdate = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .notEmpty().withMessage('Nova senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Nova senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número'),
  handleValidationErrors
];

const validateResendVerification = [
  body('email').notEmpty().withMessage('Email é obrigatório').isEmail().withMessage('Forneça um email válido'),
  handleValidationErrors
];

const validateForgotPassword = [
  body('email').isEmail().withMessage('Por favor, forneça um email válido'),
  handleValidationErrors
];

const validateResetPassword = [
  body('email').isEmail().withMessage('Por favor, forneça um email válido'),
  body('resetCode')
    .notEmpty().withMessage('Código de recuperação é obrigatório')
    .isLength({ min: 6, max: 6 }).withMessage('O código de recuperação deve ter exatamente 6 dígitos'),
  handleValidationErrors
];

const validateDengueFocusCreation = [
  body('latitude')
    .notEmpty().withMessage('Latitude é obrigatória')
    .isDecimal().withMessage('Latitude deve ser um número decimal')
    .custom((value, { req }) => {
      if (!validateCoordinates(value, req.body.longitude)) throw new Error('Coordenadas geográficas inválidas');
      if (req.body.longitude && !validateBrazilianCoordinates(value, req.body.longitude)) throw new Error('Localização fora do Brasil');
      return true;
    }),

  body('longitude')
    .notEmpty().withMessage('Longitude é obrigatória')
    .isDecimal().withMessage('Longitude deve ser um número decimal')
    .custom((value, { req }) => {
      if (!validateCoordinates(req.body.latitude, value)) throw new Error('Coordenadas geográficas inválidas');
      if (req.body.latitude && !validateBrazilianCoordinates(req.body.latitude, value)) throw new Error('Localização fora do Brasil');
      return true;
    }),

  body('description')
    .notEmpty().withMessage('Descrição é obrigatória')
    .isLength({ min: 10, max: 1000 }).withMessage('Descrição deve ter entre 10 e 1000 caracteres')
    .trim(),

  body('riskLevel')
    .notEmpty().withMessage('Nível de risco é obrigatório')
    .isIn(['baixo_risco', 'medio_risco', 'alto_risco']),

  handleValidationErrors
];

const validateDengueFocusUpdate = [
  body('latitude').optional().isDecimal(),
  body('longitude').optional().isDecimal(),
  body('description').optional().isLength({ min: 10, max: 1000 }),
  body('riskLevel').optional().isIn(['baixo_risco', 'medio_risco', 'alto_risco']),
  body('userId').not().exists().withMessage('Não é possível alterar o proprietário do foco'),
  handleValidationErrors
];

const validateRiskLevelUpdate = [
  body('riskLevel').notEmpty().isIn(['baixo_risco', 'medio_risco', 'alto_risco']),
  handleValidationErrors
];

const validateNearbySearch = [
  body('latitude').notEmpty().isDecimal(),
  body('longitude').notEmpty().isDecimal(),
  body('radius').optional().isFloat({ min: 0.1, max: 100 }),
  handleValidationErrors
];

module.exports = {
  validateUserCreation,
  validateLogin,
  validateUserUpdate,
  validatePasswordUpdate,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  validateDengueFocusCreation,
  validateDengueFocusUpdate,
  validateRiskLevelUpdate,
  validateNearbySearch
};