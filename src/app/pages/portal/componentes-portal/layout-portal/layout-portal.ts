import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; 
import { Navbar } from '../../../../core/components/navbar/navbar'; 
import { Footer } from '../../../../core/components/footer/footer'; 

@Component({
  selector: 'app-layout-portal',
  standalone: true,
  imports: [
    RouterModule, // Permite cargar las páginas internas
    Navbar,       // Muestra el menú superior
    Footer        // Muestra el pie de página
  ],
  templateUrl: './layout-portal.html',
  styleUrl: './layout-portal.css',
})
export class LayoutPortal { }