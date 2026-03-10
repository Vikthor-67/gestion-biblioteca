import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class LibrosService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  async getLibros(): Promise<any[]> {
    const url = `${this.baseUrl}/api/libros`;

    const res = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });

    return res.data;
  }

  Insertar(payload: LibrosInsert): Observable<any> {
    const url = `${this.baseUrl}/api/libros`;
    return from(
      CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      }).then((res) => res.data)
    );
  }
}

export interface LibrosInsert {
  Titulo: string;
  AnioPublicacion: number;
  Genero: string;
  IdAutor: number;
}
