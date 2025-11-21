import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TratamientoService } from '../../../../services/tratamiento.service';
import { PacienteService } from '../../../../services/paciente.service';
import { HistorialTratamiento } from '../../../../core/models/tratamiento';
import { ColumnConfig } from '../../../../shared/tabla-generica/tabla-generica';
import { Paciente } from '../../../../core/models/paciente';

@Component({
  selector: 'app-historia-clinica',
  templateUrl: './historia-clinica.html',
  styleUrls: ['./historia-clinica.css']
})
export class HistoriaClinicaComponent implements OnInit {
  
  private tratamientoService = inject(TratamientoService);
  private pacienteService = inject(PacienteService);
  private route = inject(ActivatedRoute);

  historial: HistorialTratamiento[] = [];
  pacienteActual: Paciente | null = null;
  
  // Configuración de Tabla
  columnas: ColumnConfig[] = [
    { name: 'fechaRealizacion', header: 'Fecha', isDate: true },
    { name: 'cita.odontologo.nombre', header: 'Odontólogo' }, // Asumiendo relación anidada
    { name: 'diagnostico', header: 'Diagnóstico' },
    { name: 'tratamiento', header: 'Tratamiento Realizado' } // Si tienes un campo resumen
  ];

  // Modal
  mostrarDetalle = false;
  registroSeleccionado: any = null;

  ngOnInit(): void {
    // Verifica si venimos con un ID de paciente en la URL (ej: /panel/historia?pacienteId=5)
    this.route.queryParams.subscribe(params => {
      const pacienteId = params['pacienteId'];
      if (pacienteId) {
        this.cargarHistorialPaciente(+pacienteId);
      } else {
        // Si no hay paciente, mostramos columna de paciente también
        this.agregarColumnaPaciente();
        this.cargarHistorialGeneral();
      }
    });
  }

  agregarColumnaPaciente(): void {
    // Insertamos la columna Paciente al principio si estamos en vista general
    this.columnas.unshift({ name: 'cita.paciente.nombre', header: 'Paciente' });
  }

  cargarHistorialPaciente(id: number): void {
    // 1. Obtenemos datos del paciente para el título
    this.pacienteService.obtenerPorId(id).subscribe(p => this.pacienteActual = p);
    
    // 2. Obtenemos su historial
    this.tratamientoService.obtenerHistorialPorPaciente(id).subscribe({
      next: (data) => this.historial = data,
      error: (err) => console.error('Error cargando historial', err)
    });
  }

  cargarHistorialGeneral(): void {
    this.tratamientoService.listarHistorialGeneral().subscribe({
      next: (data) => this.historial = data,
      error: (err) => console.error('Error cargando historial general', err)
    });
  }

  // --- Acciones ---

  verDetalle(registro: HistorialTratamiento): void {
    // Reutilizamos el FormularioConsulta en modo "solo lectura" o edición
    // Mapeamos los datos para que coincidan con lo que espera el formulario
    this.registroSeleccionado = {
      odontologoId: registro.citaId ? 0 : 0, // Ajustar según tu modelo real
      motivo: 'Consulta Histórica',
      diagnostico: registro.diagnostico,
      tratamiento: registro.detalles?.[0]?.observaciones || 'Ver detalles...', // Simplificación
      notas: ''
    };
    this.mostrarDetalle = true;
  }
}