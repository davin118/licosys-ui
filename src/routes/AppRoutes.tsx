import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "../pages/Auth/Login";
import ForceChangePassword from "../pages/Auth/ForceChangePassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import Productos from "../pages/Productos/Productos";
import Categorias from "../pages/Categorias/Categorias";
import Proveedores from "../pages/Proveedores/Proveedores";
import Compras from "../pages/Compras/Compras";
import Clientes from "../pages/Clientes/Clientes";
import MainLayout from "../components/layout/MainLayout";
import { isAuthenticated, getUserFromToken } from "../utils/auth";
import Usuarios from "../pages/Usuarios.tsx/Usuarios";
import PerfilUsuario from "../pages/Usuarios.tsx/PerfilUsuario";
import Ventas from "../pages/Ventas/Ventas";
import VentasPOS from "../pages/Ventas/VentasPOS";
import Backup from "../pages/Backup/Backup";
import Reportes from "../pages/reportes/Reportes";
import InventarioReporte from "../pages/reportes/InventarioReporte";
import NoPermission from "../pages/Auth/NoPermission";
import type { JSX } from "react";


function PublicRoute({ children }: { children: JSX.Element }) {
    const user = getUserFromToken();

    if (!isAuthenticated()) {
        return children;
    }

    return user?.debeCambiarPassword
        ? <Navigate to="/cambiar-password-obligatorio" replace />
        : <Navigate to="/" replace />;
}


function PrivateRoute({ children }: { children: JSX.Element }) {
    const location = useLocation();
    const user = getUserFromToken();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (user?.debeCambiarPassword && location.pathname !== "/cambiar-password-obligatorio") {
        return <Navigate to="/cambiar-password-obligatorio" replace />;
    }

    return children;
}


function RoleRoute({
    children,
    roles
}: {
    children: JSX.Element;
    roles: string[];
}) {
    const user = getUserFromToken();

    if (!user?.role || !roles.includes(user.role)) {
        return <Navigate to="/no-permission" replace />;
    }

    return children;
}


export default function AppRoutes() {
    return (
        <Router>
            <Routes>

                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/cambiar-password-obligatorio"
                    element={
                        <PrivateRoute>
                            <ForceChangePassword />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <MainLayout />
                        </PrivateRoute>
                    }
                >
                    <Route path="no-permission" element={<NoPermission />} />

                    <Route index element={<Dashboard />} />

                    <Route
                        path="productos"
                        element={
                            <RoleRoute roles={["Administrador", "Vendedor"]}>
                                <Productos />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="categorias"
                        element={
                            <RoleRoute roles={["Administrador"]}>
                                <Categorias />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="proveedores"
                        element={
                            <RoleRoute roles={["Administrador"]}>
                                <Proveedores />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="clientes"
                        element={
                            <RoleRoute roles={["Administrador", "Vendedor"]}>
                                <Clientes />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="compras"
                        element={
                            <RoleRoute roles={["Administrador"]}>
                                <Compras />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="usuarios"
                        element={
                            <RoleRoute roles={["Administrador"]}>
                                <Usuarios />
                            </RoleRoute>
                        }
                    />

                    <Route path="perfil" element={<PerfilUsuario />} />

                    <Route
                        path="ventas"
                        element={
                            <RoleRoute roles={["Administrador", "Vendedor"]}>
                                <Ventas />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="ventas-pos"
                        element={
                            <RoleRoute roles={["Administrador", "Vendedor"]}>
                                <VentasPOS />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="backup"
                        element={
                            <RoleRoute roles={["Administrador"]}>
                                <Backup />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="reportes"
                        element={
                            <RoleRoute roles={["Administrador", "Vendedor", "Consulta"]}>
                                <Reportes />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="reportes/inventario"
                        element={
                            <RoleRoute roles={["Administrador", "Consulta"]}>
                                <InventarioReporte />
                            </RoleRoute>
                        }
                    />

                </Route>

                <Route
                    path="*"
                    element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />}
                />

            </Routes>
        </Router>
    );
}
