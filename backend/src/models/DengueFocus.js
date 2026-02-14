const mongoose = require('mongoose');

const DengueFocusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude é obrigatória']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude é obrigatória']
  },
  // GeoJSON para buscas geográficas no MongoDB
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    minlength: [10, 'Descrição deve ter no mínimo 10 caracteres']
  },
  photoUrl: String,
  address: String,
  riskLevel: {
    type: String,
    enum: ['baixo_risco', 'medio_risco', 'alto_risco'],
    required: true
  },
  status: {
    type: String,
    enum: ['monitorando', 'resolvido'],
    default: 'monitorando'
  }
}, {
  timestamps: true
});

// Atualiza o objeto location antes de salvar
DengueFocusSchema.pre('save', function(next) {
  if (this.latitude && this.longitude) {
    this.location.coordinates = [this.longitude, this.latitude];
  }
  next();
});

module.exports = mongoose.model('DengueFocus', DengueFocusSchema);