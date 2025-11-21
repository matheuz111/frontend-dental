import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, filter, map } from 'rxjs';
import { PacienteService } from '../../../../services/paciente.service';
import { Paciente } from '../../../../core/models/paciente';

@Component({
  selector: 'app-busqueda-paciente',
  templateUrl: './busqueda-paciente.html',
  styleUrls: ['./busqueda-paciente.css'] // Opcional si tienes estilos
})
export class BusquedaPacienteComponent implements OnInit, OnDestroy {
  
  // Emite el paciente seleccionado al padre
  @Output() pacienteSeleccionado = new EventEmitter<Paciente>();

  searchControl = new FormControl('');
  resultados: Paciente[] = [];
  cargando = false;
  busquedaRealizada = false; // Para mostrar "No se encontraron resultados"

  private destroy$ = new Subject<void>();

  constructor(private pacienteService: PacienteService) {}

  ngOnInit(): void {
    // Configuración del buscador reactivo
    this.searchControl.valueChanges.pipe(
      debounceTime(500), // Espera 500ms a que el usuario deje de escribir
      distinctUntilChanged(), // Evita búsquedas si el texto es igual al anterior
      filter(termino => {
        // Si limpias el input, limpiamos resultados
        if (!termino || termino.length < 3) {
          this.resultados = [];
          this.busquedaRealizada = false;
          return false;
        }
        return true;
      }),
      takeUntil(this.destroy$) // Limpieza de memoria
    ).subscribe(termino => {
      this.buscar(termino!);
    });
  }

  buscar(termino: string): void {
    this.cargando = true;
    this.busquedaRealizada = true;

    // Aquí decidimos si buscar por DNI o listar y filtrar
    // Opción A: Si tu backend tiene un endpoint de búsqueda flexible
    // Opción B: Usamos buscarPorDni si parece un número, o listar (menos eficiente si son muchos)
    
    // Asumiremos que el servicio tiene un método genérico o usamos la lógica aquí
    // Por ahora usaré buscarPorDni si es numérico, o implementaremos filtro manual (esto depende de tu backend)
    
    const esNumero = /^\d+$/.test(termino);

    if (esNumero) {
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
      // Si busca por nombre, idealmente el backend debe filtrar. 
      // Si no, traemos todos y filtramos (SOLO SI SON POCOS PACIENTES)
      // Simularemos que listamos todo:
      this.pacienteService.listar().subscribe({
        next: (lista) => {
          this.resultados = lista.filter(p => 
            (p.nombre + ' ' + p.apellido).toLowerCase().includes(termino.toLowerCase())
          );
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
    this.searchControl.setValue(`${paciente.nombre} ${paciente.apellido} (DNI: ${paciente.dni || 'S/D'})`, { emitEvent: false });
    this.resultados = []; // Ocultar lista tras seleccionar
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}