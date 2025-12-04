import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { PacienteService } from '../../../../services/paciente.service';
import { Paciente } from '../../../../core/models/paciente';
import { HttpErrorResponse } from '@angular/common/http';

// Define la longitud mínima del DNI para evitar búsquedas incompletas al backend
const DNI_MIN_LENGTH = 8; 

@Component({
  selector: 'app-busqueda-paciente',
  templateUrl: './busqueda-paciente.html',
  styleUrls: ['./busqueda-paciente.css'],
  standalone: false
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
        // Validación inicial: Si no hay término o es muy corto, limpia y no busca.
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
    this.resultados = []; // Limpiar resultados anteriores antes de la nueva búsqueda

    const esNumero = /^\d+$/.test(termino);

    if (esNumero) {
      // 🚨 CORRECCIÓN CLAVE: Validar longitud mínima para la búsqueda por DNI
      if (termino.length < DNI_MIN_LENGTH) {
        console.log(`DNI incompleto. Se requieren ${DNI_MIN_LENGTH} dígitos.`);
        this.cargando = false;
        return; // Detiene la ejecución y evita el 404
      }

      // Buscar por DNI (completo)
      this.pacienteService.buscarPorDni(termino).subscribe({
        next: (paciente) => {
          this.resultados = paciente ? [paciente] : [];
          this.cargando = false;
        },
        // 🚨 Manejo de error: 404 Not Found (Paciente no encontrado)
        error: (err: HttpErrorResponse) => {
          // Si el servidor devuelve 404 (no encontrado), simplemente limpiamos los resultados.
          if (err.status === 404) {
             console.log(`Paciente con DNI ${termino} no encontrado.`);
          } else {
             console.error('Error al buscar paciente por DNI:', err);
          }
          this.resultados = [];
          this.cargando = false;
        }
      });
    } else {
      // Buscar por nombre (o cualquier otro campo si el backend lo permite)
      // Nota: Aquí se mantiene la lógica de filtrar la lista completa por nombre o DNI parcial.
      this.pacienteService.listar().subscribe({
        next: (lista) => {
          const terminoLower = termino.toLowerCase();
          this.resultados = lista.filter(p => {
            const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
            const dni = p.usuario?.documentoIdentidad || '';
            
            // Permite búsqueda por nombre o por cualquier parte del DNI/nombre
            return nombreCompleto.includes(terminoLower) || dni.includes(termino);
          });
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al buscar paciente por nombre/listado:', err);
          this.resultados = [];
          this.cargando = false;
        }
      });
    }
  }

  seleccionar(paciente: Paciente): void {
    this.pacienteSeleccionado.emit(paciente);
    
    // Obtener el DNI para mostrarlo en el input
    const dni = paciente.usuario?.documentoIdentidad || 'Sin DNI';
    const textoSeleccion = `${paciente.nombre} ${paciente.apellido} (DNI: ${dni})`;
    
    // Establecer el valor sin emitir un evento (para evitar que se dispare otra búsqueda)
    this.searchControl.setValue(textoSeleccion, { emitEvent: false });
    
    // Ocultar resultados después de la selección
    this.resultados = [];
    this.busquedaRealizada = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}