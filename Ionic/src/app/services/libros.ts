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

  private resolverRespuestaHttp(res: any): any {
    const status = Number(res?.status || 0);
    if (status >= 200 && status < 300) {
      return res?.data;
    }

    throw new Error(res?.data?.message || 'Ocurrio un error en la solicitud.');
  }

  async getLibros(): Promise<any[]> {
    const url = `${this.baseUrl}/api/libros`;

    const res = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });

    return res.data;
  }

  async getLibroxID(idLibro: number): Promise<any> {
    const url = `${this.baseUrl}/api/libros/${idLibro}`;

    const res = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });

    return this.resolverRespuestaHttp(res);
  }

  Insertar(payload: LibrosInsert): Observable<any> {
    const url = `${this.baseUrl}/api/libros`;
    return from(
      CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      }).then((res) => this.resolverRespuestaHttp(res))
    );
  }

  Actualizar(idLibro: number, payload: LibrosUpdate): Observable<any> {
    const url = `${this.baseUrl}/api/libros/${idLibro}`;
    return from(
      CapacitorHttp.put({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      }).then((res) => this.resolverRespuestaHttp(res))
    );
  }

  Eliminar(idLibro: number): Observable<any> {
    const url = `${this.baseUrl}/api/libros/${idLibro}`;
    return from(
      CapacitorHttp.delete({
        url,
        headers: { Accept: 'application/json' },
      }).then((res) => this.resolverRespuestaHttp(res))
    );
  }
}

export interface LibrosInsert {
  Titulo: string;
  AnioPublicacion: number;
  Genero: string;
  IdAutor: number;
  Stock: number;
}

export interface LibrosUpdate {
  Titulo: string;
  IdAutor: number;
  AnioPublicacion?: number;
  Genero?: string;
  Stock?: number;
}
