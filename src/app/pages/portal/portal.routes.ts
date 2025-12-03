import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    // Carga el Layout principal (con Navbar y Footer)
    loadComponent: () => import('./componentes-portal/layout-portal/layout-portal').then(m => m.LayoutPortal),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      
      // RUTA 1: Inicio
      { 
        path: 'inicio', 
        loadComponent: () => import('./paginas-portal/inicio-portal/inicio-portal').then(c => c.InicioPortal) 
      },

      // RUTA 2: Mis Citas (¡ESTA ES LA QUE FALTABA!)
      { 
        path: 'mis-citas', 
        loadComponent: () => import('./paginas-portal/mis-citas/mis-citas').then(c => c.MisCitasComponent) 
      },

      // RUTA 3: Agendar Cita (La agregamos de una vez por si la usas)
      {
        path: 'agendar-cita',
        loadComponent: () => import('./paginas-portal/agendar-cita/agendar-cita').then(c => c.AgendarCita)
      },
      {
        path: 'mi-historial',
        loadComponent: () => import('./paginas-portal/mi-historial/mi-historial').then(c => c.MiHistorial)
      }
    ]
  }
];