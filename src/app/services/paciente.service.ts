import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../environments/environments';
import { Paciente } from '../core/models/paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) { }

  /**
   * Listar todos los pacientes
   */
  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  buscarPorUsuarioId(usuarioId: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  /**
   * Obtener un paciente por ID
   */
  obtenerPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  /**
   * Buscar paciente por DNI/Documento de Identidad
   * NOTA: Se modificó el endpoint de /buscar a / para evitar conflictos de rutas en el backend.
   */
  buscarPorDni(dni: string): Observable<Paciente | null> {
    const params = new HttpParams().set('documentoIdentidad', dni);
    
    // Cambiamos el endpoint de 'buscar' a la ruta base 'this.apiUrl'
    return this.http.get<Paciente>(`${this.apiUrl}`, { params }).pipe(
      // Manejamos 404 (Not Found) como una búsqueda sin resultados (null)
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return of(null);
      })
    );
  }

  /**
   * Buscar pacientes por nombre (búsqueda parcial)
   */
  buscarPorNombre(nombre: string): Observable<Paciente[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<Paciente[]>(`${this.apiUrl}/buscar`, { params });
  }

  /**
   * Crear un nuevo paciente
   */
  crear(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, paciente);
  }

  /**
   * Actualizar un paciente existente
   */
  actualizar(id: number, paciente: Partial<Paciente>): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${id}`, paciente);
  }

  /**
   * Eliminar un paciente
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener historial médico del paciente
   */
  obtenerHistorial(pacienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${pacienteId}/historial`);
  }
}