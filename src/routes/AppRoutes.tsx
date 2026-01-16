import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Productos from "../pages/Productos/Productos";
import Categorias from "../pages/Categorias/Categorias";
import Proveedores from "../pages/Proveedores/Proveedores";
import MainLayout from "../components/layout/MainLayout";
import { isAuthenticated } from "../utils/auth";
import Usuarios from "../pages/Usuarios.tsx/Usuarios";
import type { JSX } from "react";
import Ventas from "../pages/Ventas/Ventas";
import VentasPOS from "../pages/Ventas/VentasPOS";
import PerfilUsuario from "../pages/Usuarios.tsx/PerfilUsuario";

// ✅ Componente para proteger rutas
function PrivateRoute({ children }: { children: JSX.Element }) {
    const token = isAuthenticated();
    return token ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* RUTA PÚBLICA */}
                <Route path="/login" element={<Login />} />

                {/* RUTAS PRIVADAS */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <MainLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="productos" element={<Productos />} />
                    <Route path="categorias" element={<Categorias />} />
                    <Route path="proveedores" element={<Proveedores />} />
                    <Route path="usuarios" element={<Usuarios />} />
                    <Route path="perfil" element={<PerfilUsuario />} />
                    <Route path="ventas" element={<Ventas />} />
                    <Route path="ventas-pos" element={<VentasPOS />} />
                </Route>

                {/* CUALQUIER RUTA DESCONOCIDA */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}
