import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CitaService } from '../../../../services/cita.service';
import { OdontologoService } from '../../../../services/odontologo.service';
import { Paciente } from '../../../../core/models/paciente';
import { Odontologo } from '../../../../core/models/odontologo';
import { Cita } from '../../../../core/models/cita';

@Component({
  selector: 'app-formulario-cita',
  templateUrl: './formulario-cita.html',
  styleUrls: ['./formulario-cita.css'],
  standalone: false
})
export class FormularioCitaComponent implements OnInit {
  
  @Output() onGuardar = new EventEmitter<Cita>();
  @Output() onCancelar = new EventEmitter<void>();

  formCita: FormGroup;
  pacienteSeleccionado: Paciente | null = null;
  odontologos: Odontologo[] = [];
  cargando = false;
  mensajeError = '';

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private odontologoService: OdontologoService
  ) {
    this.formCita = this.fb.group({
      odontologoId: ['', Validators.required],
      fechaCita: ['', Validators.required],
      horaCita: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.cargarOdontologos();
  }

  cargarOdontologos(): void {
    this.odontologoService.listar().subscribe({
      next: (data) => this.odontologos = data,
      error: (err) => console.error('Error cargando odontólogos', err)
    });
  }

  // Método que recibe el paciente desde el componente hijo BusquedaPaciente
  recibirPaciente(paciente: Paciente): void {
    this.pacienteSeleccionado = paciente;
    this.mensajeError = '';
  }

  guardarCita(): void {
    if (!this.pacienteSeleccionado) {
      this.mensajeError = 'Debes buscar y seleccionar un paciente primero.';
      return;
    }

    if (this.formCita.invalid) {
      this.formCita.markAllAsTouched();
      return;
    }

    this.cargando = true;
    
    // Construimos el objeto Cita según tu modelo
    const nuevaCita: Cita = {
      // El ID lo genera la BD (serial)
      citaId: 0, 
      pacienteId: this.pacienteSeleccionado.pacienteId,
      odontologoId: +this.formCita.value.odontologoId,
      fechaCita: this.formCita.value.fechaCita, // string 'YYYY-MM-DD'
      horaCita: this.formCita.value.horaCita,   // string 'HH:mm'
      motivo: this.formCita.value.motivo,
      estado: 'Pendiente' // Estado inicial por defecto
    };

    this.citaService.crear(nuevaCita).subscribe({
      next: (citaCreada) => {
        this.cargando = false;
        this.onGuardar.emit(citaCreada);
        this.resetearFormulario(); // <--- Ahora sí existe este método
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = 'Ocurrió un error al agendar la cita. Verifica la disponibilidad.';
        console.error(err);
      }
    });
  }

  cancelar(): void {
    this.onCancelar.emit();
    this.resetearFormulario(); // <--- Llamada al método corregido
  }

  // --- MÉTODO AGREGADO ---
  resetearFormulario(): void {
    this.formCita.reset();           // Limpia los inputs del reactive form
    this.pacienteSeleccionado = null; // Deselecciona el paciente
    this.mensajeError = '';           // Borra mensajes de error previos
    this.cargando = false;            // Asegura que no quede el spinner pegado
  }
}