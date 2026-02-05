import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, MapPin, Users, AlertCircle, Plus, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/gamification/stats');
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Carregando seu painel..." />
        </div>
      </>
    );
  }

  // Animation variants
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

  const statCards = [
    {
      title: 'Relatórios',
      value: stats?.relatorios || 0,
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500',
      lightColor: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-100/50',
    },
    {
      title: 'Pontos Ganhos',
      value: stats?.pontos || 0,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      lightColor: 'from-emerald-50 to-teal-50',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-100/50',
    },
    {
      title: 'Foco Encontrados',
      value: stats?.focos || 0,
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      lightColor: 'from-orange-50 to-red-50',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-100/50',
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                  Bem-vindo, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Aqui está um resumo de sua atividade na plataforma
                </p>
              </div>
              <Button
                onClick={() => navigate('/novo-relatorio')}
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                Novo Relatório
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card variant="white" className="hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon size={24} className={stat.textColor} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${stat.color}`}>
                        +{Math.floor(Math.random() * 20)}%
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                    <p className={`text-3xl font-black mt-2 ${stat.textColor}`}>{stat.value}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <Card variant="gradient" className="from-purple-500/10 via-pink-500/10 to-red-500/10 border border-purple-200/30 dark:border-purple-500/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    🎯 Você está em destaque!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Continue reportando focos de dengue para ganhar mais pontos e badges exclusivas
                  </p>
                </div>
                <Button onClick={() => navigate('/novo-relatorio')} className="whitespace-nowrap">
                  Reportar Agora
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sua Atividade Recente</h2>
            <Card>
              <div className="space-y-4">
                {[
                  { date: 'Hoje', action: 'Enviou um relatório', location: 'Centro, São Paulo' },
                  { date: 'Ontem', action: 'Ganhou 50 pontos', location: 'Alcantâra, São Luís' },
                  { date: '2 dias atrás', action: 'Desbloqueou badge: Investigador', location: '' },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 pb-4 border-b dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{activity.action}</p>
                      {activity.location && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin size={14} /> {activity.location}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{activity.date}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Suas Conquistas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '🏅', title: 'Iniciante', subtitle: 'Seu primeiro relatório' },
                { icon: '📍', title: 'Explorador', subtitle: '10 relatórios enviados' },
                { icon: '🔍', title: 'Investigador', subtitle: '5 focos encontrados' },
                { icon: '⭐', title: 'Herói da Comunidade', subtitle: '100 pontos ganhos' },
              ].map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="text-center cursor-pointer">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="font-bold text-gray-900 dark:text-white">{achievement.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{achievement.subtitle}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export default Dashboard;