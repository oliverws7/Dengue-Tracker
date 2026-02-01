// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar autenticação
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            navigate('/');
            return;
        }
        
        setUser(JSON.parse(userData));
        fetchStats();
    }, [navigate]);

    const fetchStats = async () => {
        try {
            // Mock de dados para desenvolvimento
            const mockStats = {
                totalReports: 1247,
                reportsLast24h: 42,
                confirmedCases: 89,
                activeUsers: 156,
                topRegions: [
                    { name: 'Centro', reports: 245, risk: 'alto' },
                    { name: 'Jardim das Flores', reports: 189, risk: 'alto' }
                ],
                weeklyTrend: [45, 52, 48, 65, 70, 42, 38]
            };
            
            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 500));
            setStats(mockStats);
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                🦟 DengueTracker Dashboard
                            </h1>
                            <p className="text-sm text-gray-600">
                                Monitoramento e combate à dengue
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="font-medium">{user?.name}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Stats */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Seu Progresso</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">Pontos</p>
                            <p className="text-3xl font-bold text-blue-600">{user?.points || 0}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Nível</p>
                            <p className="text-3xl font-bold text-green-600">{user?.level || 1}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Role</p>
                            <p className="text-3xl font-bold text-purple-600 capitalize">{user?.role || 'user'}</p>
                        </div>
                    </div>
                </div>

                {/* System Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">Total de Reportes</h3>
                            <p className="text-3xl font-bold text-gray-800">{stats.totalReports}</p>
                            <p className="text-sm text-gray-500 mt-2">+{stats.reportsLast24h} últimas 24h</p>
                        </div>
                        
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">Casos Confirmados</h3>
                            <p className="text-3xl font-bold text-red-600">{stats.confirmedCases}</p>
                            <p className="text-sm text-gray-500 mt-2">Focos ativos</p>
                        </div>
                        
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">Usuários Ativos</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
                            <p className="text-sm text-gray-500 mt-2">Colaboradores</p>
                        </div>
                        
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">Áreas de Risco</h3>
                            <p className="text-3xl font-bold text-yellow-600">
                                {stats.topRegions.filter(r => r.risk === 'alto').length}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Nível alto</p>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition">
                            <span className="text-2xl">📝</span>
                            <p className="font-medium mt-2">Novo Reporte</p>
                            <p className="text-sm text-gray-600">Reportar foco de dengue</p>
                        </button>
                        
                        <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition">
                            <span className="text-2xl">🏆</span>
                            <p className="font-medium mt-2">Ver Ranking</p>
                            <p className="text-sm text-gray-600">Competição de pontos</p>
                        </button>
                        
                        <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition">
                            <span className="text-2xl">📊</span>
                            <p className="font-medium mt-2">Estatísticas</p>
                            <p className="text-sm text-gray-600">Dados detalhados</p>
                        </button>
                    </div>
                </div>
            </main>
            
            {/* Footer */}
            <footer className="bg-white border-t mt-8 py-4">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>DengueTracker v2.1 • Sistema de monitoramento e combate à dengue</p>
                    <p className="mt-1">🚧 Em desenvolvimento • Dados de demonstração</p>
                </div>
            </footer>
        </div>
    );
}

export default Dashboard;