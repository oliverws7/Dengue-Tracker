import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle } from  'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  // Validação de força de senha
  const passwordStrength = useMemo(() => {
    const pass = formData.senha;
    if (!pass) return { score: 0, color: 'gray', text: '' };
    
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[@$!%*?&]/.test(pass)) score++;
    
    const levels = [
      { score: 0, color: 'gray', text: '' },
      { score: 1, color: 'red', text: 'Muito fraca' },
      { score: 2, color: 'orange', text: 'Fraca' },
      { score: 3, color: 'yellow', text: 'Boa' },
      { score: 4, color: 'lime', text: 'Forte' },
      { score: 5, color: 'green', text: 'Muito forte' }
    ];
    
    return levels[score];
  }, [formData.senha]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    if (formData.senha !== formData.confirmSenha) newErrors.confirmSenha = 'Senhas não coincidem';
    if (passwordStrength.score < 3) newErrors.senha = 'Senha muito fraca. Use maiúsculas, minúsculas, números e caracteres especiais';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/auth/registrar', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      });

      const { token, data } = response.data;
      login(token, data.usuario || data);
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao criar conta. Tente outro email.';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 flex items-center justify-center px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              🦟
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-2">
            DengueTracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crie sua conta para começar a reportar focos
          </p>
        </motion.div>

        {/* Form Card */}
        <Card variant="white" className="p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            {errors.submit && (
              <motion.div
                variants={itemVariants}
                className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium"
              >
                {errors.submit}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Input
                label="Nome Completo"
                icon={User}
                placeholder="Ex: João Silva"
                value={formData.nome}
                onChange={handleChange}
                name="nome"
                error={errors.nome}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                name="email"
                error={errors.email}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label="Senha"
                    type={showSenha ? "text" : "password"}
                    icon={Lock}
                    placeholder="••••••••"
                    value={formData.senha}
                    onChange={handleChange}
                    name="senha"
                    error={errors.senha}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-[2.3rem] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {formData.senha && (
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full bg-${passwordStrength.color}-500 transition-all`} />
                    <span className={`text-xs font-medium text-${passwordStrength.color}-600 dark:text-${passwordStrength.color}-400`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mín. 8 caracteres: maiúscula, minúscula, número, caractere especial
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <Input
                  label="Confirmar Senha"
                  type={showConfirm ? "text" : "password"}
                  icon={Lock}
                  placeholder="••••••••"
                  value={formData.confirmSenha}
                  onChange={handleChange}
                  name="confirmSenha"
                  error={errors.confirmSenha}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-[2.3rem] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full !bg-gradient-to-r !from-green-600 !to-emerald-500"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                Faça login aqui
              </Link>
            </p>
          </motion.div>
        </Card>

        {/* Benefits */}
        <motion.div variants={itemVariants} className="mt-8 space-y-3">
          {['Reporte focos de dengue', 'Ganhe pontos e prêmios', 'Proteja sua comunidade'].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <CheckCircle size={16} className="text-green-600" />
              {benefit}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;