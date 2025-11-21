import { Component, OnInit, inject } from '@angular/core';
import { PacienteService } from '../../../../services/paciente.service';
import { Paciente } from '../../../../core/models/paciente';
import { ColumnConfig } from '../../../../shared/tabla-generica/tabla-generica';

@Component({
  selector: 'app-gestion-pacientes',
  templateUrl: './gestion-pacientes.html',
  styleUrls: ['./gestion-pacientes.css'],
  standalone: false
})
export class GestionPacientesComponent implements OnInit {
  
  private pacienteService = inject(PacienteService);

  pacientes: Paciente[] = [];
  
  // Estado de los Modales
  mostrarFormulario = false;
  mostrarConfirmacion = false;
  
  pacienteSeleccionado: Paciente | null = null; // Para editar
  pacienteAEliminar: Paciente | null = null;

  // Configuración de Columnas para Tabla
  columnas: ColumnConfig[] = [
    { name: 'documentoIdentidad', header: 'DNI/Doc' },
    { name: 'nombre', header: 'Nombre' },
    { name: 'apellido', header: 'Apellido' },
    { name: 'telefono', header: 'Teléfono' },
    { name: 'email', header: 'Correo' }
  ];

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.pacienteService.listar().subscribe({
      next: (data) => this.pacientes = data,
      error: (e) => console.error('Error al cargar pacientes', e)
    });
  }

  // --- Acciones ---

  abrirCrear(): void {
    this.pacienteSeleccionado = null;
    this.mostrarFormulario = true;
  }

  abrirEditar(paciente: Paciente): void {
    this.pacienteSeleccionado = paciente;
    this.mostrarFormulario = true;
  }

  abrirEliminar(paciente: Paciente): void {
    this.pacienteAEliminar = paciente;
    this.mostrarConfirmacion = true;
  }

  // --- Lógica de Persistencia ---

  guardarPaciente(datos: Paciente): void {
    if (datos.pacienteId) {
      // Actualizar
      this.pacienteService.actualizar(datos.pacienteId, datos).subscribe(() => {
        this.cargarPacientes();
        this.mostrarFormulario = false;
      });
    } else {
      // Crear
      this.pacienteService.crear(datos).subscribe(() => {
        this.cargarPacientes();
        this.mostrarFormulario = false;
      });
    }
  }

  confirmarEliminacion(): void {
    if (this.pacienteAEliminar && this.pacienteAEliminar.pacienteId) {
      this.pacienteService.eliminar(this.pacienteAEliminar.pacienteId).subscribe({
        next: () => {
          this.cargarPacientes();
          this.mostrarConfirmacion = false;
          this.pacienteAEliminar = null;
        },
        error: (err) => console.error('Error eliminando', err)
      });
    }
  }
}