import { Component, OnInit, inject } from '@angular/core';
import { FacturacionService } from '../../../../services/facturacion.service';
import { Factura } from '../../../../core/models/facturacion';
// Importamos la configuración de la tabla genérica (asumiendo que tienes la interfaz)
// Si no tienes la interfaz ColumnConfig exportada, defínela aquí o usa 'any'
export interface ColumnConfig {
  name: string;
  header: string;
  isDate?: boolean;
  isCurrency?: boolean; // Agregamos soporte para moneda si tu tabla lo tiene
}

@Component({
  selector: 'app-gestion-facturacion',
  templateUrl: './gestion-facturacion.html',
  styleUrls: ['./gestion-facturacion.css']
})
export class GestionFacturacionComponent implements OnInit {
  
  private facturacionService = inject(FacturacionService);

  facturas: Factura[] = [];
  facturaSeleccionada: Factura | null = null;
  
  // Control de Modales
  mostrarFormulario = false;
  mostrarConfirmacion = false;
  facturaParaEditar: Factura | null = null;
  facturaParaEliminar: Factura | null = null;

  // Configuración de Columnas para Tabla Genérica
  columnas: ColumnConfig[] = [
    { name: 'facturaId', header: 'ID' },
    { name: 'paciente.nombre', header: 'Paciente' }, // Asumiendo que el objeto factura trae el paciente poblado
    { name: 'fechaEmision', header: 'Fecha', isDate: true },
    { name: 'montoTotal', header: 'Monto', isCurrency: true },
    { name: 'estadoPago', header: 'Estado' }
  ];

  ngOnInit(): void {
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    // Simulamos un ID de paciente o usamos un método para listar todas las facturas
    // Si tu servicio pide ID obligatoriamente, ajusta esto.
    // Por ahora usaré un método ficticio listarTodas() o listarPendientes de un paciente 1 para probar
    this.facturacionService.obtenerPendientes(1).subscribe({
        next: (data) => this.facturas = data,
        error: (err) => console.error(err)
    });
  }

  // --- Eventos de la Tabla ---

  alSeleccionar(factura: Factura): void {
    this.facturaSeleccionada = factura;
  }

  alAgregar(): void {
    this.facturaParaEditar = null;
    this.mostrarFormulario = true;
  }

  alEditar(factura: Factura): void {
    this.facturaParaEditar = factura;
    this.mostrarFormulario = true;
  }

  alEliminar(factura: Factura): void {
    this.facturaParaEliminar = factura;
    this.mostrarConfirmacion = true;
  }

  // --- Lógica de Guardado/Eliminado ---

  guardarFactura(datos: any): void {
    // Aquí llamarías a crear o actualizar en el servicio
    console.log('Guardando factura:', datos);
    // this.facturacionService.generarFactura(datos)...
    
    this.mostrarFormulario = false;
    this.cargarFacturas(); // Recargar lista
  }

  confirmarEliminacion(): void {
    if (this.facturaParaEliminar) {
        console.log('Eliminando factura:', this.facturaParaEliminar.facturaId);
        // this.facturacionService.eliminar(this.facturaParaEliminar.facturaId)...
    }
    this.mostrarConfirmacion = false;
    this.facturaParaEliminar = null;
  }
}