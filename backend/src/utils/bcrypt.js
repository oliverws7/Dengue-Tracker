const bcrypt = require('bcryptjs'); // Alterado para bcryptjs para compatibilidade
const crypto = require('crypto'); // Para geração aleatória segura

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const bcryptUtils = {
  // Hash de senha
  hashPassword: async (password) => {
    if (!password || typeof password !== 'string') {
      throw new Error('Senha inválida');
    }
    
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error('Erro ao gerar hash da senha:', error);
      throw new Error('Erro ao processar senha');
    }
  },

  // Comparar senha
  comparePassword: async (password, hashedPassword) => {
    if (!password || !hashedPassword) return false;
    
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Erro ao comparar senhas:', error);
      return false;
    }
  },

  // Validar força da senha
  validatePasswordStrength: (password) => {
    if (!password || typeof password !== 'string') {
      return {
        isValid: false,
        message: 'Senha é obrigatória',
        score: 0,
        suggestions: []
      };
    }
    
    // Verificar comprimento
    if (password.length < PASSWORD_MIN_LENGTH) {
      return {
        isValid: false,
        message: `Senha muito curta. Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`,
        score: 1,
        suggestions: [`Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres`]
      };
    }
    
    if (password.length > PASSWORD_MAX_LENGTH) {
      return {
        isValid: false,
        message: `Senha muito longa. Máximo ${PASSWORD_MAX_LENGTH} caracteres.`,
        score: 1,
        suggestions: [`Use no máximo ${PASSWORD_MAX_LENGTH} caracteres`]
      };
    }
    
    // Critérios
    const checks = {
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumbers: /\d/.test(password),
      // Regex melhorado: Aceita qualquer caractere especial, pontuação ou símbolo
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      hasMinLength: password.length >= PASSWORD_MIN_LENGTH
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const score = Math.floor((passedChecks / Object.keys(checks).length) * 100);
    
    // Regex completo para validação final
    // (?=.*[^A-Za-z0-9]) garante pelo menos um caractere especial
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    const isValid = strongPasswordRegex.test(password);
    
    // Sugestões
    const suggestions = [];
    if (!checks.hasLowercase) suggestions.push('Adicione letras minúsculas');
    if (!checks.hasUppercase) suggestions.push('Adicione letras maiúsculas');
    if (!checks.hasNumbers) suggestions.push('Adicione números');
    if (!checks.hasSpecial) suggestions.push('Adicione caracteres especiais (ex: @, #, $, !)');
    
    return {
      isValid,
      message: isValid ? 'Senha forte ✓' : 'Senha fraca. ' + suggestions.join(', '),
      score,
      suggestions: suggestions.length > 0 ? suggestions : ['Senha forte!'],
      checks
    };
  },

  // Gerar senha aleatória (Criptograficamente Segura)
  generateSecurePassword: (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    
    // Garante aleatoriedade segura usando crypto do Node.js
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    // Garante que passou na validação básica, senão tenta recursivamente
    // (Raro falhar com 12 chars, mas garante consistência)
    const validation = bcryptUtils.validatePasswordStrength(password);
    if (!validation.isValid && length >= 8) {
      return bcryptUtils.generateSecurePassword(length);
    }
    
    return password;
  },

  // Verificar se senha está em lista de senhas comuns
  isCommonPassword: async (password) => {
    const commonPasswords = [
      'password', '123456', '12345678', '123456789', '1234567890',
      'senha', 'senha123', 'admin', 'master', 'root', '123123', 
      'qwerty', 'admin123', 'brasil', 'mudar123'
    ];
    return commonPasswords.includes(password.toLowerCase());
  },

  // Verifica similaridade com dados do usuário (Nome, Email)
  isSimilarToUserData: (password, userData) => {
    if (!userData || !password) return false;
    
    const passwordLower = password.toLowerCase();
    const checks = [];

    if (userData.nome) {
      // Verifica primeiro e último nome
      const nomes = userData.nome.split(' ');
      checks.push(...nomes);
    }

    if (userData.email) {
      const emailParts = userData.email.split('@');
      checks.push(emailParts[0]); // Parte antes do @
    }

    return checks.some(info => {
      if (!info || info.length < 3) return false; // Ignora partes muito curtas
      return passwordLower.includes(info.toLowerCase());
    });
  }
};

module.exports = bcryptUtils;