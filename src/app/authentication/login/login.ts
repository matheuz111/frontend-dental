import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule, 
  FormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';

// Validador personalizado para comparar contraseñas
export function passwordMatcherValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password');
    const confirmarPassword = formGroup.get('confirmarPassword');

    if (!password || !confirmarPassword || !confirmarPassword.dirty) {
      return null;
    }

    return password.value !== confirmarPassword.value ? { passwordMismatch: true } : null;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule, RouterModule ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  formularioLogin: FormGroup;
  formularioRegistro: FormGroup;

  modo = signal<'login' | 'registro'>('login');
  mensajeError = signal<string>('');
  cargando = signal<boolean>(false);
  recordarme = false;
  mostrarContrasena = false;

  constructor(
    private fb: FormBuilder,
    private authService: AutenticacionService,
    private router: Router
  ) {
    // Formulario de Login
    this.formularioLogin = this.fb.group({
      documentoIdentidad: ['', [Validators.required]], 
      password: ['', [Validators.required]]
    });

    // Formulario de Registro
    this.formularioRegistro = this.fb.group({
        nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
        apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
        // Validaciones estrictas para DNI (8 dígitos)
        documentoIdentidad: ['', [
          Validators.required, 
          Validators.minLength(8), 
          Validators.maxLength(8), 
          Validators.pattern('^[0-9]*$')
        ]],
        // Validaciones estrictas para Teléfono (9 dígitos)
        telefono: ['', [
          Validators.required, 
          Validators.minLength(9), 
          Validators.maxLength(9), 
          Validators.pattern('^[0-9]*$')
        ]],
        email: ['', [Validators.required, Validators.email]],
        direccion: ['', [Validators.required]],
        fechaNacimiento: ['', [Validators.required]],
        genero: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmarPassword: [''] 
    }, { validators: passwordMatcherValidator() });
  }

  ngOnInit(): void {
    const recordarmeGuardado = localStorage.getItem('recordarme');
    this.recordarme = recordarmeGuardado ? JSON.parse(recordarmeGuardado) : false;
    if (this.recordarme) {
      const docRecordado = localStorage.getItem('documentoRecordado') || '';
      this.formularioLogin.get('documentoIdentidad')?.setValue(docRecordado);
    }
  }

  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  cambiarModo(): void {
    this.modo.set(this.modo() === 'login' ? 'registro' : 'login');
    this.mensajeError.set('');
    this.formularioLogin.reset();
    this.formularioRegistro.reset();
  }

  enviarFormulario(): void {
    this.mensajeError.set('');
    this.cargando.set(true);

    const manejarRedireccion = () => {
      const rol = this.authService.rolUsuario();
      if (rol === 'ROL_PACIENTE') {
        this.router.navigate(['/portal-paciente']);
      } else if (rol === 'ROL_ADMIN' || rol === 'ROL_ODONTOLOGO') {
        this.router.navigate(['/panel-admin']);
      } else {
        this.router.navigate(['/']);
      }
    };

    if (this.modo() === 'login') {
      if (this.formularioLogin.invalid) {
        this.formularioLogin.markAllAsTouched();
        this.cargando.set(false);
        return;
      }
      
      const { documentoIdentidad, password } = this.formularioLogin.value;
      
      this.authService.login(documentoIdentidad, password).subscribe({
        next: () => {
          if (this.recordarme) {
            localStorage.setItem('documentoRecordado', documentoIdentidad);
            localStorage.setItem('recordarme', JSON.stringify(true));
          } else {
            localStorage.removeItem('documentoRecordado');
            localStorage.removeItem('recordarme');
          }
          manejarRedireccion();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError.set(err.message || 'Credenciales incorrectas o error de conexión.');
          this.cargando.set(false);
        }
      });

    } else { // Modo Registro
      if (this.formularioRegistro.invalid) {
        this.formularioRegistro.markAllAsTouched();
        this.cargando.set(false);
        return;
      }

      // Excluimos confirmarPassword antes de enviar al backend
      const { confirmarPassword, ...registroData } = this.formularioRegistro.value;

      this.authService.register(registroData).subscribe({
        next: () => {
          this.modo.set('login');
          this.mensajeError.set('¡Registro exitoso! Por favor, inicia sesión.');
          this.cargando.set(false);
        }, 
        error: (err) => {
          this.mensajeError.set(err.message || 'Error en el registro.');
          this.cargando.set(false);
        }
      });
    }
  }

  get loginCtls() {
    return this.formularioLogin.controls;
  }

  get registroCtls() {
    return this.formularioRegistro.controls;
  }
}