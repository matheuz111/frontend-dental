import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es'; // Para español

import { CitaService } from '../../../../services/cita.service';
import { FormularioCitaComponent } from '../../componentes-panel/formulario-cita/formulario-cita';

@Component({
  selector: 'app-calendario-citas',
  templateUrl: './calendario-citas.html',
  styleUrls: ['./calendario-citas.css']
})
export class CalendarioCitasComponent implements OnInit {
  
  @ViewChild(FormularioCitaComponent) formularioCita!: FormularioCitaComponent;

  mostrarModalCreacion = false;
  eventosCalendario: any[] = [];

  // Configuración de FullCalendar
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale, // Idioma español
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    weekends: true,
    editable: false, // No arrastrar por ahora
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    // Manejadores de eventos
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: [] // Se llenará dinámicamente
  };

  constructor(private citaService: CitaService) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.citaService.listar().subscribe({
      next: (citas) => {
        // Transformamos tus citas (backend) al formato de FullCalendar
        this.eventosCalendario = citas.map(cita => ({
          id: cita.citaId.toString(),
          title: `${cita.paciente?.nombre} ${cita.paciente?.apellido} - ${cita.motivo}`,
          // Combinamos fecha y hora para el inicio: '2023-11-20T14:30:00'
          start: `${cita.fechaCita}T${cita.horaCita}`, 
          // Color según estado (opcional)
          backgroundColor: this.getColorEstado(cita.estado),
          borderColor: this.getColorEstado(cita.estado),
          extendedProps: {
            odontologo: cita.odontologo?.nombre,
            estado: cita.estado
          }
        }));
        
        // Actualizamos las opciones del calendario
        this.calendarOptions.events = this.eventosCalendario;
      },
      error: (err) => console.error('Error al cargar citas', err)
    });
  }

  // Al hacer clic en un día o hueco vacío
  handleDateSelect(selectInfo: DateSelectArg) {
    this.mostrarModalCreacion = true;
    
    // Pequeño timeout para asegurar que el formulario se renderice antes de setear valores
    setTimeout(() => {
      if (this.formularioCita) {
        // Pre-llenamos la fecha seleccionada en el formulario
        this.formularioCita.formCita.patchValue({
          fechaCita: selectInfo.startStr.split('T')[0], // Solo la parte YYYY-MM-DD
          horaCita: selectInfo.startStr.includes('T') ? selectInfo.startStr.split('T')[1].substring(0, 5) : ''
        });
      }
    }, 100);
  }

  // Al hacer clic en una cita existente
  handleEventClick(clickInfo: EventClickArg) {
    alert(`Cita de: ${clickInfo.event.title}\nOdontólogo: ${clickInfo.event.extendedProps['odontologo']}`);
    // Aquí podrías abrir otro modal para editar/eliminar
  }

  onCitaGuardada(): void {
    this.mostrarModalCreacion = false;
    this.cargarCitas(); // Recargar para ver la nueva cita
    alert('¡Cita agendada con éxito!');
  }

  cerrarModal(): void {
    this.mostrarModalCreacion = false;
  }

  private getColorEstado(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'confirmada': return '#198754'; // Verde
      case 'pendiente': return '#ffc107'; // Amarillo
      case 'cancelada': return '#dc3545'; // Rojo
      case 'completada': return '#0d6efd'; // Azul
      default: return '#3788d8';
    }
  }
}