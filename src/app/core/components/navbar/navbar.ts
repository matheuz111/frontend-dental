import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AutenticacionService } from '../../../services/autenticacion.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AutenticacionService);
  private router = inject(Router);

  // Datos del usuario para mostrar en el menú
  usuarioLogueado = this.authService.usuarioLogueado;
  nombreUsuario = this.authService.nombreUsuario;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/authentication/login']);
  }
}