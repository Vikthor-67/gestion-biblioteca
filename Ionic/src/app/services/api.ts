import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AutorDetalle, AutorListaItem } from '../autor/autor.module';
import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  async getAutor(): Promise<any[]> {
    const url = `${this.baseUrl}/api/autores`;

    const res = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });

    return res.data;
  }

  async getLibros(): Promise<any[]> {
    const url = `${this.baseUrl}/api/libros`;

    const res = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });

    return res.data;
  }

  async getPrestamos(): Promise<any[]> {
    const url = `${this.baseUrl}/api/prestamos`;

    const res = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });

    return res.data;
  }

  async getUsuarios(): Promise<any[]> {
    const url = `${this.baseUrl}/api/usuarios`;

    const res = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });

    return res.data;
  }

  // Se agrego el ID
  getAutorxID(IdAutor: number): Observable<AutorDetalle> {
    return this.http.get<AutorDetalle>(
      `${this.baseUrl}/api/autores/${IdAutor}`,
    );
  }
}
