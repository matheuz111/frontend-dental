import { PersonaBase } from './persona';

export interface Odontologo extends PersonaBase {
    odontologoId: number;
    especialidad?: string;
}