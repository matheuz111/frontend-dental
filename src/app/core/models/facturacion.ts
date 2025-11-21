import { Paciente } from './paciente';

export interface Factura {
    facturaId: number;
    pacienteId: number;
    fechaEmision: Date;
    montoTotal: number;
    estadoPago: 'Pendiente' | 'Pagado' | 'Parcial';
    tipoComprobante: 'Boleta' | 'Factura';
    
    paciente?: Paciente;
    pagos?: Pago[];
}

export interface Pago {
    pagoId: number;
    comprobanteId: number; // Relacion con facturaId
    fechaPago: Date;
    montoPagado: number;
    metodoPago?: string; // 'Efectivo', 'Tarjeta', etc.
}