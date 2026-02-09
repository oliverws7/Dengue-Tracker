import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import useWebSocket from '../../hooks/useWebSocket';
import ConnectionStatus from '../../components/WebSocket/ConnectionStatus';
import RealTimeAlert from '../../components/Notifications/RealTimeAlert';
import NotificationBell from '../../components/Notifications/NotificationBell';
import DengueLineChart from '../../components/Charts/LineChart';
import DengueBarChart from '../../components/Charts/BarChart';
import InteractiveDengueMap from '../../components/Map/InteractiveMap';
import StatsCard from '../../components/StatsCard/StatsCard';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { casesAPI } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const location = useLocation();

  const [chartData, setChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [outbreaks, setOutbreaks] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [stats, setStats] = useState([]);

  const formatStats = (rawData) => [
    { title: 'Total de Casos', value: rawData.total?.toLocaleString() || '0', color: '#FF6B6B', icon: '📊', type: 'total' },
    { title: 'Confirmados', value: rawData.confirmed?.toLocaleString() || '0', color: '#4ECDC4', icon: '✅', type: 'confirmed' },
    { title: 'Suspeitos', value: rawData.suspected?.toLocaleString() || '0', color: '#FFD166', icon: '⚠️', type: 'suspected' },
    { title: 'Incidência', value: rawData.incidenceRate || '0.0', color: '#06D6A0', icon: '📈', type: 'incidence' },
  ];

  const fetchData = useCallback(async () => {
    try {
      setDataLoaded(false);
      const [statsRes, timelineRes, regionRes, recentRes] = await Promise.all([
        casesAPI.getStats(),
        casesAPI.getTimeline(),
        casesAPI.getByRegion(),
        casesAPI.getAll({ limit: 5 })
      ]);
      setStats(formatStats(statsRes.data));
      setChartData(timelineRes.data);
      setBarChartData(regionRes.data);
      setOutbreaks(regionRes.data);
      setRecentCases(recentRes.data);
      setDataLoaded(true);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setDataLoaded(true);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Atualização em tempo real
  useWebSocket('case:created', () => fetchData());

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/dashboard/casos', icon: '📋', label: 'Cadastrar Caso' },
    { path: '/dashboard/mapa', icon: '🗺️', label: 'Mapa Interativo' },
    { path: '/dashboard/alertas', icon: '⚠️', label: 'Alertas' },
    { path: '/dashboard/configuracoes', icon: '⚙️', label: 'Configurações' },
  ];

  // Handler para ações rápidas (Exemplo de navegação)
  const handlePrint = () => window.print();

  return (
    <div className="dashboard-container" data-theme={theme}>
      <RealTimeAlert />

      {/* Overlay Backdrop */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar Drawer */}
      <aside className={`sidebar-menu ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>🦟 Dengue Tracker</span>
          <button className="close-menu" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">✕</button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`} 
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: '20px' }}>
             <ConnectionStatus />
        </div>
        <button onClick={logout} className="logout-button">
            🚪 Sair do Sistema
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-viewport">
        {/* Sticky Glass Header */}
        <header className="top-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
                ☰
            </button>
            <h1 className="page-title">Monitoramento</h1>
          </div>
          
          <div className="header-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <NotificationBell />
                <div className="user-profile hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar-small" style={{
                        width: '35px', height: '35px', borderRadius: '50%', 
                        background: 'var(--primary)', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {user?.name?.split(' ')[0] || 'Admin'}
                    </span>
                </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <section className="scrollable-content">
          {/* 1. Cards de Resumo (Stats) */}
          <div className="stats-row">
            {stats.map((stat, i) => <StatsCard key={i} {...stat} />)}
          </div>

          {/* 2. Gráfico de Evolução */}
          <div className="content-card">
            <div className="card-title">
                <span>Evolução de Casos</span>
            </div>
            <div className="chart-wrapper">
              {dataLoaded ? <DengueLineChart data={chartData} /> : <div className="loader">Carregando dados...</div>}
            </div>
          </div>

          {/* 3. Mapa Interativo */}
          <div className="content-card">
            <div className="card-title">
                <span>Mapa de Calor</span>
            </div>
            <div className="map-wrapper">
              {dataLoaded ? <InteractiveDengueMap outbreaks={outbreaks} /> : <div className="loader">Carregando mapa...</div>}
            </div>
          </div>

          {/* 4. Gráfico de Barras */}
          <div className="content-card">
            <div className="card-title">
                <span>Distribuição Regional</span>
            </div>
            <div className="chart-wrapper">
               {dataLoaded ? <DengueBarChart data={barChartData} /> : <div className="loader">Carregando dados...</div>}
            </div>
          </div>

          {/* 5. Ações Rápidas */}
          <div className="actions-section">
            <h2 className="card-title">Ações Rápidas</h2>
            <div className="actions-flex">
              <button className="quick-btn" onClick={handlePrint}>
                📊 Gerar Relatório PDF
              </button>
              <Link to="/dashboard/casos" className="quick-btn" style={{ textDecoration: 'none' }}>
                📍 Novo Registro
              </Link>
              <button className="quick-btn">
                📱 Enviar Alerta
              </button>
              <button className="quick-btn" onClick={toggleTheme}>
                {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;