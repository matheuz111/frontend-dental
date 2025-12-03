import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Servicios y Modelos
import { CitaService } from '../../../../services/cita.service';
import { OdontologoService } from '../../../../services/odontologo.service';
import { AutenticacionService } from '../../../../services/autenticacion.service';
import { PacienteService } from '../../../../services/paciente.service';
import { Odontologo } from '../../../../core/models/odontologo';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './agendar-cita.html',
  styleUrls: ['./agendar-cita.css']
})
export class AgendarCita implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private citaService = inject(CitaService);
  private odontologoService = inject(OdontologoService);
  private authService = inject(AutenticacionService);
  private pacienteService = inject(PacienteService);
form: FormGroup;
  odontologos = signal<Odontologo[]>([]);
  loading = false;
  minDate: string = '';
  
  // Variable para guardar el ID REAL del paciente
  pacienteIdReal: number | null = null; 

  constructor() {
    this.form = this.fb.group({
      odontologoId: ['', [Validators.required]],
      fechaCita: ['', [Validators.required]],
      horaCita: ['', [Validators.required]],
      motivo: ['', [Validators.required, Validators.maxLength(255)]]
    });

    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarOdontologos();
    this.obtenerIdPaciente(); // <--- 3. LLAMAR A LA BÚSQUEDA AL INICIAR
  }

// ... imports

  // --- LÓGICA CORREGIDA ---
  obtenerIdPaciente() {
    const usuarioId = this.authService.usuarioId();
    
    if (usuarioId && usuarioId > 0) {
      // Usamos el nuevo método optimizado
      this.pacienteService.buscarPorUsuarioId(usuarioId).subscribe({
        next: (pacienteEncontrado) => {
          if (pacienteEncontrado) {
            this.pacienteIdReal = pacienteEncontrado.id!;
            console.log('Paciente identificado:', this.pacienteIdReal);
          }
        },
        error: (err) => {
          console.error('Error buscando ficha de paciente:', err);
          // Si da 404 es que el usuario existe pero no se ha creado como paciente aún
          if (err.status === 404) {
             alert('Atención: Tu usuario no tiene una ficha de paciente creada. Contacta a recepción.');
          }
        }
      });
    }
  }

  cargarOdontologos() {
    this.odontologoService.listar().subscribe({
      next: (data) => this.odontologos.set(data),
      error: (err) => console.error('Error cargando odontólogos', err)
    });
  }

  registrarCita() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validación de seguridad
    if (!this.pacienteIdReal) {
      alert('No se ha podido identificar tu usuario como paciente. Recarga la página o contacta soporte.');
      return;
    }

    this.loading = true;

    // Construimos el objeto con el ID CORRECTO
    const nuevaCita = {
      pacienteId: this.pacienteIdReal, // <--- USAMOS EL ID DE LA TABLA PACIENTE
      odontologoId: Number(this.form.value.odontologoId),
      fechaCita: this.form.value.fechaCita,
      horaCita: this.form.value.horaCita,
      motivo: this.form.value.motivo,
      estado: 'PENDIENTE'
    };

    console.log('Enviando cita:', nuevaCita); // Debug

    this.citaService.crear(nuevaCita).subscribe({
      next: () => {
        alert('¡Cita agendada con éxito!');
        this.loading = false;
        this.router.navigate(['/portal/mis-citas']);
      },
      error: (err) => {
        console.error('Error al agendar', err);
        // Mostrar mensaje más amigable
        if(err.status === 500) {
             alert('Error del servidor. Verifica que el horario esté disponible.');
        } else {
             alert('Ocurrió un error al agendar la cita. Inténtalo de nuevo.');
        }
        this.loading = false;
      }
    });
  }
}