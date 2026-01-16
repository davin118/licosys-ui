import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "jwt-decode";

const TOKEN_KEY = "token";

/**
 * Guarda el token JWT en localStorage.
 */
export const saveToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Obtiene el token JWT almacenado.
 */
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Elimina el token JWT del almacenamiento.
 */
export const clearToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Verifica si el usuario está autenticado.
 */
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

/**
 * Interfaz extendida del JWT decodificado.
 */
export interface DecodedToken extends JwtPayload {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    nombreCompleto?: string;
    cargo?: string;
    debeCambiarPassword?: boolean;
}

/**
 * 🔍 Decodifica el token y obtiene los datos completos del usuario actual.
 */
export const getUserFromToken = (): DecodedToken | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded: any = jwtDecode(token);

        return {
            id: decoded["id"] || decoded["sub"],
            email:
                decoded["email"] ||
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
            name:
                decoded["name"] ||
                decoded["unique_name"] ||
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
            role:
                decoded["role"] ||
                decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
            nombreCompleto: decoded["nombreCompleto"] || decoded["NombreCompleto"],
            cargo: decoded["cargo"] || decoded["Cargo"],
            debeCambiarPassword:
                decoded["debeCambiarPassword"] || decoded["DebeCambiarPassword"],
            exp: decoded["exp"],
        };
    } catch (err) {
        console.error("❌ Error al decodificar el token:", err);
        return null;
    }
};
