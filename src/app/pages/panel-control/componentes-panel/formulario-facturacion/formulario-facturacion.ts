import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Factura } from '../../../../core/models/facturacion'; // Ajusta la ruta a tu modelo
import { CitaService } from '../../../../services/cita.service';
import { Cita } from '../../../../core/models/cita';

@Component({
  selector: 'app-formulario-facturacion',
  templateUrl: './formulario-facturacion.html',
  styleUrls: ['./formulario-facturacion.css'],
  standalone: false
})
export class FormularioFacturacionComponent implements OnInit {
  @Input() factura: Factura | null = null; // Si viene, es edición
  @Input() visible: boolean = false;
  
  @Output() onGuardar = new EventEmitter<any>();
  @Output() onCancelar = new EventEmitter<void>();

  form: FormGroup;
  citasPendientes: Cita[] = [];
  cargando = false;

  private fb = inject(FormBuilder);
  private citaService = inject(CitaService);

  constructor() {
    this.form = this.fb.group({
      citaId: ['', Validators.required],
      montoTotal: [0, [Validators.required, Validators.min(0)]],
      estadoPago: ['Pendiente', Validators.required],
      tipoComprobante: ['Boleta', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarCitas();
    
    if (this.factura) {
      // Modo Edición
      this.form.patchValue({
        citaId: this.factura.pacienteId, // Ojo: aquí deberías mapear según tu lógica de negocio (cita vs paciente)
        montoTotal: this.factura.montoTotal,
        estadoPago: this.factura.estadoPago,
        tipoComprobante: this.factura.tipoComprobante
      });
      // Si editas, tal vez bloqueas cambiar la cita/paciente
      this.form.get('citaId')?.disable();
    }
  }

  cargarCitas(): void {
    // Cargar citas para asociar la factura (idealmente solo las que no tienen factura)
    this.citaService.listar().subscribe(citas => {
      this.citasPendientes = citas; 
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    this.onGuardar.emit({ ...this.factura, ...datos });
    this.cerrar();
  }

  cerrar(): void {
    this.onCancelar.emit();
    this.form.reset();
  }
}