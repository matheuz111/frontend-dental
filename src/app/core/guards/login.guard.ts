import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    const rol = authService.rolUsuario();
    
    // Redirigir inteligentemente según el rol
    if (rol?.toUpperCase() === 'PACIENTE') {
      return router.createUrlTree(['/portal/inicio']);
    } else {
      return router.createUrlTree(['/panel/inicio']);
    }
  }

  return true; // Si NO está logueado, deja ver el login
};