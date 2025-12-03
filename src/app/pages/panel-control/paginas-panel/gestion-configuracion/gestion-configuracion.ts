import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AutenticacionService } from '../../../../services/autenticacion.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { ChangePasswordPayload } from '../../../../core/models/usuario';

@Component({
  selector: 'app-gestion-configuracion',
  templateUrl: './gestion-configuracion.html',
  styleUrls: ['./gestion-configuracion.css'],
  standalone: false
})
export class GestionConfiguracionComponent implements OnInit {
  private fb = inject(FormBuilder);
  public authService = inject(AutenticacionService); // Público para usar en HTML
  private usuarioService = inject(UsuarioService);

  formPassword!: FormGroup;
  cargando = false;
  mensajeExito = '';
  mensajeError = '';
  
  // Control de visibilidad de contraseñas
  verActual = false;
  verNueva = false;
  verConfirmar = false;

  // Datos del usuario para mostrar en la tarjeta
  usuarioActual: any = {
    nombre: '',
    apellido: '',
    rol: '',
    email: '',
    iniciales: ''
  };

  ngOnInit(): void {
    this.initForm();
    this.cargarDatosUsuario();
  }

  initForm(): void {
    this.formPassword = this.fb.group({
      contrasenaActual: ['', Validators.required],
      nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', Validators.required]
    }, { validators: this.checkPasswords });
  }

  cargarDatosUsuario(): void {
    // 1. Rol desde el servicio de autenticación (rápido)
    this.usuarioActual.rol = this.authService.rolUsuario();
    
    // 2. Datos frescos desde el backend
    this.usuarioService.obtenerPerfil().subscribe({
      next: (perfil: any) => {
        // Mapeo flexible
        const nombre = perfil.nombre || perfil.nombres || '';
        const apellido = perfil.apellido || perfil.apellidos || '';
        
        this.usuarioActual.nombre = nombre;
        this.usuarioActual.apellido = apellido;
        this.usuarioActual.email = perfil.email || 'Sin correo';
        
        // Generar iniciales para el avatar
        this.usuarioActual.iniciales = (
          (nombre.charAt(0) || '') + (apellido.charAt(0) || '')
        ).toUpperCase() || 'U';

        // Fallback si todo está vacío
        if (!this.usuarioActual.nombre) {
          this.usuarioActual.nombre = 'Usuario';
          this.usuarioActual.apellido = 'Sistema';
        }
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.usuarioActual.nombre = 'Usuario';
        this.usuarioActual.iniciales = '?';
      }
    });
  }

  checkPasswords(group: FormGroup) {
    const pass = group.get('nuevaContrasena')?.value;
    const confirm = group.get('confirmarContrasena')?.value;
    return pass === confirm ? null : { notSame: true };
  }

  actualizarPassword(): void {
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const payload: ChangePasswordPayload = {
      contrasenaActual: this.formPassword.value.contrasenaActual,
      nuevaContrasena: this.formPassword.value.nuevaContrasena
    };

    this.usuarioService.cambiarContrasena(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.mensajeExito = '¡Contraseña actualizada correctamente!';
        this.formPassword.reset();
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        if (err.status === 400 || err.status === 401) {
          this.mensajeError = 'La contraseña actual es incorrecta.';
        } else {
          this.mensajeError = 'Error al actualizar. Intente más tarde.';
        }
      }
    });
  }

  // Métodos para alternar visibilidad
  toggleVerActual() { this.verActual = !this.verActual; }
  toggleVerNueva() { this.verNueva = !this.verNueva; }
  toggleVerConfirmar() { this.verConfirmar = !this.verConfirmar; }
}