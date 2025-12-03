// src/app/pages/portal/portal.routes.ts
import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { 
        path: 'inicio', 
        loadComponent: () => import('./paginas-portal/inicio-portal/inicio-portal').then(c => c.InicioPortal) 
      },
      // Aquí agregarás más rutas como 'mis-citas', 'mi-perfil' más adelante
    ]
  }
];

