import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

function NewReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    description: '',
    latitude: null,
    longitude: null,
    address: '',
    riskLevel: 'medium',
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);

  // Get user's location
  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
          getAddressFromCoords(latitude, longitude);
          toast.success('Localização obtida com sucesso!');
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          toast.error('Não foi possível acessar sua localização');
          setLoading(false);
        }
      );
    } else {
      toast.error('Geolocalização não disponível no seu navegador');
      setLoading(false);
    }
  };

  // Get address from coordinates (mock - use a real geocoding service)
  const getAddressFromCoords = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      address: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreview.length > 3) {
      toast.error('Máximo 3 imagens permitidas');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.latitude || !formData.longitude) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('descricao', formData.description);
      submitFormData.append('latitude', formData.latitude);
      submitFormData.append('longitude', formData.longitude);
      submitFormData.append('endereco', formData.address);
      submitFormData.append('nivelRisco', formData.riskLevel);

      formData.images.forEach((file) => {
        submitFormData.append('imagens', file);
      });

      const response = await api.post('/reports', submitFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Relatório enviado com sucesso! Obrigado por sua contribuição.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      toast.error('Erro ao enviar relatório. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <MapPin size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                  Novo Relatório
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Ajude-nos a combater o Dengue reportando focos
                </p>
              </div>
            </div>
          </motion.div>

          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Location Card */}
            <motion.div variants={itemVariants}>
              <Card>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-purple-500" />
                    Localização
                  </h2>

                  {formData.latitude ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg mb-4"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                            Localização capturada
                          </p>
                          <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1">
                            {formData.address}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-200">
                            Localização necessária
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                            Clique no botão abaixo para permitir acesso à sua localização
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button
                    onClick={getLocation}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Obtendo localização...
                      </>
                    ) : (
                      <>
                        <MapPin size={18} />
                        {formData.latitude ? 'Atualizar Localização' : 'Obter Minha Localização'}
                      </>
                    )}
                  </Button>
                </div>

                <Input
                  label="Endereço (opcional)"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Ex: Rua das Flores, 123, São Paulo"
                  icon={MapPin}
                />
              </Card>
            </motion.div>

            {/* Description Card */}
            <motion.div variants={itemVariants}>
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Descrição do Foco
                </h2>

                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descreva em detalhes o local onde encontrou o foco de dengue. Inclua informações sobre o tipo de criadouro (poça d'água, pneu, etc)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="5"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Mínimo 20 caracteres. Máximo 500 caracteres.
                </p>
              </Card>
            </motion.div>

            {/* Risk Level Card */}
            <motion.div variants={itemVariants}>
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Nível de Risco
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'low', label: 'Baixo', color: 'from-blue-400 to-blue-600', icon: '🟢' },
                    {
                      value: 'medium',
                      label: 'Médio',
                      color: 'from-yellow-400 to-orange-600',
                      icon: '🟡',
                    },
                    { value: 'high', label: 'Alto', color: 'from-red-400 to-red-600', icon: '🔴' },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, riskLevel: option.value }))
                      }
                      className={`p-4 rounded-lg font-bold transition-all ${
                        formData.riskLevel === option.value
                          ? `bg-gradient-to-br ${option.color} text-white shadow-lg`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Images Card */}
            <motion.div variants={itemVariants}>
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Upload size={20} className="text-purple-500" />
                  Fotos do Foco
                </h2>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-8 text-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <Upload size={32} className="mx-auto text-purple-500 mb-3" />
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    Clique para selecionar imagens
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ou arraste e solte aqui (máximo 3 imagens)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {imagePreview.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-3 mt-4"
                  >
                    {imagePreview.map((preview, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </Card>
            </motion.div>

            {/* Submit Buttons */}
            <motion.div variants={itemVariants} className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Enviar Relatório
                  </>
                )}
              </Button>
            </motion.div>

            {/* Info Card */}
            <motion.div variants={itemVariants}>
              <Card variant="ghost" className="border border-purple-200 dark:border-purple-800">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      💡 Dica importante
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quanto mais detalhes você fornecer, maior será a precisão do rastreamento e
                      mais rápido nossas equipes poderão intervir. Inclua fotos claras do foco
                      encontrado.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.form>
        </div>
      </main>
    </>
  );
}

export default NewReport;