import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CitaService } from '../../../../services/cita.service'; // Verifica ruta
import { AutenticacionService } from '../../../..//services/autenticacion.service'; // Verifica ruta
import { Cita } from '../../../../core/models/cita'; // Verifica ruta

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './mis-citas.html',
  styleUrls: ['./mis-citas.css']
})
export class MisCitasComponent implements OnInit {
  
  private citaService = inject(CitaService);
  private authService = inject(AutenticacionService); // Inyección correcta

  citas: Cita[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas() {
    this.loading = true;
    
    // CORRECCIÓN AQUÍ:
    // Leemos el ID directamente de la nueva señal que creamos
    const pacienteId = this.authService.usuarioId(); 
    
    // Validamos que el ID exista (sea mayor a 0)
    if (!pacienteId || pacienteId === 0) {
      console.warn('No se encontró ID de paciente en el token');
      this.loading = false;
      return;
    }

    this.citaService.listar().subscribe({
      next: (data) => {
        // Filtramos usando el ID numérico
        this.citas = data.filter(c => c.paciente?.id === pacienteId || c.pacienteId === pacienteId);
        
        // Ordenamos por fecha
        this.citas.sort((a, b) => {
          const fechaA = new Date(a.fechaCita + 'T' + a.horaCita);
          const fechaB = new Date(b.fechaCita + 'T' + b.horaCita);
          return fechaB.getTime() - fechaA.getTime();
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar citas', err);
        this.loading = false;
      }
    });
  }

  getEstadoClass(estado: string | undefined): string {
    switch (estado?.toUpperCase()) {
      case 'CONFIRMADA': return 'badge-success';
      case 'PENDIENTE': return 'badge-warning';
      case 'CANCELADA': return 'badge-danger';
      case 'COMPLETADA': return 'badge-info';
      default: return 'badge-secondary';
    }
  }
}