const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  senha: { type: String, required: true, select: false },
  
  // Controle de Acesso (Crítico para authController)
  role: { 
    type: String, 
    enum: ['user', 'admin', 'moderator'], 
    default: 'user' 
  },
  
  // Status da Conta
  ativo: { type: Boolean, default: true },
  ultimoLogin: Date,
  
  // Perfil
  localizacao: {
    lat: Number,
    lng: Number
  },
  
  // Gamificação
  nivel: { 
    type: String, 
    enum: ['iniciante', 'cacador', 'mestre', 'lenda', 'admin'], 
    default: 'iniciante' 
  },
  pontos: { type: Number, default: 0 },
  experiencia: { type: Number, default: 0 },
  reportesRealizados: { type: Number, default: 0 },
  focosEliminados: { type: Number, default: 0 },
  conquistas: [{
    id: String,
    nome: String,
    icone: String,
    desbloqueadaEm: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Hooks
userSchema.pre('save', async function(next) {
  // Hash da senha
  if (this.isModified('senha')) {
    this.senha = await bcrypt.hash(this.senha, 10);
  }

  // Atualização automática de nível baseada em pontos
  if (this.isModified('pontos')) {
    if (this.pontos >= 1000) this.nivel = 'lenda';
    else if (this.pontos >= 500) this.nivel = 'mestre';
    else if (this.pontos >= 100) this.nivel = 'cacador';
    // iniciante é o default
  }
  next();
});

// Métodos de Instância

// Verifica a senha (USADO NO LOGIN)
userSchema.methods.compararSenha = async function(senhaCandidata) {
  return await bcrypt.compare(senhaCandidata, this.senha);
};

// Gamificação
userSchema.methods.adicionarPontos = function(qtd) {
  this.pontos += qtd;
  this.experiencia += qtd;
  return this.save();
};

// Helper para retornar dados seguros (sem senha)
userSchema.methods.toSafeJSON = function() {
  const obj = this.toObject();
  delete obj.senha;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);