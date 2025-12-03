import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Servicios y Modelos
import { CitaService } from '../../../../services/cita.service';
import { OdontologoService } from '../../../../services/odontologo.service';
import { AutenticacionService } from '../../../../services/autenticacion.service';
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

  form: FormGroup;
  odontologos = signal<Odontologo[]>([]);
  loading = false;
  minDate: string = ''; // Para no permitir fechas pasadas

  constructor() {
    // Configuración del Formulario
    this.form = this.fb.group({
      odontologoId: ['', [Validators.required]],
      fechaCita: ['', [Validators.required]],
      horaCita: ['', [Validators.required]],
      motivo: ['', [Validators.required, Validators.maxLength(255)]]
    });

    // Calcular fecha mínima (hoy)
    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarOdontologos();
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

    this.loading = true;
    const pacienteId = this.authService.usuarioId(); // ID del usuario logueado

    // Construimos el objeto tal cual lo pide Java
    const nuevaCita = {
      pacienteId: pacienteId,
      odontologoId: Number(this.form.value.odontologoId),
      fechaCita: this.form.value.fechaCita,
      horaCita: this.form.value.horaCita, // El input type="time" ya devuelve HH:mm
      motivo: this.form.value.motivo,
      estado: 'PENDIENTE' // Opcional, el backend suele ponerlo por defecto
    };

    this.citaService.crear(nuevaCita).subscribe({
      next: () => {
        alert('¡Cita agendada con éxito!');
        this.loading = false;
        this.router.navigate(['/portal/mis-citas']); // Redirigir a la lista
      },
      error: (err) => {
        console.error('Error al agendar', err);
        alert('Ocurrió un error al agendar la cita. Inténtalo de nuevo.');
        this.loading = false;
      }
    });
  }
}