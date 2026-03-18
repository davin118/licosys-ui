import { createContext, useContext, useState } from "react";
import type { IUsuario } from "../interfaces/IUsuario";
import { clearToken, saveAuthSession } from "../utils/auth";

interface AuthContextType {
    user: IUsuario | null;
    login: (token: string, email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUsuario | null>(null);

    const login = (token: string, email: string) => {
        saveAuthSession({ token, email });
        setUser({
            email,
            rol: "",
            activo: true,
        });
    };

    const logout = () => {
        clearToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};
