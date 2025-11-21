import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutenticacionService } from '../../services/autenticacion.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private autenticacionService: AutenticacionService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.autenticacionService.getToken();
    const esApiUrl = request.url.startsWith(this.autenticacionService['apiUrl'].replace('/auth', '')); // Pequeño truco o importa environment

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