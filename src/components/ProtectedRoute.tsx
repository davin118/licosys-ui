import { Navigate } from "react-router-dom";
import { getToken, getUserFromToken } from "../utils/auth";
import type { JSX } from "react";

interface Props {
    children: JSX.Element;
    roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
    const token = getToken();

    // 🔐 No logeado
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const user = getUserFromToken();

    // 🔐 Sin permisos
    if (roles && (!user?.role || !roles.includes(user.role))) {
        return <Navigate to="/no-permission" replace />;
    }

    return children;
}
