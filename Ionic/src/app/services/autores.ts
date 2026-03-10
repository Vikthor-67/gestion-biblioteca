import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { from, Observable } from 'rxjs';
import { AutorDetalle } from '../autor/autor.module';
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

  // Se agrego el ID
  getAutorxID(IdAutor: number): Observable<AutorDetalle> {
    return this.http.get<AutorDetalle>(
      `${this.baseUrl}/api/autores/${IdAutor}`,
    );
  }

  Insertar(payload: AutoresInsert): Observable<any> {
    const url = `${this.baseUrl}/api/autores`;
    return from(
      CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      }).then((res) => res.data)
    );
  }
}

export interface AutoresInsert {
  Nombre: string;
  Nacionalidad: string;
}
