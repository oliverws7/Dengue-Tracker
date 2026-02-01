// src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

export function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        // Redirecionar para login se não autenticado
        return <Navigate to="/" replace />;
    }
    
    return children;
}