import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/login/Login';
import CreateCase from './pages/cases/CreateCase';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Rota Protegida: Dashboard */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                
                {/* Rota Protegida: Cadastro de Casos */}
                <Route 
                  path="/dashboard/casos" 
                  element={
                    <PrivateRoute>
                      <CreateCase />
                    </PrivateRoute>
                  } 
                />

                {/* REDIRECIONAMENTO CRÍTICO: Da raiz para o dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Qualquer rota desconhecida vai para o dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;