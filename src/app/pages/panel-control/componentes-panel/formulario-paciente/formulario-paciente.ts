import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Paciente } from '../../../../core/models/paciente';

@Component({
  selector: 'app-formulario-paciente',
  templateUrl: './formulario-paciente.html',
  styleUrls: ['./formulario-paciente.css'],
  standalone: false
})
export class FormularioPacienteComponent implements OnInit, OnChanges {
  @Input() paciente: Paciente | null = null; 
  @Input() visible: boolean = false;

  @Output() onGuardar = new EventEmitter<any>();
  @Output() onCancelar = new EventEmitter<void>();

  form!: FormGroup;
  private fb = inject(FormBuilder);
  isEdit: boolean = false;

  constructor() {
    this.inicializarFormulario();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paciente']) {
      this.inicializarFormulario();
    }
  }

  inicializarFormulario() {
    this.isEdit = !!this.paciente;
    const data = this.paciente as any;

    // CORRECCIÓN:
    // - Datos personales (nombre, apellido, email, telefono) vienen en la RAÍZ (data.nombre).
    // - Credenciales (DNI/Usuario) vienen en data.usuario.
    this.form = this.fb.group({
      // Datos Raíz (Paciente)
      nombre: [data?.nombre || '', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: [data?.apellido || '', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      telefono: [data?.telefono || '', [Validators.pattern(/^\d{9,15}$/)]],
      email: [data?.email || '', [Validators.required, Validators.email]],
      genero: [data?.genero || '', Validators.required],
      direccion: [data?.direccion || '', Validators.required],
      fechaNacimiento: [data?.fechaNacimiento || ''],
      alergias: [data?.alergias || ''],

      // Datos Anidados (Usuario)
      // Aquí sí accedemos a .usuario.documentoIdentidad
      documentoIdentidad: [data?.usuario?.documentoIdentidad || '', [Validators.required, Validators.pattern(/^\d{8}$/)]], 
      
      // Password (siempre vacío al editar)
      password: ['']
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const dataOriginal = this.paciente as any;

    // Estructura correcta para el Backend:
    // Datos personales afuera, Usuario adentro.
    const payload = {
      id: dataOriginal?.id, 
      
      // Campos de Paciente (Raíz)
      nombre: val.nombre,
      apellido: val.apellido,
      email: val.email,
      telefono: val.telefono,
      direccion: val.direccion,
      genero: val.genero,
      fechaNacimiento: val.fechaNacimiento,
      alergias: val.alergias,
      
      // Objeto Usuario Relacionado
      usuario: {
        id: dataOriginal?.usuario?.id, 
        documentoIdentidad: val.documentoIdentidad, 
        password: val.password || undefined, // Solo envía password si se escribió algo
        rol: dataOriginal?.usuario?.rol 
      }
    };

    this.onGuardar.emit(payload);
    this.cerrar();
  }

  cerrar(): void {
    this.onCancelar.emit();
    this.form.reset();
  }
}