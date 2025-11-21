import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';
import { Factura, Pago } from '../core/models/facturacion';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private apiUrl = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) { }

  generarFactura(factura: Factura): Observable<Factura> {
    return this.http.post<Factura>(this.apiUrl, factura);
  }

  obtenerPendientes(pacienteId: number): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}/pendientes/paciente/${pacienteId}`);
  }

  registrarPago(pago: Pago): Observable<Pago> {
    return this.http.post<Pago>(`${environment.apiUrl}/pagos`, pago);
  }
}