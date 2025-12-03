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

// Definimos qué trae nuestro Token por dentro
interface DecodedToken {
  sub: string;
  rol: string;
  exp: number;
  nombres?: string;   // Estos campos ahora vienen del backend
  apellidos?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals globales de usuario
  usuarioLogueado = signal<boolean>(false);
  rolUsuario = signal<string>('');
  nombreUsuario = signal<string>('');
  apellidoUsuario = signal<string>('');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.verificarTokenAlCargar();
  }

  // --- LÓGICA DE LOGIN CORREGIDA ---
  login(documentoIdentidad: string, contrasena: string): Observable<AuthResponse> {
    const payload = { documentoIdentidad, password: contrasena };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(
        tap(response => {
          // 1. Guardar token
          localStorage.setItem('jwt_token', response.token);

          // 2. CORRECCIÓN: Procesar el token INMEDIATAMENTE para extraer nombres/apellidos
          // Antes solo guardabas el rol manual, ahora leemos todo del token nuevo.
          this.procesarToken(response.token);
        })
      );
  }

  register(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registrar`, payload);
  }

  logout() {
    localStorage.removeItem('jwt_token');
    // Limpiar todas las señales
    this.usuarioLogueado.set(false);
    this.rolUsuario.set('');
    this.nombreUsuario.set('');
    this.apellidoUsuario.set('');
    
    this.router.navigate(['/authentication/login']);
  }

  // --- MANEJO DE TOKEN ---

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

  // Esta función es la encargada de leer el JWT y llenar las variables
  private procesarToken(token: string): void {
    try {
      const payload: DecodedToken = jwtDecode(token);
      
      this.usuarioLogueado.set(true);
      this.rolUsuario.set(payload.rol || '');
      
      // Aquí asignamos los datos para el Navbar
      // Si vienen vacíos (undefined), ponemos cadena vacía
      this.nombreUsuario.set(payload.nombres || '');
      this.apellidoUsuario.set(payload.apellidos || '');
      
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