import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "jwt-decode";

const TOKEN_KEY = "token";
const AUTH_USER_KEY = "auth_user";

interface StoredAuthUser {
    email?: string;
    id?: string;
    nombre?: string;
    rol?: string;
    debeCambiarPassword?: boolean;
}

export interface LoginResponse {
    token: string;
    id?: string;
    email?: string;
    nombre?: string;
    rol?: string;
    debeCambiarPassword?: boolean;
}

export interface DecodedToken extends JwtPayload {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    nombreCompleto?: string;
    cargo?: string;
    debeCambiarPassword?: boolean;
}

function parseToken(token: string): DecodedToken | null {
    try {
        const decoded: Record<string, unknown> = jwtDecode(token);

        return {
            id: (decoded.id as string | undefined) ?? (decoded.sub as string | undefined),
            email:
                (decoded.email as string | undefined) ??
                (decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string | undefined),
            name:
                (decoded.name as string | undefined) ??
                (decoded.unique_name as string | undefined) ??
                (decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string | undefined),
            role:
                (decoded.role as string | undefined) ??
                (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string | undefined),
            nombreCompleto: (decoded.nombreCompleto as string | undefined) ?? (decoded.NombreCompleto as string | undefined),
            cargo: (decoded.cargo as string | undefined) ?? (decoded.Cargo as string | undefined),
            debeCambiarPassword:
                (decoded.debeCambiarPassword as boolean | undefined) ??
                (decoded.DebeCambiarPassword as boolean | undefined),
            exp: decoded.exp as number | undefined,
        };
    } catch (err) {
        console.error("Error al decodificar el token:", err);
        return null;
    }
}

function getStoredAuthUser(): StoredAuthUser | null {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as StoredAuthUser;
    } catch (err) {
        console.error("Error al leer la sesión almacenada:", err);
        localStorage.removeItem(AUTH_USER_KEY);
        return null;
    }
}

function isTokenExpired(decoded: DecodedToken | null): boolean {
    if (!decoded?.exp) {
        return false;
    }

    return decoded.exp * 1000 <= Date.now();
}

export const saveAuthSession = (session: LoginResponse): void => {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify({
            email: session.email,
            id: session.id,
            nombre: session.nombre,
            rol: session.rol,
            debeCambiarPassword: session.debeCambiarPassword ?? false,
        } satisfies StoredAuthUser)
    );
};

export const saveToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
};

export const markPasswordChangeComplete = (): void => {
    const current = getStoredAuthUser();
    if (!current) {
        return;
    }

    localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify({
            ...current,
            debeCambiarPassword: false,
        } satisfies StoredAuthUser)
    );
};

export const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) {
        return false;
    }

    const decoded = parseToken(token);
    if (!decoded || isTokenExpired(decoded)) {
        clearToken();
        return false;
    }

    return true;
};

export const getUserFromToken = (): DecodedToken | null => {
    const token = getToken();
    if (!token) {
        return null;
    }

    const decoded = parseToken(token);
    if (!decoded || isTokenExpired(decoded)) {
        clearToken();
        return null;
    }

    const stored = getStoredAuthUser();

    return {
        ...decoded,
        id: stored?.id || decoded.id,
        email: stored?.email || decoded.email,
        name: stored?.nombre || decoded.nombreCompleto || decoded.name,
        role: stored?.rol || decoded.role,
        debeCambiarPassword: stored?.debeCambiarPassword ?? decoded.debeCambiarPassword ?? false,
    };
};
