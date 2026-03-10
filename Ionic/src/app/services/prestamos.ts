import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class PrestamosService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  async getPrestamos(): Promise<any[]> {
    const url = `${this.baseUrl}/api/prestamos`;

    const res = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });

    return res.data;
  }

  Insertar(payload: PrestamosInsert): Observable<any> {
    const url = `${this.baseUrl}/api/prestamos`;
    return from(
      CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      }).then((res) => res.data)
    );
  }

  ActualizarFechaDevolucion(idPrestamo: number, fechaDevolucion: string): Observable<any> {
    const url = `${this.baseUrl}/api/prestamos/${idPrestamo}`;
    return from(
      CapacitorHttp.put({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: {
          FechaDevolucion: fechaDevolucion,
        },
      }).then((res) => res.data)
    );
  }
}

export interface PrestamosInsert {
  FechaPrestamo: string;
  IdLibro: number;
  IdUsuario: number;
  Latitud?: number;
  Longitud?: number;
}

