import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = 'http://192.168.1.9:3001';

  constructor(private http: HttpClient) {
    console.log('API URL en uso:', this.apiUrl);
  }

  getAutor(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/autores`);
  }

  getLibros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/libros`);
  }

  getPrestamos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/prestamos`);
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/usuarios`);
  }
}
