import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AutenticacionService } from '../../../../services/autenticacion.service';
import { CitaService } from '../../../../services/cita.service';
import { PacienteService } from '../../../../services/paciente.service';
import { Cita } from '../../../../core/models/cita';
import { Paciente } from '../../../../core/models/paciente';

interface ActividadDiaria {
  id: number;
  descripcion: string;
  icono: string;
  completado: boolean;
}

interface Consejo {
  titulo: string;
  contenido: string;
  icono: string;
}

@Component({
  selector: 'app-inicio-portal',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DatePipe, MatCardModule, MatButtonModule,
    MatIconModule, MatDividerModule, MatListModule, MatTooltipModule
  ],
  templateUrl: './inicio-portal.html',
  styleUrls: ['./inicio-portal.css']
})
export class InicioPortal implements OnInit {
  
  // Servicios
  private authService = inject(AutenticacionService);
  private citaService = inject(CitaService);
  private pacienteService = inject(PacienteService);

  // Señales
  nombreUsuario = signal<string>('Paciente'); // Valor por defecto mientras carga
  
  actividadesDiarias = signal<ActividadDiaria[]>([]);
  consejoDelDia = signal<Consejo | null>(null);
  
  // Datos privados
  private citas = signal<Cita[]>([]);
  private pacienteActual = signal<Paciente | null>(null);

  // Computados
  proximaCita = computed(() => {
    const ahora = new Date();
    return this.citas()
      .filter(c => new Date(c.fechaCita + 'T' + c.horaCita) > ahora && c.estado !== 'Cancelada')
      .sort((a, b) => new Date(a.fechaCita).getTime() - new Date(b.fechaCita).getTime())[0];
  });

  progresoActividades = computed(() => {
    const actividades = this.actividadesDiarias();
    if (actividades.length === 0) return 100;
    const completadas = actividades.filter(a => a.completado).length;
    return Math.round((completadas / actividades.length) * 100);
  });

  // Datos para el dashboard (simulados)
  tratamientosPendientes = signal(0);
  pagosPendientes = signal(0);

  private todosLosConsejos: Consejo[] = [
    { titulo: 'La Regla de los 2 Minutos', contenido: 'Cepíllate los dientes durante al menos 2 minutos, dos veces al día.', icono: 'timer' },
    { titulo: 'Hilo Dental Diario', contenido: 'El cepillo no llega a todas partes. Usa hilo dental una vez al día antes de dormir.', icono: 'cleaning_services' },
    { titulo: 'Cambio de Cepillo', contenido: 'Recuerda cambiar tu cepillo de dientes cada 3 meses o cuando las cerdas estén desgastadas.', icono: 'refresh' },
    { titulo: 'Evita el Azúcar', contenido: 'Reduce el consumo de bebidas azucaradas para prevenir la caries dental.', icono: 'no_food' },
    { titulo: 'Visita Regular', contenido: 'Una limpieza profesional cada 6 meses es clave para mantener tu sonrisa brillante.', icono: 'calendar_today' },
  ];

  ngOnInit(): void {
    this.cargarDatosDashboard();
    this.buscarDatosDelPaciente();
  }

 private buscarDatosDelPaciente(): void {
    const usuarioId = this.authService.usuarioId();
    
    // Si no hay ID o es 0, no podemos buscar nada
    if (!usuarioId) return;

    console.log("Buscando ficha para Usuario ID:", usuarioId);

    // CORRECCIÓN: Usamos el método específico en lugar de .listar()
    this.pacienteService.buscarPorUsuarioId(usuarioId).subscribe({
      next: (miPaciente) => {
        console.log("Datos paciente cargados:", miPaciente);
        
        if (miPaciente) {
          // 1. Guardamos el paciente en la señal
          this.pacienteActual.set(miPaciente);
          
          // 2. Actualizamos el nombre que se muestra en el saludo
          // (Si el paciente tiene nombre, úsalo; si no, usa el del token/servicio)
          const nombreAMostrar = miPaciente.nombre || this.authService.nombreUsuario();
          this.nombreUsuario.set(nombreAMostrar);

          // 3. Cargamos las citas de este paciente específico
          if (miPaciente.id) {
            this.cargarCitas(miPaciente.id);
          }
        }
      },
      error: (err) => {
        console.error("Error al buscar datos del paciente:", err);
        // Si da 404, significa que es un usuario nuevo sin ficha médica aún
      }
    });
  }

  private cargarCitas(pacienteId: number): void {
    this.citaService.listar().subscribe({
      next: (todasLasCitas) => {
        // Filtramos las citas de este paciente
        const citasFiltradas = todasLasCitas.filter(c => 
          c.pacienteId === pacienteId || c.paciente?.id === pacienteId
        );
        this.citas.set(citasFiltradas);
      },
      error: (err) => console.error('Error cargando citas', err)
    });
  }
  
  private cargarDatosDashboard(): void {
    this.actividadesDiarias.set([
      { id: 1, descripcion: 'Cepillado Matutino', icono: 'wb_sunny', completado: true },
      { id: 2, descripcion: 'Usar Hilo Dental', icono: 'grid_on', completado: false },
      { id: 3, descripcion: 'Enjuague Bucal', icono: 'water_drop', completado: false },
      { id: 4, descripcion: 'Cepillado Nocturno', icono: 'bedtime', completado: false },
    ]);
    this.consejoDelDia.set(this.todosLosConsejos[Math.floor(Math.random() * this.todosLosConsejos.length)]);
  }

  toggleActividad(id: number): void {
    this.actividadesDiarias.update(actividades => 
      actividades.map(act => 
        act.id === id ? { ...act, completado: !act.completado } : act
      )
    );
  }
}