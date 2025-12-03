import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Necesario para <router-outlet>
import { Navbar } from '../../../../core/components/navbar/navbar'; // Importa el componente Navbar
import { Footer } from '../../../../core/components/footer/footer'; // Importa el componente Footer

@Component({
  selector: 'app-layout-portal',
  standalone: true, // Asegúrate de que esto esté presente
  imports: [
    RouterModule,
    Navbar,
    Footer
  ],
  templateUrl: './layout-portal.html',
  styleUrl: './layout-portal.css',
})
export class LayoutPortal {

}