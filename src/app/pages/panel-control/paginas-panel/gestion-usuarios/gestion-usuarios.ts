import { Component, OnInit, inject } from '@angular/core';
import { UsuarioService } from '../../../../services/usuario.service';
import { UserProfile } from '../../../../core/models/usuario';
// Importar ColumnConfig desde la ubicación correcta
import { ColumnConfig } from '../../../../shared/tabla-generica/tabla-generica';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.html',
  styleUrls: ['./gestion-usuarios.css'],
  standalone: false 
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
      next: (data: any[]) => {
        console.log('Respuesta API Usuarios:', data); 
        
        this.usuarios = data.map(u => {
          return {
            ...u,
            // Mapeo robusto para Nombres/Apellidos
            nombres: u.nombres || u.nombre || '',
            apellidos: u.apellidos || u.apellido || '',
            email: u.email || u.correo || '',
            
            // --- CORRECCIÓN CLAVE AQUÍ ---
            // El backend Java envía "nombreRol", aquí lo atrapamos correctamente
            rol: (typeof u.rol === 'object' && u.rol !== null) 
                  ? (u.rol.nombreRol || u.rol.nombre || u.rol.name || 'Sin Rol') 
                  : (u.rol || 'Sin Rol'),
            
            // Aseguramos el ID correcto para la edición
            usuarioId: u.usuarioId || u.id
          };
        });
      },
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
    // Usamos usuarioId o id según lo que venga del formulario
    const id = datos.usuarioId || datos.id;

    if (id) {
      // Actualizar
      this.usuarioService.actualizar(id, datos).subscribe(() => {
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
    // Verificación segura del ID antes de eliminar
    if (this.usuarioAEliminar) {
      const id = this.usuarioAEliminar.usuarioId || (this.usuarioAEliminar as any).id;
      
      if (id) {
        this.usuarioService.eliminar(id).subscribe(() => {
          this.cargarUsuarios();
          this.mostrarConfirmacion = false;
          this.usuarioAEliminar = null;
        });
      }
    }
  }
}