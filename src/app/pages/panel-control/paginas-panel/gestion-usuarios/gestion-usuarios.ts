import { Component, OnInit, inject } from '@angular/core';
import { UsuarioService } from '../../../../services/usuario.service';
import { UserProfile } from '../../../../core/models/usuario';
import { ColumnConfig } from '../../paginas-panel/gestion-facturacion/gestion-facturacion';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.html',
  styleUrls: ['./gestion-usuarios.css']
})
export class GestionUsuariosComponent implements OnInit {
  
  private usuarioService = inject(UsuarioService);

  usuarios: UserProfile[] = [];
  
  // Control de Modales
  mostrarFormulario = false;
  mostrarConfirmacion = false;
  
  usuarioSeleccionado: UserProfile | null = null;
  usuarioAEliminar: UserProfile | null = null;

  // Columnas para Tabla Genérica
  columnas: ColumnConfig[] = [
    { name: 'documentoIdentidad', header: 'Usuario/Doc' },
    { name: 'nombres', header: 'Nombres' },
    { name: 'apellidos', header: 'Apellidos' },
    { name: 'email', header: 'Correo' },
    { name: 'rol', header: 'Rol' }
  ];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.listarTodos().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  // --- Acciones ---

  abrirCrear(): void {
    this.usuarioSeleccionado = null;
    this.mostrarFormulario = true;
  }

  abrirEditar(usuario: UserProfile): void {
    this.usuarioSeleccionado = usuario;
    this.mostrarFormulario = true;
  }

  abrirEliminar(usuario: UserProfile): void {
    this.usuarioAEliminar = usuario;
    this.mostrarConfirmacion = true;
  }

  // --- Guardado ---

  guardarUsuario(datos: any): void {
    if (datos.id) { // O datos.usuarioId según tu modelo
      // Actualizar
      this.usuarioService.actualizar(datos.id, datos).subscribe(() => {
        this.cargarUsuarios();
        this.mostrarFormulario = false;
      });
    } else {
      // Crear
      this.usuarioService.crear(datos).subscribe(() => {
        this.cargarUsuarios();
        this.mostrarFormulario = false;
      });
    }
  }

  confirmarEliminacion(): void {
    if (this.usuarioAEliminar && this.usuarioAEliminar.id) { // Verifica si tu campo ID es 'id' o 'usuarioId'
      this.usuarioService.eliminar(this.usuarioAEliminar.id).subscribe(() => {
        this.cargarUsuarios();
        this.mostrarConfirmacion = false;
        this.usuarioAEliminar = null;
      });
    }
  }
}