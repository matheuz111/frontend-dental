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

// 1. AGREGAMOS EL CAMPO 'id' A LA INTERFAZ DEL TOKEN
interface DecodedToken {
  sub: string;
  rol: string;
  exp: number;
  id?: number;        // <--- NUEVO: Esperamos que el backend mande el ID
  userId?: number;    // (Opcional) A veces se llama userId
  nombres?: string;
  apellidos?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals globales
  usuarioLogueado = signal<boolean>(false);
  rolUsuario = signal<string>('');
  
  // 2. AGREGAMOS LA SEÑAL PARA EL ID
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
    this.usuarioLogueado.set(false);
    this.rolUsuario.set('');
    this.usuarioId.set(0); // Limpiamos el ID
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

  private procesarToken(token: string): void {
    try {
      const payload: DecodedToken = jwtDecode(token);
      
      this.usuarioLogueado.set(true);
      this.rolUsuario.set(payload.rol || '');
      
      // 3. CAPTURAMOS EL ID DEL TOKEN
      // Intentamos leer 'id' o 'userId', si no viene, ponemos 0
      const idCapturado = payload.id || payload.userId || 0;
      this.usuarioId.set(Number(idCapturado));
      
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