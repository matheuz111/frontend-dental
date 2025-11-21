import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- Soluciona el error de *ngIf y *ngFor
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <--- Soluciona el error de [formGroup]
import { FullCalendarModule } from '@fullcalendar/angular';

import { PanelControlRoutingModule } from '../panel-control/panel-control.routes';

// Componentes
import { LayoutComponent } from './componentes-panel/layout/layout';
import { BusquedaPacienteComponent } from './componentes-panel/busqueda-paciente/busqueda-paciente'; // <--- Soluciona 'app-busqueda-paciente is not a known element'
import { DialogoConfirmacionComponent } from './componentes-panel/dialogo-confirmacion/dialogo-confirmacion';
import { DialogoPrevisualizacionComponent } from './componentes-panel/dialogo-previsualizacion/dialogo-previsualizacion';
import { FormularioCitaComponent } from './componentes-panel/formulario-cita/formulario-cita';

// Páginas
import { CalendarioCitasComponent } from './paginas-panel/calendario-citas/calendario-citas';
import { InicioComponent } from './paginas-panel/inicio/inicio';
import { GestionPacientesComponent } from './paginas-panel/gestion-pacientes/gestion-pacientes';
import { GestionOdontologosComponent } from './paginas-panel/gestion-odontologos/gestion-odontologos';
import { GestionUsuariosComponent } from './paginas-panel/gestion-usuarios/gestion-usuarios';
import { GestionFacturacionComponent } from './paginas-panel/gestion-facturacion/gestion-facturacion';
import { MiPerfilComponent } from './paginas-panel/mi-perfil/mi-perfil';
import { HistoriaClinicaComponent } from './paginas-panel/historia-clinica/historia-clinica';
import { GestionConfiguracionComponent } from './paginas-panel/gestion-configuracion/gestion-configuracion';

@NgModule({
  declarations: [
    LayoutComponent,
    BusquedaPacienteComponent, // <--- ¡Debe estar aquí!
    DialogoConfirmacionComponent,
    DialogoPrevisualizacionComponent,
    FormularioCitaComponent,,
    GestionFacturacionComponent, // Declarar página
    FormularioConsultaComponent,
    FormularioFacturacionComponent, // Declarar formulario
    TablaGenericaComponent, // Declarar tabla si es parte de este módulo o importarla si es standalone
    FormularioOdontologoComponent, // <--- Agregar a declarations
    GestionOdontologosComponent,    // <--- Verificar que esté aquí
    GestionPacientesComponent,   // <--- Agregar aquí
    FormularioPacienteComponent, // <--- Agregar aquí
    FormularioUsuarioComponent, // <--- Agregar
    GestionUsuariosComponent,   // <--- Agregar/Verificar
    HistoriaClinicaComponent,
    // Páginas
    CalendarioCitasComponent,
    InicioComponent,
    GestionPacientesComponent,
    GestionOdontologosComponent,
    GestionUsuariosComponent,
    GestionFacturacionComponent,
    MiPerfilComponent,
    HistoriaClinicaComponent,
    GestionConfiguracionComponent
  ],
  imports: [
    CommonModule,        // Vital para directivas de Angular
    ReactiveFormsModule, // Vital para tus formularios
    FormsModule,
    PanelControlRoutingModule,
    FullCalendarModule
  ],
  exports: [
    FormularioCitaComponent // Opcional, solo si lo usas fuera de este módulo
  ]
})
export class PanelControlModule { }