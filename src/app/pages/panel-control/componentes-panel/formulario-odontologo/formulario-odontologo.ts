import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Odontologo } from '../../../../core/models/odontologo';

@Component({
  selector: 'app-formulario-odontologo',
  templateUrl: './formulario-odontologo.html',
  styleUrls: ['./formulario-odontologo.css'],
  standalone: false
})
export class FormularioOdontologoComponent implements OnInit, OnChanges {
  @Input() odontologo: Odontologo | null = null; 
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
    if (changes['odontologo']) {
      this.inicializarFormulario();
    }
  }

  inicializarFormulario() {
    this.isEdit = !!this.odontologo;
    const data = this.odontologo as any;

    this.form = this.fb.group({
      // Datos Raíz (Odontólogo)
      nombre: [data?.nombre || '', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: [data?.apellido || '', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: [data?.email || '', [Validators.required, Validators.email]],
      telefono: [data?.telefono || '', [Validators.required]],
      especialidad: [data?.especialidad || '', [Validators.required]],

      // Datos Anidados (Usuario) - El DNI/Login suele ser el teléfono o un campo específico
      // En tu caso parece que OdontologoService usa el teléfono como DNI login por defecto al crear,
      // pero si quieres editar el usuario asociado, accedemos a él aquí:
      documentoIdentidad: [data?.usuario?.documentoIdentidad || '', [Validators.required]],
      
      password: [''] 
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const dataOriginal = this.odontologo as any;

    const payload = {
      id: dataOriginal?.id,
      
      // Campos Raíz
      nombre: val.nombre,
      apellido: val.apellido,
      email: val.email,
      telefono: val.telefono,
      especialidad: val.especialidad,
      
      // Objeto Usuario
      usuario: {
        id: dataOriginal?.usuario?.id,
        documentoIdentidad: val.documentoIdentidad,
        password: val.password || undefined
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