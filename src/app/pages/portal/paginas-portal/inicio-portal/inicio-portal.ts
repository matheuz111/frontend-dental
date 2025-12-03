import { Component, OnInit, signal, computed, Signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
// Si no tienes Angular Material instalado, usa divs normales o instala los módulos.
// Asumo que tienes Material por el proyecto de referencia, si no, avísame para darte HTML estándar.
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
import { jwtDecode } from 'jwt-decode';

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
  nombreUsuario = signal('');
  proximaCita: Signal<Cita | undefined>;
  
  actividadesDiarias = signal<ActividadDiaria[]>([]);
  progresoActividades: Signal<number>; 
  consejoDelDia = signal<Consejo | null>(null);
  
  // Datos simulados para el dashboard
  tratamientosPendientes = signal(0);
  pagosPendientes = signal(0);
  
  private citas = signal<Cita[]>([]);
  
  // Consejos adaptados a Odontología
  private todosLosConsejos: Consejo[] = [
    { titulo: 'La Regla de los 2 Minutos', contenido: 'Cepíllate los dientes durante al menos 2 minutos, dos veces al día.', icono: 'timer' },
    { titulo: 'Hilo Dental Diario', contenido: 'El cepillo no llega a todas partes. Usa hilo dental una vez al día antes de dormir.', icono: 'cleaning_services' },
    { titulo: 'Cambio de Cepillo', contenido: 'Recuerda cambiar tu cepillo de dientes cada 3 meses o cuando las cerdas estén desgastadas.', icono: 'refresh' },
    { titulo: 'Evita el Azúcar', contenido: 'Reduce el consumo de bebidas azucaradas para prevenir la caries dental.', icono: 'no_food' },
    { titulo: 'Visita Regular', contenido: 'Una limpieza profesional cada 6 meses es clave para mantener tu sonrisa brillante.', icono: 'calendar_today' },
  ];

  constructor(
    private authService: AutenticacionService,
    private citaService: CitaService,
    private pacienteService: PacienteService
  ) {
    // Usamos los signals del Auth Service
    this.nombreUsuario = this.authService.nombreUsuario;

    this.proximaCita = computed(() => {
      const ahora = new Date();
      return this.citas()
        .filter(c => new Date(c.fechaCita + 'T' + c.horaCita) > ahora && c.estado !== 'Cancelada')
        .sort((a, b) => new Date(a.fechaCita).getTime() - new Date(b.fechaCita).getTime())[0];
    });

    this.progresoActividades = computed(() => {
      const actividades = this.actividadesDiarias();
      if (actividades.length === 0) return 100;
      const completadas = actividades.filter(a => a.completado).length;
      return Math.round((completadas / actividades.length) * 100);
    });
  }

  ngOnInit(): void {
    this.cargarDatosDashboard();
    this.obtenerDatosPacienteYCitas();
  }

  private obtenerDatosPacienteYCitas(): void {
    // 1. Decodificamos el token para obtener el DNI (sub)
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const documentoIdentidad = decoded.sub; // Asumiendo que 'sub' es el DNI

        // 2. Buscamos al paciente por DNI para obtener su ID
        if (documentoIdentidad) {
          this.pacienteService.buscarPorDni(documentoIdentidad).subscribe({
            next: (paciente) => {
              if (paciente && paciente.id) {
                // 3. Con el ID, cargamos las citas
                this.cargarCitas(paciente.id);
              }
            },
            error: (err) => console.error('Error buscando paciente', err)
          });
        }
      } catch (e) {
        console.error('Error leyendo token', e);
      }
    }
  }

  private cargarCitas(pacienteId: number): void {
    // Enviamos undefined en fecha y odontologo, y el ID del paciente
    this.citaService.listar(undefined, undefined, pacienteId).subscribe({
      next: (citas) => this.citas.set(citas),
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