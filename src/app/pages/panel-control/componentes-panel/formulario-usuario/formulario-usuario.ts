import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfile } from '../../../../core/models/usuario';
import { Rol } from '../../../../core/models/rol';

@Component({
  selector: 'app-formulario-usuario',
  templateUrl: './formulario-usuario.html',
  styleUrls: ['./formulario-usuario.css'],
  standalone: false
})
export class FormularioUsuarioComponent implements OnInit, OnChanges {
  @Input() usuario: UserProfile | null = null; 
  @Input() visible: boolean = false;
  
  @Output() onGuardar = new EventEmitter<any>();
  @Output() onCancelar = new EventEmitter<void>();

  form!: FormGroup;
  rolesDisponibles = Object.values(Rol);
  private fb = inject(FormBuilder);
  isEdit: boolean = false;

  constructor() {
    this.inicializarFormulario();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario']) {
      this.inicializarFormulario();
    }
  }

  inicializarFormulario() {
    this.isEdit = !!this.usuario;
    const data = this.usuario as any;

    this.form = this.fb.group({
      // Ahora el backend SI enviará 'nombre' y 'apellido' en el objeto Usuario
      nombres: [data?.nombres || data?.nombre || '', Validators.required],
      apellidos: [data?.apellidos || data?.apellido || '', Validators.required],
      
      documentoIdentidad: [{ value: data?.documentoIdentidad || '', disabled: this.isEdit }, [Validators.required, Validators.minLength(8)]], 
      
      email: [data?.email || '', [Validators.required, Validators.email]],
      rol: [data?.rol || Rol.RECEPCIONISTA, Validators.required],
      password: [''] 
    });

    const passControl = this.form.get('password');
    if (!this.isEdit) {
      passControl?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      passControl?.clearValidators();
    }
    passControl?.updateValueAndValidity();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue(); 
    const dataOriginal = this.usuario as any;
    
    const usuarioFinal = {
      id: dataOriginal?.usuarioId || dataOriginal?.id, // ID para el PUT

      // Enviamos nombres/apellidos que ahora el UsuarioController espera
      nombres: val.nombres,
      apellidos: val.apellidos,
      email: val.email,
      documentoIdentidad: val.documentoIdentidad,
      rol: val.rol,
      password: val.password || undefined 
    };

    this.onGuardar.emit(usuarioFinal);
    this.cerrar();
  }

  cerrar(): void {
    this.onCancelar.emit();
    this.form.reset();
  }
}