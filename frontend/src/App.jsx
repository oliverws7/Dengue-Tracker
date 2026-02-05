// src/App.jsx
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewReport from "./pages/NewReport";
import ErrorBoundary from "./components/ErrorBoundary";
import { PrivateRoute } from "./routes/PrivateRoute";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Rota raiz e Login */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Rota pública para Cadastro */}
          <Route path="/register" element={<Register />} />

          {/* Rotas Protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/novo-relatorio"
            element={
              <PrivateRoute>
                <NewReport />
              </PrivateRoute>
            }
          />

          {/* 404 - Página não encontrada */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Página não encontrada</p>
                  <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
                    Voltar para o Dashboard
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}