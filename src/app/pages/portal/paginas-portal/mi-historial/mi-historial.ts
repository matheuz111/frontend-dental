import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { CitaService } from '../../../../services/cita.service';
import { AutenticacionService } from '../../../../services/autenticacion.service';
import { Cita } from '../../../../core/models/cita';

@Component({
  selector: 'app-mi-historial',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './mi-historial.html',
  styleUrls: ['./mi-historial.css']
})
export class MiHistorial implements OnInit {

  private citaService = inject(CitaService);
  private authService = inject(AutenticacionService);

  historial: Cita[] = [];
  loading: boolean = true;
  hoy: Date = new Date();

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.loading = true;
    const pacienteId = this.authService.usuarioId();

    if (!pacienteId) {
      this.loading = false;
      return;
    }

    this.citaService.listar().subscribe({
      next: (data) => {
        // Filtramos citas del paciente que YA PASARON o están COMPLETADAS/CANCELADAS
        this.historial = data.filter(c => {
          const esDelPaciente = c.paciente?.id === pacienteId || c.pacienteId === pacienteId;
          
          // Crear fecha de la cita para comparar
          const fechaCita = new Date(c.fechaCita + 'T' + c.horaCita);
          const yaPaso = fechaCita < this.hoy;
          const estadoFinalizado = ['COMPLETADA', 'CANCELADA', 'ATENDIDO'].includes(c.estado?.toUpperCase() || '');

          return esDelPaciente && (yaPaso || estadoFinalizado);
        });

        // Ordenar: Las más recientes primero
        this.historial.sort((a, b) => {
          const fechaA = new Date(a.fechaCita + 'T' + a.horaCita);
          const fechaB = new Date(b.fechaCita + 'T' + b.horaCita);
          return fechaB.getTime() - fechaA.getTime();
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando historial', err);
        this.loading = false;
      }
    });
  }

  imprimirHistorial() {
    window.print();
  }

  // Helper para mostrar estado con estilo
  getEstadoBadge(estado: string | undefined): string {
    switch (estado?.toUpperCase()) {
      case 'COMPLETADA': case 'ATENDIDO': return 'bg-success';
      case 'CANCELADA': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}