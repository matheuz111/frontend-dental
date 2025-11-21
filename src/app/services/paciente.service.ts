import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments'; // Tu ruta correcta
import { Paciente } from '../core/models/paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  // Ajusta la URL base según tu backend (ej. /api/pacientes)
  private apiUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  // Búsqueda por DNI (muy útil para la recepción)
  buscarPorDni(dni: string): Observable<Paciente> {
    const params = new HttpParams().set('dni', dni);
    return this.http.get<Paciente>(`${this.apiUrl}/buscar`, { params });
  }

  crear(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, paciente);
  }

  actualizar(id: number, paciente: Paciente): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${id}`, paciente);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}