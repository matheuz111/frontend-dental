import { PersonaBase } from './persona';

export interface Paciente extends PersonaBase {
    pacienteId: number;
    documentoIdentidad: string; 
    fechaNacimiento?: Date;
    genero?: string;
    direccion?: string;
    alergias?: string;
    telefono?: string;
}