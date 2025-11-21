import { PersonaBase } from './persona'; // Si usas herencia

// Asegúrate que tenga estos campos
export interface Paciente extends PersonaBase {
    pacienteId: number;
    // Agrega este campo para que coincida con tu HTML y Base de Datos:
    documentoIdentidad?: string; 
    fechaNacimiento?: Date;
    genero?: string;
    direccion?: string;
    alergias?: string;
    telefono?: string; // Asegúrate que esté aquí o en PersonaBase
}