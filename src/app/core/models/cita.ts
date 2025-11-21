import { Paciente } from './paciente';
import { Odontologo } from './odontologo';

export interface Cita {
    citaId: number;
    pacienteId: number;
    odontologoId: number;
    fechaCita: Date; // Mapeo de fecha_cita
    horaCita: string; // Mapeo de hora_cita (Time)
    motivo?: string;
    estado: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada'; // Ajustar según lógica de negocio
    tipoCancelacion?: string; // NULLABLE en BD
    
    // Relaciones opcionales (para cuando traigas los datos completos)
    paciente?: Paciente;
    odontologo?: Odontologo;
}