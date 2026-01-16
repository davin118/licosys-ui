import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { isAuthenticated } from "../utils/auth";
interface Props {
    children: JSX.Element;
}

/**
 * Componente de protección de rutas.
 * Redirige al login si el usuario no tiene un token válido.
 */
export default function ProtectedRoute({ children }: Props) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

