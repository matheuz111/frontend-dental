import { Rol } from './rol';

export interface Usuario {
    usuarioId: number;
    documentoIdentidad: string;
    rol?: Rol; // Opcional porque viene del join con la tabla roles
    rolId: number;
    intentosFallidos: number;
    bloqueado: boolean;
    token?: string; // Para manejo de sesión en frontend
}

export interface LoginPayload {
    documentoIdentidad: string;
    contrasena: string;
}

export interface UserProfile {
  id?: number; // O 'usuarioId' si así lo mapeaste
  usuarioId?: number; // Tener ambos mapeados ayuda
  nombres: string;
  apellidos: string;
  documentoIdentidad: string;
  email: string;
  rol: Rol;
  permisos?: string[];
}