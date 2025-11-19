import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environments';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // Necesitarás instalar jwt-decode: npm install jwt-decode

// 1. Interfaz adaptada a tu AuthResponseDTO
interface AuthResponse {
  token: string;
  rol: string; 
}

// Interfaz para el payload de registro (asumiendo campos)
interface RegisterPayload {
  // Aquí deberías poner los campos que espera tu RegistroPacienteDTO
  // Por ejemplo:
  nombre: string;
  apellido: string;
  documentoIdentidad: string;
  email: string;
  password: string;
}

// Token decodificado (puedes ajustarlo según tu JwtUtil)
interface DecodedToken {
  sub: string; // El 'subject' (username/documento)
  rol: string;   // El rol
  exp: number; // Fecha de expiración
}


@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private apiUrl = `${environment.apiUrl}/auth`; //

  usuarioLogueado = signal<boolean>(false);
  rolUsuario = signal<string>('');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.verificarTokenAlCargar();
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

  // 2. Método de Login ADAPTADO
  // Acepta documentoIdentidad en lugar de email
  login(documentoIdentidad: string, contrasena: string): Observable<AuthResponse> {
    // El payload coincide con tu LoginRequestDTO
    const payload = { 
      documentoIdentidad: documentoIdentidad, 
      password: contrasena 
    };
    
    // Apunta al endpoint /api/auth/login
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(
        tap(response => {
          this.manejarRespuestaAutenticacion(response.token);
        })
      );
  }

  // 3. Método de Registro (Ajustar según tu DTO)
  register(payload: RegisterPayload): Observable<any> {
    // Apunta al endpoint /api/auth/registrar
    // Asumimos que también devuelve un token o una respuesta de paciente
    // Lo adaptamos para que también inicie sesión tras registrarse
    return this.http.post<any>(`${this.apiUrl}/registrar`, payload).pipe(
      tap(response => {
        // Si el registro NO devuelve un token, 
        // podrías llamar a login() aquí automáticamente.
        // Si SÍ devuelve token, usa manejarRespuestaAutenticacion
        
        // Por ahora, solo redirigimos a login
        console.log('Registro exitoso', response);
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.usuarioLogueado.set(false);
    this.rolUsuario.set('');
    this.router.navigate(['/login']);
  }

  estaLogueado(): boolean {
    const token = this.getToken();
    return !!token && !this.esTokenExpirado(token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private manejarRespuestaAutenticacion(token: string): void {
    if (this.esTokenExpirado(token)) {
      this.logout();
      return;
    }
    localStorage.setItem('jwt_token', token);
    this.procesarToken(token);
  }

  // 4. Procesar Token (adaptado a tu AuthResponseDTO)
  private procesarToken(token: string): void {
     try {
      const payload: DecodedToken = jwtDecode(token);
      this.usuarioLogueado.set(true);
      this.rolUsuario.set(payload.rol || ''); // Guardamos el rol
    } catch (error) {
      console.error('Error al decodificar el token JWT:', error);
      this.logout();
    }
  }

  private esTokenExpirado(token: string): boolean {
    try {
      const payload: DecodedToken = jwtDecode(token);
      if (!payload.exp) return true;
      const fechaExpiracion = payload.exp * 1000;
      return fechaExpiracion < Date.now();
    } catch (error) {
      return true;
    }
  }
}