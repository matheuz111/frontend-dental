// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login';

const routes: Routes = [
  // Redirige al login si la ruta está vacía
  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
  
  // Ruta para el login
  { path: 'login', component: LoginComponent },
  
  // (Aquí irán tus otras rutas, ej: dashboard)
  // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }