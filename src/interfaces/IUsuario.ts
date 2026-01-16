export interface IUsuario {
    id?: string;                  // Identificador único (GUID)
    email: string;                // Correo electrónico
    userName?: string;            // Nombre de usuario (puede ser igual al email)
    rol: string;                  // Rol asignado (Administrador, Vendedor, etc.)
    activo: boolean;              // Estado del usuario
    debeCambiarPassword?: boolean; // Si debe cambiar la contraseña al iniciar sesión
    nombreCompleto?: string;      // Nombre completo del usuario
    cargo?: string;               // Cargo o puesto
    fechaRegistro?: string;       // Fecha de creación del usuario (ISO)
}

