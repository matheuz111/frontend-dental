import { Component, OnInit, inject } from '@angular/core';
import { FacturacionService } from '../../../../services/facturacion.service';
import { Factura } from '../../../../core/models/facturacion';
// CORRECCIÓN 1: Importar ColumnConfig desde el compartido y borrar la interfaz local
import { ColumnConfig } from '../../../../shared/tabla-generica/tabla-generica';

@Component({
  selector: 'app-gestion-facturacion',
  templateUrl: './gestion-facturacion.html',
  styleUrls: ['./gestion-facturacion.css'],
  standalone: false // CORRECCIÓN 2: Necesario para que funcione en tu módulo
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
    { name: 'paciente.nombre', header: 'Paciente' }, 
    { name: 'fechaEmision', header: 'Fecha', isDate: true },
    { name: 'montoTotal', header: 'Monto', isCurrency: true },
    { name: 'estadoPago', header: 'Estado' }
  ];

  ngOnInit(): void {
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    // Ajusta esto según cómo funcione tu backend real
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
    console.log('Guardando factura:', datos);
    // this.facturacionService.generarFactura(datos)...
    
    this.mostrarFormulario = false;
    this.cargarFacturas(); 
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