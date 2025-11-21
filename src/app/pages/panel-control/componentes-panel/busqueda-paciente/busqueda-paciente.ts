import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { PacienteService } from '../../../../services/paciente.service';
import { Paciente } from '../../../../core/models/paciente';

@Component({
  selector: 'app-busqueda-paciente',
  templateUrl: './busqueda-paciente.html',
  styleUrls: ['./busqueda-paciente.css']
})
export class BusquedaPacienteComponent implements OnInit, OnDestroy {
  
  @Output() pacienteSeleccionado = new EventEmitter<Paciente>();

  searchControl = new FormControl('');
  resultados: Paciente[] = [];
  cargando = false;
  busquedaRealizada = false;

  private destroy$ = new Subject<void>();

  constructor(private pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(termino => {
        if (!termino || termino.length < 3) {
          this.resultados = [];
          this.busquedaRealizada = false;
          return false;
        }
        return true;
      }),
      takeUntil(this.destroy$)
    ).subscribe(termino => {
      if (termino) {
        this.buscar(termino);
      }
    });
  }

  buscar(termino: string): void {
    this.cargando = true;
    this.busquedaRealizada = true;

    const esNumero = /^\d+$/.test(termino);

    if (esNumero) {
      // Buscar por DNI
      this.pacienteService.buscarPorDni(termino).subscribe({
        next: (paciente) => {
          this.resultados = paciente ? [paciente] : [];
          this.cargando = false;
        },
        error: () => {
          this.resultados = [];
          this.cargando = false;
        }
      });
    } else {
      // Buscar por nombre (filtro local si el backend no tiene endpoint específico)
      this.pacienteService.listar().subscribe({
        next: (lista) => {
          const terminoLower = termino.toLowerCase();
          this.resultados = lista.filter(p => {
            const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
            return nombreCompleto.includes(terminoLower) ||
                   (p.documentoIdentidad && p.documentoIdentidad.includes(termino));
          });
          this.cargando = false;
        },
        error: () => {
          this.resultados = [];
          this.cargando = false;
        }
      });
    }
  }

  seleccionar(paciente: Paciente): void {
    this.pacienteSeleccionado.emit(paciente);
    
    // Mostrar el paciente seleccionado en el input
    const textoSeleccion = `${paciente.nombre} ${paciente.apellido} (DNI: ${paciente.documentoIdentidad || 'Sin DNI'})`;
    this.searchControl.setValue(textoSeleccion, { emitEvent: false });
    
    // Ocultar resultados
    this.resultados = [];
    this.busquedaRealizada = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}