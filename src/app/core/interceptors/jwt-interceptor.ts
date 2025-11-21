import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutenticacionService } from '../../services/autenticacion.service';
import { environment } from '../../environments/environments'; // <--- IMPORTA ESTO

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private autenticacionService: AutenticacionService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.autenticacionService.getToken();
    
    // Usamos environment.apiUrl directamente para asegurar que la comparación funciona
    const esApiUrl = request.url.startsWith(environment.apiUrl);

    if (token && esApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}