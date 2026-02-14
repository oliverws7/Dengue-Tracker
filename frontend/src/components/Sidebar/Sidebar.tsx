"use client"
import {
  AlertTriangle,
  BarChart3,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Shield,
  Thermometer,
  RefreshCw,
  WifiOff,
  Clock,
  LogOutIcon
} from "lucide-react"
import Button from "../UI/Button/Button"
import Slider from "../UI/Slider/Slider"
import Switch from "../UI/Switch/Switch"
import Badge from "../UI/Badge/Badge"
import Card from "../UI/Card/Card"
import Tabs from "../UI/Tabs/Tabs"
import { useStatistics } from "../../hooks/useStatistics"
import { useAuth } from "../../context/AuthContext"
import "./Sidebar.css"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  radiusKm: number
  setRadiusKm: (value: number) => void
  showHighRisk: boolean
  setShowHighRisk: (value: boolean) => void
  showMediumRisk: boolean
  setShowMediumRisk: (value: boolean) => void
  showLowRisk: boolean
  setShowLowRisk: (value: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({
  isOpen,
  onToggle,
  radiusKm,
  setRadiusKm,
  showHighRisk,
  setShowHighRisk,
  showMediumRisk,
  setShowMediumRisk,
  showLowRisk,
  setShowLowRisk,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  const { stats, loading, error, refreshStats, lastUpdate } = useStatistics(30000);
  const { logout } = useAuth();

  const totalByRisk = stats.highRisk + stats.mediumRisk + stats.lowRisk;
  
  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const highRiskPercentage = calculatePercentage(stats.highRisk, totalByRisk);
  const mediumRiskPercentage = calculatePercentage(stats.mediumRisk, totalByRisk);
  const lowRiskPercentage = calculatePercentage(stats.lowRisk, totalByRisk);

  const handleRefreshStats = () => {
    refreshStats();
  };

  const handleLogout = () => {
    logout();
  };

  const renderLoadingState = () => (
    <div className="loading-state">
      <RefreshCw size={16} className="spinning" />
      <span>Carregando estatísticas...</span>
    </div>
  );

  const renderErrorState = () => (
    <Card className="info-card red">
      <div className="info-content">
        <WifiOff size={14} />
        <div>
          <p>Erro ao carregar estatísticas</p>
          <p className="error-message">{error}</p>
          <Button 
            onClick={handleRefreshStats} 
            className="retry-button"
            size="small"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="header-content">
          <div className="logo-side">
            <div className="logo-icon-side">
              <AlertTriangle size={18} />
            </div>
            <div className="logo-text-side">
              <h2>Dengue Tracker</h2>
              <p>Sistema de monitoramento</p>
            </div>
          </div>
          <Button onClick={onToggle} className="sidebar-toggle">
            <span className="close-icon"></span>
          </Button>
        </div>
      </div>

      <div className="sidebar-content">
        <Tabs
          tabs={[
            { id: "filtros", label: "Filtros" },
            { id: "estatisticas", label: "Estatísticas" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        >
          {activeTab === "filtros" && (
            <div className="tab-content">
              <div className="sidebar-group">
                <div className="group-label">
                  <Layers size={16} />
                  <span>Configurações do Mapa</span>
                </div>
                <div className="group-content">
                  <div className="space-y">
                    <div className="slider-container">
                      <div className="slider-header">
                        <label htmlFor="radius">Raio de busca</label>
                        <Badge variant="outline">{radiusKm} km</Badge>
                      </div>
                      <Slider id="radius" min={1} max={20} step={1} value={radiusKm} onChange={setRadiusKm} />
                      <div className="slider-labels">
                        <span>1 km</span>
                        <span>10 km</span>
                        <span>20 km</span>
                      </div>
                    </div>

                    <div className="separator"></div>

                    <div className="risk-levels">
                      <h3>
                        <Shield size={16} />
                        <span>Nível de risco</span>
                      </h3>
                      <div className="risk-options">
                        <div className="risk-option">
                          <label htmlFor="high-risk" className="risk-label">
                            <div className="risk-dot high-risk"></div>
                            <span>Alto risco</span>
                          </label>
                          <Switch id="high-risk" checked={showHighRisk} onChange={setShowHighRisk} />
                        </div>
                        <div className="risk-option">
                          <label htmlFor="medium-risk" className="risk-label">
                            <div className="risk-dot medium-risk"></div>
                            <span>Médio risco</span>
                          </label>
                          <Switch id="medium-risk" checked={showMediumRisk} onChange={setShowMediumRisk} />
                        </div>
                        <div className="risk-option">
                          <label htmlFor="low-risk" className="risk-label">
                            <div className="risk-dot low-risk"></div>
                            <span>Baixo risco</span>
                          </label>
                          <Switch id="low-risk" checked={showLowRisk} onChange={setShowLowRisk} />
                        </div>
                      </div>
                    </div>

                    <Card className="info-card amber">
                      <div className="info-content">
                        <Info size={14} />
                        <p>Os focos são atualizados automaticamente a cada 30 segundos.</p>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "estatisticas" && (
            <div className="tab-content">
              <div className="sidebar-group">
                <div className="group-label">
                  <BarChart3 size={16} />
                  <span>Estatísticas de Focos</span>
                  <Button 
                    onClick={handleRefreshStats} 
                    className="refresh-button"
                    size="small"
                    disabled={loading}
                  >
                    <RefreshCw size={12} className={loading ? "spinning" : ""} />
                  </Button>
                </div>
                <div className="group-content">
                  {error && renderErrorState()}
                  
                  {loading && !error ? renderLoadingState() : (
                    <div className="stats-container">
                      <div className="stats-cards">
                        <Card>
                          <div className="stat-card-content">
                            <p className="stat-label">Total de focos</p>
                            <p className="stat-value">{stats.total}</p>
                          </div>
                        </Card>
                        <Card>
                          <div className="stat-card-content">
                            <p className="stat-label">Focos ativos</p>
                            <p className="stat-value active">{stats.active}</p>
                          </div>
                        </Card>
                        <Card>
                          <div className="stat-card-content">
                            <p className="stat-label">Resolvidos</p>
                            <p className="stat-value resolved">{stats.resolved}</p>
                          </div>
                        </Card>
                      </div>

                      <div className="risk-distribution">
                        <h3>Distribuição por risco</h3>

                        <div className="risk-stat">
                          <div className="risk-stat-header">
                            <div className="risk-label">
                              <div className="risk-dot high-risk"></div>
                              <span>Alto risco</span>
                            </div>
                            <div className="risk-value">
                              <span>{stats.highRisk}</span>
                              <span className="percentage">
                                ({highRiskPercentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress high-risk"
                              style={{ 
                                width: `${highRiskPercentage}%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="risk-stat">
                          <div className="risk-stat-header">
                            <div className="risk-label">
                              <div className="risk-dot medium-risk"></div>
                              <span>Médio risco</span>
                            </div>
                            <div className="risk-value">
                              <span>{stats.mediumRisk}</span>
                              <span className="percentage">
                                ({mediumRiskPercentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress medium-risk"
                              style={{ 
                                width: `${mediumRiskPercentage}%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="risk-stat">
                          <div className="risk-stat-header">
                            <div className="risk-label">
                              <div className="risk-dot low-risk"></div>
                              <span>Baixo risco</span>
                            </div>
                            <div className="risk-value">
                              <span>{stats.lowRisk}</span>
                              <span className="percentage">
                                ({lowRiskPercentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress low-risk"
                              style={{ 
                                width: `${lowRiskPercentage}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <Card className="info-card blue">
                        <div className="info-content">
                          <Clock size={14} />
                          <p>Última atualização: {lastUpdate}</p>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Tabs>

        <div className="sidebar-group">
          <div className="group-label">
            <FileText size={16} />
            <span>Ações</span>
          </div>
          <div className="group-content">
            <div className="action-menu">
              <button className="action-button">
                <Thermometer size={16} />
                <span>Verificar sintomas</span>
              </button>
              <button className="action-button">
                <HelpCircle size={16} />
                <span>Como se prevenir</span>
              </button>
              <button className="action-button" onClick={handleLogout}>
                <LogOutIcon size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="footer-content">
          <div className="system-status">
            <div className="status-indicator">
              <div className={`status-dot ${error ? 'error' : 'success'}`}></div>
              <span>{error ? 'Sistema com erro' : 'Sistema operacional'}</span>
            </div>
            <Badge variant="outline" size="small">
              v1.0
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}