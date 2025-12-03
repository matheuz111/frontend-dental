import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';
import { loginGuard } from './core/guards/login.guard';

const routes: Routes = [
  { path: '', redirectTo: 'authentication/login', pathMatch: 'full' },
  
  {
    path: 'authentication',
    loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule),
    canActivate: [loginGuard] 
  },
  {
    path: 'panel',
    loadChildren: () => import('./pages/panel-control/panel-control.module').then(m => m.PanelControlModule),
    // Este guard está bien para el panel porque bloquea a los pacientes
    canActivate: [authGuard, rolGuard] 
  },
  
  // 👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 👇
  {
    path: 'portal',
    // Asegúrate de que este archivo exista (lo creamos en el paso anterior)
    loadChildren: () => import('./pages/portal/portal.routes').then(m => m.PORTAL_ROUTES),
    // IMPORTANTE: Por ahora quitamos el rolGuard aquí para evitar conflictos 
    // hasta que verifiquemos que el portal carga. Solo dejamos authGuard.
    canActivate: [authGuard] 
  },
  // 👆 FIN DEL CAMBIO 👆

  { path: '**', redirectTo: 'authentication/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }