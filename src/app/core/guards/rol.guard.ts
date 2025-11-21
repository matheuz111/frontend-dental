import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';

export const rolGuard: CanActivateFn = (route, state) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  // Al ser un Signal, lo ejecutamos como función () para obtener el valor
  const rol = authService.rolUsuario(); 

  // Si el rol existe y NO es PACIENTE, permite el acceso (es Admin, Médico, etc.)
  if (rol && rol !== 'PACIENTE') {
    return true;
  }

  // Si es PACIENTE o no tiene rol, lo mandamos al portal de pacientes
  return router.createUrlTree(['/portal/inicio']);
};