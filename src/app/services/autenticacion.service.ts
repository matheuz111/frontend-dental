import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environments';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface AuthResponse {
  token: string;
  rol: string;
}

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  documentoIdentidad: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  genero?: string;
}

// 1. ACTUALIZAMOS LA INTERFAZ DEL TOKEN
interface DecodedToken {
  sub: string;
  rol: string;
  exp: number;
  nombres?: string;
  apellidos?: string;
  id?: number; // <--- ¡IMPORTANTE! El campo ID que envía el backend
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals globales
  usuarioLogueado = signal<boolean>(false);
  rolUsuario = signal<string>('');
  
  // 2. SEÑAL PARA EL ID (Necesaria para buscar al paciente)
  usuarioId = signal<number>(0); 
  
  nombreUsuario = signal<string>('');
  apellidoUsuario = signal<string>('');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.verificarTokenAlCargar();
  }

  login(documentoIdentidad: string, contrasena: string): Observable<AuthResponse> {
    const payload = { documentoIdentidad, password: contrasena };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(
        tap(response => {
          localStorage.setItem('jwt_token', response.token);
          this.procesarToken(response.token);
        })
      );
  }

  register(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registrar`, payload);
  }

  logout() {
    localStorage.removeItem('jwt_token');
    
    // Limpiamos todas las señales al salir
    this.usuarioLogueado.set(false);
    this.rolUsuario.set('');
    this.usuarioId.set(0); // <--- Resetear ID
    this.nombreUsuario.set('');
    this.apellidoUsuario.set('');
    
    this.router.navigate(['/authentication/login']);
  }

  private verificarTokenAlCargar(): void {
    const token = this.getToken();
    if (token) {
      if (this.esTokenExpirado(token)) {
        this.logout();
      } else {
        this.procesarToken(token);
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  estaLogueado(): boolean {
    const token = this.getToken();
    return !!token && !this.esTokenExpirado(token);
  }

  // --- LÓGICA CORREGIDA ---
  private procesarToken(token: string): void {
    try {
      const payload: DecodedToken = jwtDecode(token);
      
      this.usuarioLogueado.set(true);
      this.rolUsuario.set(payload.rol || '');
      this.nombreUsuario.set(payload.nombres || '');
      this.apellidoUsuario.set(payload.apellidos || '');

      // 3. EXTRAER EL ID DEL TOKEN
      // Si existe, lo guardamos. Si no, ponemos 0.
      const idCapturado = payload.id ? Number(payload.id) : 0;
      this.usuarioId.set(idCapturado);
      
      console.log('Token procesado. ID Usuario:', idCapturado); // Debug

    } catch (error) {
      console.error('Error al decodificar token:', error);
      this.logout();
    }
  }

  private esTokenExpirado(token: string): boolean {
    try {
      const payload: DecodedToken = jwtDecode(token);
      if (!payload.exp) return true;
      return (payload.exp * 1000) < Date.now();
    } catch {
      return true;
    }
  }

  recuperarContrasena(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recuperar-contrasena`, { email });
  }
}