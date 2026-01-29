const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório'],
    index: true
  },
  localizacao: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordenadas são obrigatórias'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Coordenadas inválidas. Use [longitude, latitude]'
      }
    }
  },
  endereco: {
    type: String,
    required: [true, 'Endereço é obrigatório'],
    trim: true,
    maxlength: [255, 'Endereço muito longo (máx. 255 caracteres)']
  },
  bairro: { 
    type: String, 
    trim: true, 
    maxlength: 100,
    index: true 
  },
  cidade: { 
    type: String, 
    trim: true, 
    maxlength: 100,
    index: true 
  },
  descricao: { 
    type: String, 
    trim: true, 
    maxlength: 500 
  },
  tipoCriadouro: {
    type: String,
    required: [true, 'Tipo de criadouro é obrigatório'],
    enum: {
      values: ['agua-parada', 'pneu', 'vaso-planta', 'lixo', 'garrafa', 'piscina', 'caixa-dagua', 'calha', 'outro'],
      message: 'Tipo de criadouro inválido: {VALUE}'
    },
    index: true
  },
  sintomas: [{
    type: String,
    enum: ['febre', 'dor-cabeca', 'dor-muscular', 'dor-articular', 'manchas-pele', 'vomito', 'diarreia']
  }],
  
  // ======================
  // SISTEMA DE IMAGENS
  // ======================
  imagens: [{
    url: {
      type: String,
      required: [true, 'URL da imagem é obrigatória'],
      // Regex ajustado para aceitar uploads locais OU urls externas (S3/Cloudinary)
      match: [/^(\/|https?:\/\/).+\.(jpg|jpeg|png|gif|webp)$/i, 'URL de imagem inválida']
    },
    filename: {
      type: String,
      required: [true, 'Nome do arquivo é obrigatório']
    },
    originalName: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // Campo virtual para compatibilidade
  foto: { 
    type: String,
    get: function(v) {
      return this.imagens && this.imagens.length > 0 ? this.imagens[0].url : v;
    }
  },
  
  status: {
    type: String,
    enum: ['pendente', 'confirmado', 'investigando', 'eliminado'],
    default: 'pendente',
    index: true
  },
  nivelRisco: {
    type: String,
    enum: ['baixo', 'medio', 'alto'],
    default: 'medio',
    index: true
  },
  pontosGanhos: { 
    type: Number, 
    default: 0,
    min: 0
  },
  observacoesAgente: { 
    type: String, 
    trim: true, 
    maxlength: 1000 
  },
  dataVerificacao: Date,
  agenteResponsavel: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  titulo: {
    type: String,
    trim: true,
    maxlength: 200,
    default: function() {
      return `Relatório de ${this.tipoCriadouro} em ${this.bairro || this.cidade || 'Local Desconhecido'}`;
    }
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  tags: [String],
  categoria: {
    type: String,
    enum: ['residencial', 'comercial', 'publico', 'terreno-baldio', 'outro'],
    default: 'residencial'
  },
  dataOcorrencia: {
    type: Date,
    default: Date.now
  },
  dataResolucao: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ======================
// ÍNDICES
// ======================
reportSchema.index({ "localizacao": "2dsphere" });
reportSchema.index({ usuario: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ cidade: 1, bairro: 1 });
reportSchema.index({ 
  cidade: 1, 
  bairro: 1, 
  tipoCriadouro: 1,
  status: 1 
});

// ======================
// VIRTUAIS
// ======================
reportSchema.virtual('enderecoCompleto').get(function() {
  const parts = [this.endereco];
  if (this.bairro) parts.push(this.bairro);
  if (this.cidade) parts.push(this.cidade);
  return parts.join(', ');
});

reportSchema.virtual('temImagens').get(function() {
  return this.imagens && this.imagens.length > 0;
});

// ======================
// MÉTODOS DE INSTÂNCIA
// ======================
reportSchema.methods.calcularPontos = function() {
  let pontos = 10;
  
  const bonusTipo = {
    'agua-parada': 5, 'pneu': 8, 'vaso-planta': 3, 'lixo': 6,
    'garrafa': 4, 'piscina': 10, 'caixa-dagua': 12, 'calha': 7, 'outro': 2
  };
  
  pontos += bonusTipo[this.tipoCriadouro] || 0;
  
  if (this.temImagens) pontos += this.imagens.length * 2;
  if (this.descricao && this.descricao.length > 50) pontos += 5;
  
  this.pontosGanhos = pontos;
  return pontos;
};

// ======================
// MÉTODOS ESTÁTICOS
// ======================
reportSchema.statics.getEstatisticas = async function(usuarioId = null, filtros = {}) {
  // Converte string ID para ObjectId se necessário
  const match = usuarioId 
    ? { usuario: new mongoose.Types.ObjectId(usuarioId), ...filtros } 
    : filtros;
  
  const stats = await this.aggregate([
    { $match: match },
    { $group: {
        _id: null,
        total: { $sum: 1 },
        pendentes: { $sum: { $cond: [{ $eq: ['$status', 'pendente'] }, 1, 0] } },
        confirmados: { $sum: { $cond: [{ $eq: ['$status', 'confirmado'] }, 1, 0] } },
        eliminados: { $sum: { $cond: [{ $eq: ['$status', 'eliminado'] }, 1, 0] } },
        pontosTotais: { $sum: '$pontosGanhos' },
        comImagens: { $sum: { $cond: [{ $gt: [{ $size: '$imagens' }, 0] }, 1, 0] } }
    }},
    { $project: {
        _id: 0,
        total: 1,
        pendentes: 1,
        confirmados: 1,
        eliminados: 1,
        pontosTotais: 1,
        comImagens: 1,
        percentualResolvido: { 
          $cond: [
            { $eq: ['$total', 0] }, 
            0, 
            { $multiply: [{ $divide: ['$eliminado', '$total'] }, 100] } 
          ]
        }
    }}
  ]);
  
  return stats[0] || { total: 0, pendentes: 0, confirmados: 0, eliminados: 0, pontosTotais: 0 };
};

reportSchema.statics.getRelatoriosPorLocalizacao = async function(latitude, longitude, raioKm = 5, limite = 50) {
  return await this.find({
    localizacao: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        $maxDistance: raioKm * 1000
      }
    },
    isPublic: true // Aqui sim filtramos apenas os públicos
  })
  .select('localizacao endereco tipoCriadouro status imagens createdAt')
  .limit(limite)
  .lean();
};

// ======================
// MIDDLEWARES
// ======================
reportSchema.pre('save', function(next) {
  if (this.isNew) {
    this.calcularPontos();
  }
  
  // Gera tags se não existirem
  if (!this.tags || this.tags.length === 0) {
    this.tags = [this.tipoCriadouro];
    if (this.cidade) this.tags.push(this.cidade);
    if (this.nivelRisco === 'alto') this.tags.push('urgente');
  }
  
  next();
});

module.exports = mongoose.model('Report', reportSchema);