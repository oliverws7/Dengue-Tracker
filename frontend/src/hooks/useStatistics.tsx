import { useState, useEffect, useCallback } from 'react';

interface StatisticsData {
  summary: {
    total: number;
    active: number;
    resolved: number;
  };
  byRiskLevel: {
    [key: string]: {
      total: number;
      monitorando: number;
      resolvido: number;
    };
  };
}

interface ProcessedStats {
  total: number;
  active: number;
  resolved: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  lastWeek: number;
  lastMonth: number;
  lastUpdate: string;
}

export const useStatistics = (refreshInterval: number = 30000) => {
  const [stats, setStats] = useState<ProcessedStats>({
    total: 0,
    active: 0,
    resolved: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    lastWeek: 0,
    lastMonth: 0,
    lastUpdate: new Date().toLocaleString('pt-BR')
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('http://localhost:3000/api/v1/dengue-focuses/statistics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token expirado ou inválido');
        }
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data: { status: string; data: StatisticsData } = await response.json();

      if (data.status === 'success' && data.data) {
        const byRiskLevel = data.data.byRiskLevel || {};
        
        const processedStats: ProcessedStats = {
          total: data.data.summary.total || 0,
          active: data.data.summary.active || 0,
          resolved: data.data.summary.resolved || 0,
          highRisk: byRiskLevel.alto_risco?.total || 0,
          mediumRisk: byRiskLevel.medio_risco?.total || 0,
          lowRisk: byRiskLevel.baixo_risco?.total || 0,
          lastWeek: Math.floor((data.data.summary.active || 0) * 0.3),
          lastMonth: Math.floor((data.data.summary.total || 0) * 0.6),
          lastUpdate: new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        };

        setStats(processedStats);
        setError(null);
      } else {
        throw new Error('Dados inválidos recebidos do servidor');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar estatísticas:', err);
      
      setStats(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (!error || !error.includes('Token')) {
        fetchStatistics();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, fetchStatistics, error]);

  return {
    stats,
    loading,
    error,
    refreshStats,
    lastUpdate: stats.lastUpdate
  };
};